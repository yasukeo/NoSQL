'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  uid: string;
  email: string;
  name: string;
  role: string;
}

export default function ClientBookingPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(1); // 1: Recherche, 2: Sélection vol, 3: Infos passager, 4: Confirmation
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: ''
  });
  const [filteredFlights, setFilteredFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<'Economy' | 'Business' | 'First'>('Economy');
  const [passengerInfo, setPassengerInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    passport_number: '',
    nationality: '',
    date_of_birth: ''
  });
  const [bookingComplete, setBookingComplete] = useState<any>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    checkAuth();
    fetchFlights();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.role === 'client') {
          setUser(parsedUser);
          
          // Pré-remplir l'email si connecté
          setPassengerInfo(prev => ({ ...prev, email: parsedUser.email }));
          
          // Chercher si ce client a déjà un profil passager
          try {
            const passengersRes = await fetch('/api/passengers');
            const passengers = await passengersRes.json();
            const existingPassenger = passengers.find((p: any) => p.email === parsedUser.email);
            
            if (existingPassenger) {
              // Pré-remplir toutes les infos
              setPassengerInfo({
                first_name: existingPassenger.first_name || '',
                last_name: existingPassenger.last_name || '',
                email: existingPassenger.email || parsedUser.email,
                phone: existingPassenger.phone || '',
                passport_number: existingPassenger.passport_number || '',
                nationality: existingPassenger.nationality || '',
                date_of_birth: existingPassenger.date_of_birth || ''
              });
            }
          } catch (e) {
            console.error('Erreur récupération passager:', e);
          }
        }
      }
    } catch (error) {
      console.error('Erreur auth:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const fetchFlights = async () => {
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      setFlights(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recherche de vols
  const handleSearch = () => {
    let results = flights;
    
    if (searchParams.origin) {
      results = results.filter(f => 
        f.origin.toLowerCase().includes(searchParams.origin.toLowerCase())
      );
    }
    if (searchParams.destination) {
      results = results.filter(f => 
        f.destination.toLowerCase().includes(searchParams.destination.toLowerCase())
      );
    }
    if (searchParams.date) {
      results = results.filter(f => f.departure_date === searchParams.date);
    }
    
    setFilteredFlights(results);
    setStep(2);
  };

  // Sélection d'un vol
  const selectFlight = (flight: any) => {
    setSelectedFlight(flight);
    setStep(3);
  };

  // Calculer le prix selon la classe
  const calculatePrice = (basePrice: number, flightClass: string) => {
    switch (flightClass) {
      case 'Business': return basePrice * 2.5;
      case 'First': return basePrice * 4;
      default: return basePrice;
    }
  };

  // Générer un numéro de siège aléatoire
  const generateSeatNumber = (flightClass: string) => {
    const row = flightClass === 'First' ? Math.floor(Math.random() * 5) + 1 :
                flightClass === 'Business' ? Math.floor(Math.random() * 10) + 6 :
                Math.floor(Math.random() * 30) + 16;
    const seat = ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)];
    return `${row}${seat}`;
  };

  // Soumettre la réservation
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Créer ou récupérer le passager
      const passengersRes = await fetch('/api/passengers');
      const passengers = await passengersRes.json();
      let passenger = passengers.find((p: any) => p.email === passengerInfo.email);
      
      if (!passenger) {
        // Créer un nouveau passager
        const newPassengerId = `P${String(passengers.length + 1).padStart(3, '0')}`;
        const createPassengerRes = await fetch('/api/passengers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pid: newPassengerId,
            ...passengerInfo
          })
        });
        if (createPassengerRes.ok) {
          passenger = { pid: newPassengerId, ...passengerInfo };
        }
      }

      // 2. Créer la réservation
      const bookingsRes = await fetch('/api/bookings');
      const bookings = await bookingsRes.json();
      const newBookingId = `B${String(bookings.length + 1).padStart(3, '0')}`;
      
      const bookingData = {
        bid: newBookingId,
        pid: passenger.pid,
        flno: selectedFlight.flno,
        booking_date: new Date().toISOString().split('T')[0],
        seat_number: generateSeatNumber(selectedClass),
        class: selectedClass,
        status: 'Confirmed',
        price_paid: calculatePrice(selectedFlight.price, selectedClass)
      };

      const createBookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (createBookingRes.ok) {
        setBookingComplete({
          ...bookingData,
          passenger: passengerInfo,
          flight: selectedFlight
        });
        setStep(4);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation');
    }
  };

  // Obtenir les villes uniques
  const getUniqueOrigins = () => [...new Set(flights.map(f => f.origin))];
  const getUniqueDestinations = () => [...new Set(flights.map(f => f.destination))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">✈️ SkyFlight Airlines</Link>
          
          {user ? (
            // Utilisateur connecté
            <div className="flex items-center space-x-4">
              <Link href="/client" className="text-white font-medium border-b-2 border-white">
                Réserver un vol
              </Link>
              <Link href="/client/my-bookings" className="text-white/80 hover:text-white">
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
          ) : (
            // Utilisateur non connecté
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-white/80 hover:text-white text-sm">
                🔐 Connexion
              </Link>
              <Link href="/register" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${step >= s ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}>
                  {s === 4 && step === 4 ? '✓' : s}
                </div>
                {s < 4 && <div className={`w-12 h-1 ${step > s ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Recherche */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🔍 Rechercher un Vol
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ville de départ</label>
                <select
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams({...searchParams, origin: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Toutes les villes</option>
                  {getUniqueOrigins().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Ville d'arrivée</label>
                <select
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Toutes les villes</option>
                  {getUniqueDestinations().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date de départ</label>
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
              >
                🔍 Rechercher des vols
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Liste des vols */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ✈️ Vols disponibles ({filteredFlights.length})
              </h2>
              <button onClick={() => setStep(1)} className="text-blue-600 hover:underline">
                ← Modifier la recherche
              </button>
            </div>
            
            {filteredFlights.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl">Aucun vol trouvé</p>
                <button onClick={() => setStep(1)} className="mt-4 text-blue-600 hover:underline">
                  Modifier votre recherche
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <div key={flight._id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                            {flight.flno}
                          </span>
                          <span className="text-gray-500">{flight.departure_date}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xl">
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
                        <p className="text-gray-500 mt-2">
                          {flight.distance} km • {flight.available_seats} places disponibles
                        </p>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-sm text-gray-500">À partir de</p>
                        <p className="text-3xl font-bold text-green-600">{flight.price} €</p>
                        <button
                          onClick={() => selectFlight(flight)}
                          className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          Sélectionner
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Informations passager */}
        {step === 3 && selectedFlight && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Formulaire passager */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                👤 Informations du Passager
              </h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={passengerInfo.first_name}
                      onChange={(e) => setPassengerInfo({...passengerInfo, first_name: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nom *</label>
                    <input
                      type="text"
                      required
                      value={passengerInfo.last_name}
                      onChange={(e) => setPassengerInfo({...passengerInfo, last_name: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={passengerInfo.email}
                      onChange={(e) => setPassengerInfo({...passengerInfo, email: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={passengerInfo.phone}
                      onChange={(e) => setPassengerInfo({...passengerInfo, phone: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">N° Passeport *</label>
                    <input
                      type="text"
                      required
                      value={passengerInfo.passport_number}
                      onChange={(e) => setPassengerInfo({...passengerInfo, passport_number: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nationalité *</label>
                    <input
                      type="text"
                      required
                      value={passengerInfo.nationality}
                      onChange={(e) => setPassengerInfo({...passengerInfo, nationality: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Date de naissance *</label>
                  <input
                    type="date"
                    required
                    value={passengerInfo.date_of_birth}
                    onChange={(e) => setPassengerInfo({...passengerInfo, date_of_birth: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Sélection de classe */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Classe de voyage</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['Economy', 'Business', 'First'] as const).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`p-4 rounded-xl border-2 transition ${
                          selectedClass === cls 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-bold">{cls}</p>
                        <p className="text-green-600 font-semibold">
                          {calculatePrice(selectedFlight.price, cls).toFixed(2)} €
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    ✓ Confirmer la réservation
                  </button>
                </div>
              </form>
            </div>

            {/* Récapitulatif vol */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Récapitulatif</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 font-medium">{selectedFlight.flno}</p>
                  <p className="font-bold text-lg">{selectedFlight.origin}</p>
                  <p className="text-gray-500">→</p>
                  <p className="font-bold text-lg">{selectedFlight.destination}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{selectedFlight.departure_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Départ</span>
                    <span className="font-medium">{selectedFlight.departure_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Arrivée</span>
                    <span className="font-medium">{selectedFlight.arrival_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Classe</span>
                    <span className="font-medium">{selectedClass}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {calculatePrice(selectedFlight.price, selectedClass).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && bookingComplete && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Réservation Confirmée !
            </h2>
            <p className="text-gray-500 mb-8">
              Votre numéro de réservation est <span className="font-bold text-blue-600">{bookingComplete.bid}</span>
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
              <h3 className="font-bold text-gray-800 mb-4">📋 Détails de votre vol</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Vol</p>
                  <p className="font-medium">{bookingComplete.flight.flno}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{bookingComplete.flight.departure_date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Trajet</p>
                  <p className="font-medium">{bookingComplete.flight.origin} → {bookingComplete.flight.destination}</p>
                </div>
                <div>
                  <p className="text-gray-500">Horaires</p>
                  <p className="font-medium">{bookingComplete.flight.departure_time} - {bookingComplete.flight.arrival_time}</p>
                </div>
                <div>
                  <p className="text-gray-500">Siège</p>
                  <p className="font-medium">{bookingComplete.seat_number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Classe</p>
                  <p className="font-medium">{bookingComplete.class}</p>
                </div>
                <div>
                  <p className="text-gray-500">Passager</p>
                  <p className="font-medium">{bookingComplete.passenger.first_name} {bookingComplete.passenger.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prix payé</p>
                  <p className="font-bold text-green-600">{bookingComplete.price_paid.toFixed(2)} €</p>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-6">
              Un email de confirmation a été envoyé à <span className="font-medium">{bookingComplete.passenger.email}</span>
            </p>

            <button
              onClick={() => {
                setStep(1);
                setSelectedFlight(null);
                setBookingComplete(null);
                setPassengerInfo({
                  first_name: '', last_name: '', email: '', phone: '',
                  passport_number: '', nationality: '', date_of_birth: ''
                });
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              ✈️ Réserver un autre vol
            </button>
          </div>
        )}
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
