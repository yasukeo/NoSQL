'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Aircraft } from '@/types';

export default function AdminAircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    aid: '', name: '', distance: 0, capacity: 0, manufacturer: '', year_manufactured: 2020
  });

  useEffect(() => { fetchAircraft(); }, []);

  const fetchAircraft = async () => {
    try {
      const res = await fetch('/api/aircraft');
      const data = await res.json();
      setAircraft(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/aircraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { fetchAircraft(); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAircraft?._id) return;
    try {
      const res = await fetch('/api/aircraft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editingAircraft._id, ...formData })
      });
      if (res.ok) { fetchAircraft(); setEditingAircraft(null); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet avion ?')) return;
    try {
      const res = await fetch(`/api/aircraft?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchAircraft();
    } catch (error) { console.error('Erreur:', error); }
  };

  const startEdit = (item: Aircraft) => {
    setEditingAircraft(item);
    setFormData({
      aid: item.aid, name: item.name, distance: item.distance,
      capacity: item.capacity, manufacturer: item.manufacturer,
      year_manufactured: item.year_manufactured
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ aid: '', name: '', distance: 0, capacity: 0, manufacturer: '', year_manufactured: 2020 });
    setEditingAircraft(null);
  };

  const filteredAircraft = aircraft.filter(a =>
    a.aid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Link href="/admin/aircraft" className="bg-purple-800 px-3 py-2 rounded">Avions</Link>
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
            <h1 className="text-3xl font-bold text-gray-800">🛩️ Gestion des Avions</h1>
            <p className="text-gray-600">Total: {aircraft.length} avions</p>
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
              {showForm ? '✕ Fermer' : '+ Nouvel Avion'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingAircraft ? '✏️ Modifier l\'Avion' : '➕ Nouvel Avion'}
            </h2>
            <form onSubmit={editingAircraft ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID Avion</label>
                <input type="text" placeholder="A001" value={formData.aid}
                  onChange={(e) => setFormData({...formData, aid: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nom</label>
                <input type="text" placeholder="Boeing 747" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Distance max (km)</label>
                <input type="number" placeholder="14000" value={formData.distance || ''}
                  onChange={(e) => setFormData({...formData, distance: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Capacité</label>
                <input type="number" placeholder="400" value={formData.capacity || ''}
                  onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fabricant</label>
                <input type="text" placeholder="Boeing" value={formData.manufacturer}
                  onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Année</label>
                <input type="number" placeholder="2020" value={formData.year_manufactured || ''}
                  onChange={(e) => setFormData({...formData, year_manufactured: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div className="flex items-end col-span-2 md:col-span-1">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full">
                  {editingAircraft ? '💾 Enregistrer' : '➕ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grille des avions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAircraft.map((item: any) => (
            <div key={item._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-sm text-purple-600 font-medium">{item.aid}</span>
                  <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                </div>
                <span className="text-3xl">✈️</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Fabricant:</span> {item.manufacturer}</p>
                <p><span className="font-medium">Capacité:</span> {item.capacity} passagers</p>
                <p><span className="font-medium">Autonomie:</span> {item.distance.toLocaleString()} km</p>
                <p><span className="font-medium">Année:</span> {item.year_manufactured}</p>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button onClick={() => startEdit(item)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">✏️ Modifier</button>
                <button onClick={() => handleDelete(item._id)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">🗑️ Supprimer</button>
              </div>
            </div>
          ))}
        </div>
        {filteredAircraft.length === 0 && (
          <div className="text-center py-8 text-gray-500">Aucun avion trouvé</div>
        )}
      </main>
    </div>
  );
}
