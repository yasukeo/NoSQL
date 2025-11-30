import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Récupérer tous les avions
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const aircraft = await db.collection('aircraft').find().toArray();
    return NextResponse.json(aircraft);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouvel avion
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const result = await db.collection('aircraft').insertOne(data);
    return NextResponse.json({ message: 'Avion créé', insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier un avion
export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { _id, ...updateData } = data;
    const result = await db.collection('aircraft').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    return NextResponse.json({ message: 'Avion modifié', modifiedCount: result.modifiedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un avion
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const result = await db.collection('aircraft').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Avion supprimé', deletedCount: result.deletedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
