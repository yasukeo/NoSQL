'use client';

import { useState, useEffect } from 'react';
import { Passenger } from '@/types';

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
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

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👤 Gestion des Passagers</h1>
        <button onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          {showForm ? '✕ Fermer' : '+ Nouveau Passager'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPassenger ? '✏️ Modifier le Passager' : '➕ Nouveau Passager'}
          </h2>
          <form onSubmit={editingPassenger ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input type="text" placeholder="ID Passager (P001)" value={formData.pid}
              onChange={(e) => setFormData({...formData, pid: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Prénom" value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Nom" value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="border rounded p-2" required />
            <input type="email" placeholder="Email" value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="border rounded p-2" required />
            <input type="tel" placeholder="Téléphone" value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="N° Passeport" value={formData.passport_number}
              onChange={(e) => setFormData({...formData, passport_number: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Nationalité" value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              className="border rounded p-2" required />
            <input type="date" placeholder="Date naissance" value={formData.date_of_birth}
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              className="border rounded p-2" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 col-span-2 md:col-span-1">
              {editingPassenger ? '💾 Enregistrer' : '➕ Ajouter'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nom Complet</th>
              <th className="px-4 py-3 text-left">Nationalité</th>
              <th className="px-4 py-3 text-left">Passeport</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((item: any) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.pid}</td>
                <td className="px-4 py-3">{item.first_name} {item.last_name}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {item.nationality}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-sm">{item.passport_number}</td>
                <td className="px-4 py-3 text-sm">{item.email}</td>
                <td className="px-4 py-3 text-sm">{item.phone}</td>
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
