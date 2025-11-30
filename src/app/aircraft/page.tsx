'use client';

import { useState, useEffect } from 'react';
import { Aircraft } from '@/types';

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
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

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛩️ Gestion des Avions</h1>
        <button onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {showForm ? '✕ Fermer' : '+ Nouvel Avion'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingAircraft ? '✏️ Modifier l\'Avion' : '➕ Nouvel Avion'}
          </h2>
          <form onSubmit={editingAircraft ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input type="text" placeholder="ID Avion" value={formData.aid}
              onChange={(e) => setFormData({...formData, aid: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Nom (ex: Boeing 747)" value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="border rounded p-2" required />
            <input type="number" placeholder="Distance max (km)" value={formData.distance || ''}
              onChange={(e) => setFormData({...formData, distance: Number(e.target.value)})}
              className="border rounded p-2" required />
            <input type="number" placeholder="Capacité" value={formData.capacity || ''}
              onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Fabricant" value={formData.manufacturer}
              onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
              className="border rounded p-2" required />
            <input type="number" placeholder="Année" value={formData.year_manufactured || ''}
              onChange={(e) => setFormData({...formData, year_manufactured: Number(e.target.value)})}
              className="border rounded p-2" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 col-span-2 md:col-span-1">
              {editingAircraft ? '💾 Enregistrer' : '➕ Ajouter'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Fabricant</th>
              <th className="px-4 py-3 text-left">Capacité</th>
              <th className="px-4 py-3 text-left">Distance Max</th>
              <th className="px-4 py-3 text-left">Année</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((item: any) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.aid}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.manufacturer}</td>
                <td className="px-4 py-3">{item.capacity} places</td>
                <td className="px-4 py-3">{item.distance} km</td>
                <td className="px-4 py-3">{item.year_manufactured}</td>
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
