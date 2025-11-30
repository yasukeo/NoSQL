import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'client' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email invalide' },
        { status: 400 }
      );
    }

    // Mot de passe minimum 6 caractères
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = {
      uid: `user-${crypto.randomUUID()}`,
      email,
      password: hashedPassword,
      name,
      role: role === 'admin' ? 'admin' : 'client', // Sécurité: forcer 'client' par défaut
      created_at: new Date().toISOString()
    };

    await db.collection('users').insertOne(newUser);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: userWithoutPassword
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
