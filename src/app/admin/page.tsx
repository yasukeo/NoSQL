import { connectToDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';

// Page Admin - Dashboard avec statistiques et navigation CRUD
export default async function AdminDashboard() {
  const { db } = await connectToDatabase();

  // Statistiques - Requêtes MongoDB COUNT
  const flightsCount = await db.collection('flight').countDocuments();
  const aircraftCount = await db.collection('aircraft').countDocuments();
  const employeesCount = await db.collection('employee').countDocuments();
  const passengersCount = await db.collection('passenger').countDocuments();
  const bookingsCount = await db.collection('booking').countDocuments();
  const certificatesCount = await db.collection('certificate').countDocuments();

  // Dernières réservations - Requête MongoDB FIND avec SORT et LIMIT
  const recentBookings = await db.collection('booking')
    .find()
    .sort({ booking_date: -1 })
    .limit(5)
    .toArray();

  // Vols populaires - Requête MongoDB AGGREGATE
  const popularFlights = await db.collection('booking').aggregate([
    { $group: { _id: "$flno", total_bookings: { $sum: 1 } } },
    { $sort: { total_bookings: -1 } },
    { $limit: 5 }
  ]).toArray();

  // Revenus totaux - Requête MongoDB AGGREGATE avec $sum
  // Note: Le champ dans la collection booking est "price_paid" (prix payé par le client)
  const totalRevenue = await db.collection('booking').aggregate([
    { $match: { status: 'Confirmed' } },
    { $group: { _id: null, total: { $sum: "$price_paid" } } }
  ]).toArray();

  const revenue = totalRevenue[0]?.total || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Admin avec auth */}
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Administrateur</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-800 flex items-center">
            ← Retour à l'accueil
          </Link>
        </div>
        
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Vols" count={flightsCount} icon="✈️" color="blue" href="/admin/flights" />
          <StatCard title="Avions" count={aircraftCount} icon="🛩️" color="green" href="/admin/aircraft" />
          <StatCard title="Employés" count={employeesCount} icon="👨‍✈️" color="purple" href="/admin/employees" />
          <StatCard title="Passagers" count={passengersCount} icon="👤" color="orange" href="/admin/passengers" />
          <StatCard title="Réservations" count={bookingsCount} icon="🎫" color="red" href="/admin/bookings" />
          <StatCard title="Certificats" count={certificatesCount} icon="📜" color="teal" href="/admin/employees" />
        </div>

        {/* Revenus */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Revenus totaux (réservations confirmées)</p>
              <p className="text-4xl font-bold">${revenue.toLocaleString()}</p>
            </div>
            <span className="text-6xl opacity-50">💰</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Dernières réservations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🕒 Dernières Réservations</h2>
              <Link href="/admin/bookings" className="text-purple-600 hover:underline text-sm">Voir tout →</Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm text-gray-600">ID</th>
                  <th className="text-left py-2 text-sm text-gray-600">Vol</th>
                  <th className="text-left py-2 text-sm text-gray-600">Date</th>
                  <th className="text-left py-2 text-sm text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking: any) => (
                  <tr key={booking._id.toString()} className="border-b hover:bg-gray-50">
                    <td className="py-2 text-sm">{booking.bid}</td>
                    <td className="py-2 text-sm font-medium">{booking.flno}</td>
                    <td className="py-2 text-sm text-gray-600">{booking.booking_date}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vols populaires */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🔥 Vols Populaires</h2>
              <Link href="/admin/flights" className="text-purple-600 hover:underline text-sm">Voir tout →</Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm text-gray-600">Vol</th>
                  <th className="text-left py-2 text-sm text-gray-600">Réservations</th>
                </tr>
              </thead>
              <tbody>
                {popularFlights.map((flight: any) => (
                  <tr key={flight._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{flight._id}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3 max-w-[100px]">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(flight.total_bookings * 20, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{flight.total_bookings}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Actions Rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/flights" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
              <span className="text-3xl block mb-2">✈️</span>
              <span className="text-sm font-medium text-gray-700">Gérer les vols</span>
            </Link>
            <Link href="/admin/aircraft" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
              <span className="text-3xl block mb-2">🛩️</span>
              <span className="text-sm font-medium text-gray-700">Gérer les avions</span>
            </Link>
            <Link href="/admin/bookings" className="bg-red-50 hover:bg-red-100 p-4 rounded-lg text-center transition-colors">
              <span className="text-3xl block mb-2">🎫</span>
              <span className="text-sm font-medium text-gray-700">Gérer réservations</span>
            </Link>
            <Link href="/client" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
              <span className="text-3xl block mb-2">🧳</span>
              <span className="text-sm font-medium text-gray-700">Espace Client</span>
            </Link>
          </div>
        </div>

        {/* Info projet */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">📚 Informations Techniques - Projet NoSQL</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="text-gray-400">Base de données :</span> MongoDB</p>
              <p><span className="text-gray-400">Database :</span> flight_management</p>
              <p><span className="text-gray-400">Collections :</span> flight, aircraft, employee, certificate, passenger, booking</p>
            </div>
            <div>
              <p><span className="text-gray-400">Framework :</span> Next.js 14 (App Router)</p>
              <p><span className="text-gray-400">Langage :</span> TypeScript</p>
              <p><span className="text-gray-400">Style :</span> Tailwind CSS</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Composant carte statistique
function StatCard({ title, count, icon, color, href }: { 
  title: string; 
  count: number; 
  icon: string; 
  color: string;
  href: string;
}) {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
  };

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className={`${colorClasses[color]} text-white p-2 rounded-lg text-xl`}>
            {icon}
          </div>
          <div>
            <p className="text-gray-500 text-xs">{title}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
