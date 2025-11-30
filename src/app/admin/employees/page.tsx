'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Employee } from '@/types';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    eid: '', name: '', salary: 0, role: '', hire_date: '', email: ''
  });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (error) { console.error('Erreur:', error); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { fetchEmployees(); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee?._id) return;
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editingEmployee._id, ...formData })
      });
      if (res.ok) { fetchEmployees(); setEditingEmployee(null); setShowForm(false); resetForm(); }
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet employé ?')) return;
    try {
      const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchEmployees();
    } catch (error) { console.error('Erreur:', error); }
  };

  const startEdit = (item: Employee) => {
    setEditingEmployee(item);
    setFormData({
      eid: item.eid, name: item.name, salary: item.salary,
      role: item.role, hire_date: item.hire_date, email: item.email
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ eid: '', name: '', salary: 0, role: '', hire_date: '', email: '' });
    setEditingEmployee(null);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'Chief Pilot': 'bg-purple-100 text-purple-800',
      'Senior Pilot': 'bg-blue-100 text-blue-800',
      'Pilot': 'bg-green-100 text-green-800',
      'Co-Pilot': 'bg-cyan-100 text-cyan-800',
      'Flight Attendant': 'bg-pink-100 text-pink-800',
      'Ground Staff': 'bg-gray-100 text-gray-800',
      'Customer Service': 'bg-yellow-100 text-yellow-800',
      'Maintenance Engineer': 'bg-orange-100 text-orange-800',
      'Director of Operations': 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const filteredEmployees = employees.filter(e =>
    e.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Link href="/admin/employees" className="bg-purple-800 px-3 py-2 rounded">Employés</Link>
              <Link href="/admin/passengers" className="hover:bg-purple-600 px-3 py-2 rounded">Passagers</Link>
              <Link href="/admin/bookings" className="hover:bg-purple-600 px-3 py-2 rounded">Réservations</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👨‍✈️ Gestion des Employés</h1>
            <p className="text-gray-600">Total: {employees.length} employés</p>
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
              {showForm ? '✕ Fermer' : '+ Nouvel Employé'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingEmployee ? '✏️ Modifier l\'Employé' : '➕ Nouvel Employé'}
            </h2>
            <form onSubmit={editingEmployee ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID Employé</label>
                <input type="text" placeholder="E001" value={formData.eid}
                  onChange={(e) => setFormData({...formData, eid: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nom complet</label>
                <input type="text" placeholder="Jean Dupont" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Salaire ($)</label>
                <input type="number" placeholder="50000" value={formData.salary || ''}
                  onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rôle</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="border rounded-lg p-2 w-full" required>
                  <option value="">-- Sélectionner --</option>
                  <option value="Chief Pilot">Chief Pilot</option>
                  <option value="Senior Pilot">Senior Pilot</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Co-Pilot">Co-Pilot</option>
                  <option value="Flight Attendant">Flight Attendant</option>
                  <option value="Ground Staff">Ground Staff</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Maintenance Engineer">Maintenance Engineer</option>
                  <option value="Director of Operations">Director of Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date d'embauche</label>
                <input type="date" value={formData.hire_date}
                  onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" placeholder="jean@skyflight.com" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border rounded-lg p-2 w-full" required />
              </div>
              <div className="flex items-end">
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full">
                  {editingEmployee ? '💾 Enregistrer' : '➕ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tableau des employés */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Rôle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Salaire</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Embauche</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((item: any) => (
                <tr key={item._id} className="border-b hover:bg-purple-50/50">
                  <td className="px-4 py-3 font-semibold text-purple-700">{item.eid}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(item.role)}`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-green-600">${item.salary?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{item.hire_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.email}</td>
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
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucun employé trouvé</div>
          )}
        </div>
      </main>
    </div>
  );
}
