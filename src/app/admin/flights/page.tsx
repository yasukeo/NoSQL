'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flight } from '@/types';

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    flno: '', origin: '', destination: '', distance: 0,
    departure_date: '', arrival_date: '', departure_time: '',
    arrival_time: '', price: 0, aid: '', available_seats: 0
  });

  useEffect(() => {
    fetchFlights();
  }, []);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchFlights();
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlight?._id) return;
    try {
      const res = await fetch('/api/flights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editingFlight._id, ...formData })
      });
      if (res.ok) {
        fetchFlights();
        setEditingFlight(null);
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) return;
    try {
      const res = await fetch(`/api/flights?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFlights();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const startEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFormData({
      flno: flight.flno, origin: flight.origin, destination: flight.destination,
      distance: flight.distance, departure_date: flight.departure_date,
      arrival_date: flight.arrival_date, departure_time: flight.departure_time,
      arrival_time: flight.arrival_time, price: flight.price,
      aid: flight.aid, available_seats: flight.available_seats
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      flno: '', origin: '', destination: '', distance: 0,
      departure_date: '', arrival_date: '', departure_time: '',
      arrival_time: '', price: 0, aid: '', available_seats: 0
    });
    setEditingFlight(null);
  };

  const filteredFlights = flights.filter(f => 
    f.flno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Admin */}
      <nav className="bg-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold flex items-center space-x-2">
              <span>✈️</span>
              <span>SkyFlight Admin</span>
            </Link>
            <div className="flex space-x-2">
              <Link href="/admin" className="hover:bg-purple-600 px-3 py-2 rounded">Dashboard</Link>
              <Link href="/admin/flights" className="bg-purple-800 px-3 py-2 rounded">Vols</Link>
              <Link href="/admin/aircraft" className="hover:bg-purple-600 px-3 py-2 rounded">Avions</Link>
              <Link href="/admin/employees" className="hover:bg-purple-600 px-3 py-2 rounded">Employés</Link>
              <Link href="/admin/passengers" className="hover:bg-purple-600 px-3 py-2 rounded">Passagers</Link>
              <Link href="/admin/bookings" className="hover:bg-purple-600 px-3 py-2 rounded">Réservations</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">✈️ Gestion des Vols</h1>
            <p className="text-gray-600">Total: {flights.length} vols</p>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-4 py-2"
            />
            <button
              onClick={() => { setShowForm(!showForm); resetForm(); }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              {showForm ? '✕ Fermer' : '+ Nouveau Vol'}
            </button>
          </div>
        </div>

        {/* Formulaire CREATE/UPDATE */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingFlight ? '✏️ Modifier le Vol' : '➕ Nouveau Vol'}
            </h2>
            <form onSubmit={editingFlight ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">N° Vol</label>
                <input type="text" placeholder="FL001" value={formData.flno}
                  onChange={(e) => setFormData({...formData, flno: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Origine</label>
                <input type="text" placeholder="Paris" value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Destination</label>
                <input type="text" placeholder="New York" value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Distance (km)</label>
                <input type="number" placeholder="5000" value={formData.distance || ''}
                  onChange={(e) => setFormData({...formData, distance: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date départ</label>
                <input type="date" value={formData.departure_date}
                  onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date arrivée</label>
                <input type="date" value={formData.arrival_date}
                  onChange={(e) => setFormData({...formData, arrival_date: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Heure départ</label>
                <input type="time" value={formData.departure_time}
                  onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Heure arrivée</label>
                <input type="time" value={formData.arrival_time}
                  onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prix ($)</label>
                <input type="number" step="0.01" placeholder="299.99" value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID Avion</label>
                <input type="text" placeholder="A001" value={formData.aid}
                  onChange={(e) => setFormData({...formData, aid: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Places disponibles</label>
                <input type="number" placeholder="150" value={formData.available_seats || ''}
                  onChange={(e) => setFormData({...formData, available_seats: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div className="flex items-end">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full">
                  {editingFlight ? '💾 Enregistrer' : '➕ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tableau des vols */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">N° Vol</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Trajet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Horaires</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Prix</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Places</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map((flight: any) => (
                <tr key={flight._id} className="border-b hover:bg-purple-50/50">
                  <td className="px-4 py-3 font-semibold text-purple-700">{flight.flno}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-800">{flight.origin}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-gray-800">{flight.destination}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{flight.departure_date}</td>
                  <td className="px-4 py-3 text-gray-600">{flight.departure_time} - {flight.arrival_time}</td>
                  <td className="px-4 py-3 font-bold text-green-600">${flight.price}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      flight.available_seats > 50 ? 'bg-green-100 text-green-800' :
                      flight.available_seats > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {flight.available_seats}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(flight)}
                      className="text-blue-600 hover:bg-blue-100 px-2 py-1 rounded mr-2">✏️</button>
                    <button onClick={() => handleDelete(flight._id)}
                      className="text-red-600 hover:bg-red-100 px-2 py-1 rounded">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFlights.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucun vol trouvé</div>
          )}
        </div>
      </main>
    </div>
  );
}
