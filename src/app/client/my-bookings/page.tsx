'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  uid: string;
  email: string;
  name: string;
  role: string;
}

interface Booking {
  _id: string;
  bid: string;
  pid: string;
  flno: string;
  booking_date: string;
  seat_number: string;
  class: string;
  status: string;
  price_paid: number;
}

interface Flight {
  flno: string;
  origin: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  distance: number;
}

interface Passenger {
  pid: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      const parsedUser = JSON.parse(storedUser) as User;
      if (parsedUser.role !== 'client') {
        router.push('/admin');
        return;
      }
      setUser(parsedUser);
      fetchData(parsedUser.email);
    } catch (error) {
      console.error('Erreur auth:', error);
      router.push('/login');
    }
  };

  const fetchData = async (userEmail: string) => {
    try {
      // Récupérer toutes les données
      const [bookingsRes, flightsRes, passengersRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/flights'),
        fetch('/api/passengers')
      ]);

      const [allBookings, allFlights, allPassengers] = await Promise.all([
        bookingsRes.json(),
        flightsRes.json(),
        passengersRes.json()
      ]);

      setFlights(allFlights);
      setPassengers(allPassengers);

      // Trouver le passager correspondant à l'email de l'utilisateur
      const userPassenger = allPassengers.find((p: Passenger) => p.email === userEmail);
      
      if (userPassenger) {
        // Filtrer les réservations de ce passager
        const userBookings = allBookings.filter((b: Booking) => b.pid === userPassenger.pid);
        setBookings(userBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlightInfo = (flno: string) => {
    return flights.find(f => f.flno === flno);
  };

  // Vérifier si l'annulation est possible (24h avant le vol)
  const canCancel = (booking: Booking) => {
    if (booking.status === 'Cancelled') return false;
    
    const flight = getFlightInfo(booking.flno);
    if (!flight) return false;

    // Combiner date et heure du vol
    const flightDateTime = new Date(`${flight.departure_date}T${flight.departure_time}`);
    const now = new Date();
    const hoursUntilFlight = (flightDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilFlight > 24;
  };

  // Calculer le temps restant avant le vol
  const getTimeUntilFlight = (booking: Booking) => {
    const flight = getFlightInfo(booking.flno);
    if (!flight) return null;

    const flightDateTime = new Date(`${flight.departure_date}T${flight.departure_time}`);
    const now = new Date();
    const hoursUntilFlight = (flightDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilFlight < 0) return 'Vol passé';
    if (hoursUntilFlight < 24) return `${Math.round(hoursUntilFlight)}h restantes`;
    const days = Math.floor(hoursUntilFlight / 24);
    return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
  };

  // Annuler une réservation
  const handleCancel = async (booking: Booking) => {
    if (!canCancel(booking)) {
      alert('Annulation impossible : le vol part dans moins de 24 heures.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    setCancellingId(booking.bid);

    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bid: booking.bid,
          status: 'Cancelled'
        })
      });

      if (res.ok) {
        // Mettre à jour l'état local
        setBookings(prev => prev.map(b => 
          b.bid === booking.bid ? { ...b, status: 'Cancelled' } : b
        ));
        alert('Réservation annulée avec succès. Vous serez remboursé sous 5-7 jours ouvrés.');
      } else {
        alert('Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'annulation');
    } finally {
      setCancellingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  // Fonction pour vérifier si un vol est passé
  const isFlightPast = (booking: Booking) => {
    const flight = getFlightInfo(booking.flno);
    if (!flight) return false;
    const flightDateTime = new Date(`${flight.departure_date}T${flight.departure_time}`);
    return flightDateTime < new Date();
  };

  // Séparer les réservations par statut (sans duplication)
  const activeBookings = bookings.filter(b => 
    (b.status === 'Confirmed' || b.status === 'Pending') && !isFlightPast(b)
  );
  const pastBookings = bookings.filter(b => 
    b.status === 'Cancelled' || isFlightPast(b)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">✈️ SkyFlight Airlines</Link>
          <div className="flex items-center space-x-4">
            <Link href="/client" className="text-white/80 hover:text-white">
              Réserver un vol
            </Link>
            <Link href="/client/my-bookings" className="text-white font-medium border-b-2 border-white">
              Mes réservations
            </Link>
            <div className="border-l border-white/30 pl-4 flex items-center space-x-3">
              <span className="text-white/80">{user.name}</span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">📋 Mes Réservations</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucune réservation</h2>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore effectué de réservation.</p>
            <Link 
              href="/client"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              ✈️ Réserver un vol
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Réservations actives */}
            {activeBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">🎫 Réservations à venir ({activeBookings.length})</h2>
                <div className="space-y-4">
                  {activeBookings.map((booking) => {
                    const flight = getFlightInfo(booking.flno);
                    const canCancelBooking = canCancel(booking);
                    const timeUntil = getTimeUntilFlight(booking);

                    return (
                      <div key={booking.bid} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status === 'Confirmed' ? '✓ Confirmée' : '⏳ En attente'}
                              </span>
                              <span className="ml-3 text-gray-500 text-sm">
                                Réservation #{booking.bid}
                              </span>
                            </div>
                            {timeUntil && (
                              <span className="text-sm text-blue-600 font-medium">
                                ⏱️ {timeUntil}
                              </span>
                            )}
                          </div>

                          {flight && (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                                    {flight.flno}
                                  </span>
                                  <span className="text-gray-500">{flight.departure_date}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-lg">
                                  <div className="text-center">
                                    <p className="font-bold text-gray-800">{flight.departure_time}</p>
                                    <p className="text-gray-600">{flight.origin}</p>
                                  </div>
                                  <div className="flex-1 flex items-center px-4">
                                    <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                                    <span className="px-3 text-gray-400">✈️</span>
                                    <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-bold text-gray-800">{flight.arrival_time}</p>
                                    <p className="text-gray-600">{flight.destination}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-6 text-right">
                                <div className="text-sm text-gray-500 mb-1">
                                  Siège: <span className="font-bold text-gray-800">{booking.seat_number}</span>
                                </div>
                                <div className="text-sm text-gray-500 mb-1">
                                  Classe: <span className="font-medium">{booking.class}</span>
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                  {booking.price_paid.toFixed(2)} €
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              Réservé le {booking.booking_date}
                            </p>
                            {canCancelBooking ? (
                              <button
                                onClick={() => handleCancel(booking)}
                                disabled={cancellingId === booking.bid}
                                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition font-medium disabled:opacity-50"
                              >
                                {cancellingId === booking.bid ? 'Annulation...' : '✕ Annuler la réservation'}
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Annulation impossible (moins de 24h)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historique */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">📜 Historique ({pastBookings.length})</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => {
                    const flight = getFlightInfo(booking.flno);

                    return (
                      <div key={booking.bid} className="bg-white/80 rounded-xl shadow-lg overflow-hidden opacity-75">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'Cancelled' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status === 'Cancelled' ? '✕ Annulée' : '✓ Terminé'}
                              </span>
                              <span className="ml-3 text-gray-500 text-sm">
                                Réservation #{booking.bid}
                              </span>
                            </div>
                          </div>

                          {flight && (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
                                    {flight.flno}
                                  </span>
                                  <span className="text-gray-500">{flight.departure_date}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-600">{flight.origin}</span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-gray-600">{flight.destination}</span>
                                </div>
                              </div>

                              <div className="ml-6 text-right">
                                <div className="text-sm text-gray-500">
                                  {booking.class} • Siège {booking.seat_number}
                                </div>
                                <div className="font-bold text-gray-600">
                                  {booking.price_paid.toFixed(2)} €
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bouton nouvelle réservation */}
        <div className="mt-8 text-center">
          <Link 
            href="/client"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
          >
            ✈️ Nouvelle réservation
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-white/70">
          <p>© 2024 SkyFlight Airlines - Projet NoSQL MongoDB</p>
        </div>
      </footer>
    </div>
  );
}
