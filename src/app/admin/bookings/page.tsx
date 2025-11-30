'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
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

  const updateStatus = async (id: string, newStatus: string) => {
    const booking = bookings.find(b => b._id === id);
    if (!booking) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, status: newStatus })
      });
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

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.bid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.flno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistiques rapides
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

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
              <Link href="/admin/flights" className="hover:bg-purple-600 px-3 py-2 rounded">Vols</Link>
              <Link href="/admin/aircraft" className="hover:bg-purple-600 px-3 py-2 rounded">Avions</Link>
              <Link href="/admin/employees" className="hover:bg-purple-600 px-3 py-2 rounded">Employés</Link>
              <Link href="/admin/passengers" className="hover:bg-purple-600 px-3 py-2 rounded">Passagers</Link>
              <Link href="/admin/bookings" className="bg-purple-800 px-3 py-2 rounded">Réservations</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🎫 Gestion des Réservations</h1>
            <p className="text-gray-600">Total: {bookings.length} réservations</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); resetForm(); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            {showForm ? '✕ Fermer' : '+ Nouvelle Réservation'}
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 text-center cursor-pointer hover:bg-green-100"
            onClick={() => setFilterStatus(filterStatus === 'Confirmed' ? '' : 'Confirmed')}>
            <p className="text-green-600 text-sm">Confirmées</p>
            <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 text-center cursor-pointer hover:bg-yellow-100"
            onClick={() => setFilterStatus(filterStatus === 'Pending' ? '' : 'Pending')}>
            <p className="text-yellow-600 text-sm">En attente</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 text-center cursor-pointer hover:bg-red-100"
            onClick={() => setFilterStatus(filterStatus === 'Cancelled' ? '' : 'Cancelled')}>
            <p className="text-red-600 text-sm">Annulées</p>
            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex space-x-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par ID, vol ou passager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1"
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-4 py-2">
            <option value="">Tous les statuts</option>
            <option value="Confirmed">Confirmées</option>
            <option value="Pending">En attente</option>
            <option value="Cancelled">Annulées</option>
          </select>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingBooking ? '✏️ Modifier la Réservation' : '➕ Nouvelle Réservation'}
            </h2>
            <form onSubmit={editingBooking ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID Réservation</label>
                <input type="text" placeholder="B019" value={formData.bid}
                  onChange={(e) => setFormData({...formData, bid: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Passager</label>
                <select value={formData.pid} onChange={(e) => setFormData({...formData, pid: e.target.value})}
                  className="border rounded-lg p-2 w-full" required>
                  <option value="">-- Sélectionner --</option>
                  {passengers.map((p: any) => (
                    <option key={p.pid} value={p.pid}>{p.first_name} {p.last_name} ({p.pid})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vol</label>
                <select value={formData.flno} onChange={(e) => setFormData({...formData, flno: e.target.value})}
                  className="border rounded-lg p-2 w-full" required>
                  <option value="">-- Sélectionner --</option>
                  {flights.map((f: any) => (
                    <option key={f.flno} value={f.flno}>{f.flno}: {f.origin} → {f.destination}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input type="date" value={formData.booking_date}
                  onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Siège</label>
                <input type="text" placeholder="12A" value={formData.seat_number}
                  onChange={(e) => setFormData({...formData, seat_number: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Classe</label>
                <select value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value as any})}
                  className="border rounded-lg p-2 w-full" required>
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Statut</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="border rounded-lg p-2 w-full" required>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prix ($)</label>
                <input type="number" step="0.01" placeholder="299.99" value={formData.price_paid || ''}
                  onChange={(e) => setFormData({...formData, price_paid: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div className="flex items-end col-span-2 md:col-span-1">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full">
                  {editingBooking ? '💾 Enregistrer' : '➕ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tableau des réservations */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Passager</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Vol</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Trajet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Siège</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Classe</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Prix</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((item: any) => (
                <tr key={item._id} className="border-b hover:bg-purple-50/50">
                  <td className="px-4 py-3 font-semibold text-purple-700">{item.bid}</td>
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getClassBadge(item.class)}`}>
                      {item.class}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={item.status}
                      onChange={(e) => updateStatus(item._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getStatusBadge(item.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 font-bold text-green-600">${item.price_paid}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(item)}
                      className="text-blue-600 hover:bg-blue-100 px-2 py-1 rounded mr-2">✏️</button>
                    <button onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:bg-red-100 px-2 py-1 rounded">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucune réservation trouvée</div>
          )}
        </div>
      </main>
    </div>
  );
}
