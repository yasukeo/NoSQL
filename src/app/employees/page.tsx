'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
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

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👨‍✈️ Gestion des Employés</h1>
        <button onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          {showForm ? '✕ Fermer' : '+ Nouvel Employé'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingEmployee ? '✏️ Modifier l\'Employé' : '➕ Nouvel Employé'}
          </h2>
          <form onSubmit={editingEmployee ? handleUpdate : handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input type="text" placeholder="ID Employé (E001)" value={formData.eid}
              onChange={(e) => setFormData({...formData, eid: e.target.value})}
              className="border rounded p-2" required />
            <input type="text" placeholder="Nom complet" value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="border rounded p-2" required />
            <input type="number" placeholder="Salaire" value={formData.salary || ''}
              onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
              className="border rounded p-2" required />
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="border rounded p-2" required>
              <option value="">-- Sélectionner un rôle --</option>
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
            <input type="date" placeholder="Date embauche" value={formData.hire_date}
              onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
              className="border rounded p-2" required />
            <input type="email" placeholder="Email" value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="border rounded p-2" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {editingEmployee ? '💾 Enregistrer' : '➕ Ajouter'}
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
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-left">Salaire</th>
              <th className="px-4 py-3 text-left">Date Embauche</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((item: any) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.eid}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${getRoleBadgeColor(item.role)}`}>
                    {item.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-green-600">{item.salary?.toLocaleString()} €</td>
                <td className="px-4 py-3">{item.hire_date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.email}</td>
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
