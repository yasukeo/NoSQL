// Connexion à MongoDB
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const MONGODB_DB = 'flight_management';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Si la connexion existe déjà, la réutiliser
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Créer une nouvelle connexion
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  // Mettre en cache la connexion
  cachedClient = client;
  cachedDb = db;

  console.log('✅ Connecté à MongoDB:', MONGODB_DB);
  return { client, db };
}
