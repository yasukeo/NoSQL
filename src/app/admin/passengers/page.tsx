'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Passenger } from '@/types';

export default function AdminPassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    pid: '', first_name: '', last_name: '', email: '',
    phone: '', passport_number: '', nationality: '', date_of_birth: ''
  });

  useEffect(() => { fetchPassengers(); }, []);

  const fetchPassengers = async () => {
    try {
      const res = await fetch('/api/passengers');
      const data = await res.json();
      setPassengers(data);
    } catch (error) { console.error('Erreur:', error); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/passengers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { fetchPassengers(); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger?._id) return;
    try {
      const res = await fetch('/api/passengers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editingPassenger._id, ...formData })
      });
      if (res.ok) { fetchPassengers(); setEditingPassenger(null); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce passager ?')) return;
    try {
      const res = await fetch(`/api/passengers?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchPassengers();
    } catch (error) { console.error('Erreur:', error); }
  };

  const startEdit = (item: Passenger) => {
    setEditingPassenger(item);
    setFormData({
      pid: item.pid, first_name: item.first_name, last_name: item.last_name,
      email: item.email, phone: item.phone, passport_number: item.passport_number,
      nationality: item.nationality, date_of_birth: item.date_of_birth
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      pid: '', first_name: '', last_name: '', email: '',
      phone: '', passport_number: '', nationality: '', date_of_birth: ''
    });
    setEditingPassenger(null);
  };

  const filteredPassengers = passengers.filter(p =>
    p.pid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nationality.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Link href="/admin/flights" className="hover:bg-purple-600 px-3 py-2 rounded">Vols</Link>
              <Link href="/admin/aircraft" className="hover:bg-purple-600 px-3 py-2 rounded">Avions</Link>
              <Link href="/admin/employees" className="hover:bg-purple-600 px-3 py-2 rounded">Employés</Link>
              <Link href="/admin/passengers" className="bg-purple-800 px-3 py-2 rounded">Passagers</Link>
              <Link href="/admin/bookings" className="hover:bg-purple-600 px-3 py-2 rounded">Réservations</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👤 Gestion des Passagers</h1>
            <p className="text-gray-600">Total: {passengers.length} passagers</p>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-4 py-2"
            />
            <button onClick={() => { setShowForm(!showForm); resetForm(); }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              {showForm ? '✕ Fermer' : '+ Nouveau Passager'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingPassenger ? '✏️ Modifier le Passager' : '➕ Nouveau Passager'}
            </h2>
            <form onSubmit={editingPassenger ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID Passager</label>
                <input type="text" placeholder="P001" value={formData.pid}
                  onChange={(e) => setFormData({...formData, pid: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prénom</label>
                <input type="text" placeholder="Jean" value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nom</label>
                <input type="text" placeholder="Dupont" value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" placeholder="jean@email.com" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
                <input type="tel" placeholder="+33 6 12 34 56 78" value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">N° Passeport</label>
                <input type="text" placeholder="AB123456" value={formData.passport_number}
                  onChange={(e) => setFormData({...formData, passport_number: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nationalité</label>
                <input type="text" placeholder="French" value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date de naissance</label>
                <input type="date" value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div className="flex items-end col-span-2 md:col-span-1">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full">
                  {editingPassenger ? '💾 Enregistrer' : '➕ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tableau des passagers */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Nom Complet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Nationalité</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Passeport</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Téléphone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPassengers.map((item: any) => (
                <tr key={item._id} className="border-b hover:bg-purple-50/50">
                  <td className="px-4 py-3 font-semibold text-purple-700">{item.pid}</td>
                  <td className="px-4 py-3">{item.first_name} {item.last_name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {item.nationality}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{item.passport_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.phone}</td>
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
          {filteredPassengers.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucun passager trouvé</div>
          )}
        </div>
      </main>
    </div>
  );
}
