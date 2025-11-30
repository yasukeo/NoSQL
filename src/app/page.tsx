import Link from 'next/link';

// Page d'accueil - Choix entre Client et Admin
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">✈️</span>
            <span className="text-2xl font-bold text-white">SkyFlight Airlines</span>
          </div>
          <div className="text-white/80 text-sm">
            Projet NoSQL - MongoDB
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Bienvenue sur SkyFlight
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Votre compagnie aérienne de confiance. Réservez vos vols facilement 
            ou gérez les opérations via notre interface administrateur.
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Client Card */}
          <Link href="/client" className="group">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <span className="text-5xl">🧳</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Espace Client</h2>
                <p className="text-gray-600 mb-6">
                  Recherchez et réservez vos vols en quelques clics. 
                  Consultez les destinations disponibles et planifiez votre voyage.
                </p>
                <div className="inline-flex items-center text-blue-600 font-semibold">
                  Réserver un vol
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/admin" className="group">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                  <span className="text-5xl">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Espace Administrateur</h2>
                <p className="text-gray-600 mb-6">
                  Gérez les vols, les avions, les employés et les réservations. 
                  Accédez aux statistiques et aux opérations CRUD.
                </p>
                <div className="inline-flex items-center text-purple-600 font-semibold">
                  Accéder au dashboard
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <span className="text-4xl mb-4 block">🌍</span>
            <h3 className="text-lg font-semibold text-white mb-2">Destinations multiples</h3>
            <p className="text-blue-200 text-sm">Vols vers Paris, New York, Tokyo, Londres et plus encore</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <span className="text-4xl mb-4 block">💺</span>
            <h3 className="text-lg font-semibold text-white mb-2">Flotte moderne</h3>
            <p className="text-blue-200 text-sm">Boeing 737, 747, 777 et Airbus A320, A350, A380</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <span className="text-4xl mb-4 block">🔒</span>
            <h3 className="text-lg font-semibold text-white mb-2">Réservation sécurisée</h3>
            <p className="text-blue-200 text-sm">Système fiable avec base de données MongoDB</p>
          </div>
        </div>

        {/* Project Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-white/80">Technologies :</span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">Next.js</span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">TypeScript</span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">MongoDB</span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">Tailwind CSS</span>
          </div>
        </div>
      </main>
    </div>
  );
}
