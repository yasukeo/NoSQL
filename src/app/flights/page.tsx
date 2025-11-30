'use client';

import { useState, useEffect } from 'react';
import { Flight } from '@/types';

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState({
    flno: '', origin: '', destination: '', distance: 0,
    departure_date: '', arrival_date: '', departure_time: '',
    arrival_time: '', price: 0, aid: '', available_seats: 0
  });

  // Charger les vols au démarrage
  useEffect(() => {
    fetchFlights();
  }, []);

  // READ - Récupérer tous les vols
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

  // CREATE - Ajouter un nouveau vol
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

  // UPDATE - Modifier un vol existant
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

  // DELETE - Supprimer un vol
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

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">✈️ Gestion des Vols</h1>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? '✕ Fermer' : '+ Nouveau Vol'}
        </button>
      </div>

      {/* Formulaire CREATE/UPDATE */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingFlight ? '✏️ Modifier le Vol' : '➕ Nouveau Vol'}
          </h2>
          <form onSubmit={editingFlight ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input type="text" placeholder="N° Vol (FL001)" value={formData.flno}
              onChange={(e) => setFormData({...formData, flno: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Origine" value={formData.origin}
              onChange={(e) => setFormData({...formData, origin: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Destination" value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              className="border rounded p-2" required />
            <input type="number" placeholder="Distance (km)" value={formData.distance || ''}
              onChange={(e) => setFormData({...formData, distance: Number(e.target.value)})}
              className="border rounded p-2" required />
            <input type="date" placeholder="Date départ" value={formData.departure_date}
              onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
              className="border rounded p-2" required />
            <input type="date" placeholder="Date arrivée" value={formData.arrival_date}
              onChange={(e) => setFormData({...formData, arrival_date: e.target.value})}
              className="border rounded p-2" required />
            <input type="time" placeholder="Heure départ" value={formData.departure_time}
              onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
              className="border rounded p-2" required />
            <input type="time" placeholder="Heure arrivée" value={formData.arrival_time}
              onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
              className="border rounded p-2" required />
            <input type="number" step="0.01" placeholder="Prix (€)" value={formData.price || ''}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              className="border rounded p-2" required />
            <input type="text" placeholder="ID Avion" value={formData.aid}
              onChange={(e) => setFormData({...formData, aid: e.target.value})}
              className="border rounded p-2" required />
            <input type="number" placeholder="Sièges disponibles" value={formData.available_seats || ''}
              onChange={(e) => setFormData({...formData, available_seats: Number(e.target.value)})}
              className="border rounded p-2" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {editingFlight ? '💾 Enregistrer' : '➕ Ajouter'}
            </button>
          </form>
        </div>
      )}

      {/* Tableau des vols */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">N° Vol</th>
              <th className="px-4 py-3 text-left">Origine</th>
              <th className="px-4 py-3 text-left">Destination</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Horaires</th>
              <th className="px-4 py-3 text-left">Prix</th>
              <th className="px-4 py-3 text-left">Places</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight: any) => (
              <tr key={flight._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{flight.flno}</td>
                <td className="px-4 py-3">{flight.origin}</td>
                <td className="px-4 py-3">{flight.destination}</td>
                <td className="px-4 py-3">{flight.departure_date}</td>
                <td className="px-4 py-3">{flight.departure_time} → {flight.arrival_time}</td>
                <td className="px-4 py-3 font-semibold text-green-600">{flight.price} €</td>
                <td className="px-4 py-3">{flight.available_seats}</td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(flight)}
                    className="text-blue-600 hover:underline mr-3">✏️ Modifier</button>
                  <button onClick={() => handleDelete(flight._id)}
                    className="text-red-600 hover:underline">🗑️ Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
