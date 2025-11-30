'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    bid: '', pid: '', flno: '', booking_date: '',
    seat_number: '', class: 'Economy' as const, status: 'Pending' as const, price_paid: 0
  });

  useEffect(() => { 
    fetchBookings(); 
    fetchFlights();
    fetchPassengers();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (error) { console.error('Erreur:', error); }
    finally { setLoading(false); }
  };

  const fetchFlights = async () => {
    const res = await fetch('/api/flights');
    setFlights(await res.json());
  };

  const fetchPassengers = async () => {
    const res = await fetch('/api/passengers');
    setPassengers(await res.json());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { fetchBookings(); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking?._id) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editingBooking._id, ...formData })
      });
      if (res.ok) { fetchBookings(); setEditingBooking(null); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette réservation ?')) return;
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchBookings();
    } catch (error) { console.error('Erreur:', error); }
  };

  const startEdit = (item: any) => {
    setEditingBooking(item);
    setFormData({
      bid: item.bid, pid: item.pid, flno: item.flno,
      booking_date: item.booking_date, seat_number: item.seat_number,
      class: item.class, status: item.status, price_paid: item.price_paid
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      bid: '', pid: '', flno: '', booking_date: '',
      seat_number: '', class: 'Economy', status: 'Pending', price_paid: 0
    });
    setEditingBooking(null);
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      'Confirmed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getClassBadge = (cls: string) => {
    const colors: { [key: string]: string } = {
      'First': 'bg-purple-100 text-purple-800',
      'Business': 'bg-blue-100 text-blue-800',
      'Economy': 'bg-gray-100 text-gray-800',
    };
    return colors[cls] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎫 Gestion des Réservations</h1>
        <button onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          {showForm ? '✕ Fermer' : '+ Nouvelle Réservation'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBooking ? '✏️ Modifier la Réservation' : '➕ Nouvelle Réservation'}
          </h2>
          <form onSubmit={editingBooking ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input type="text" placeholder="ID Réservation (B001)" value={formData.bid}
              onChange={(e) => setFormData({...formData, bid: e.target.value})}
              className="border rounded p-2" required />
            <select value={formData.pid} onChange={(e) => setFormData({...formData, pid: e.target.value})}
              className="border rounded p-2" required>
              <option value="">-- Sélectionner un passager --</option>
              {passengers.map((p: any) => (
                <option key={p.pid} value={p.pid}>{p.first_name} {p.last_name} ({p.pid})</option>
              ))}
            </select>
            <select value={formData.flno} onChange={(e) => setFormData({...formData, flno: e.target.value})}
              className="border rounded p-2" required>
              <option value="">-- Sélectionner un vol --</option>
              {flights.map((f: any) => (
                <option key={f.flno} value={f.flno}>{f.flno}: {f.origin} → {f.destination}</option>
              ))}
            </select>
            <input type="date" placeholder="Date réservation" value={formData.booking_date}
              onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Siège (12A)" value={formData.seat_number}
              onChange={(e) => setFormData({...formData, seat_number: e.target.value})}
              className="border rounded p-2" required />
            <select value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value as any})}
              className="border rounded p-2" required>
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              className="border rounded p-2" required>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input type="number" step="0.01" placeholder="Prix payé (€)" value={formData.price_paid || ''}
              onChange={(e) => setFormData({...formData, price_paid: Number(e.target.value)})}
              className="border rounded p-2" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {editingBooking ? '💾 Enregistrer' : '➕ Ajouter'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Passager</th>
              <th className="px-4 py-3 text-left">Vol</th>
              <th className="px-4 py-3 text-left">Trajet</th>
              <th className="px-4 py-3 text-left">Siège</th>
              <th className="px-4 py-3 text-left">Classe</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Prix</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item: any) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.bid}</td>
                <td className="px-4 py-3">
                  {item.passenger_info 
                    ? `${item.passenger_info.first_name} ${item.passenger_info.last_name}`
                    : item.pid}
                </td>
                <td className="px-4 py-3 font-medium">{item.flno}</td>
                <td className="px-4 py-3 text-sm">
                  {item.flight_info 
                    ? `${item.flight_info.origin} → ${item.flight_info.destination}`
                    : '-'}
                </td>
                <td className="px-4 py-3 font-mono">{item.seat_number}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${getClassBadge(item.class)}`}>
                    {item.class}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-green-600">{item.price_paid} €</td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(item)} className="text-blue-600 hover:underline mr-3">✏️</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
