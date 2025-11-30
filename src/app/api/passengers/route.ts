import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Récupérer tous les passagers
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const passengers = await db.collection('passenger').find().toArray();
    return NextResponse.json(passengers);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau passager
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const result = await db.collection('passenger').insertOne(data);
    return NextResponse.json({ message: 'Passager créé', insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier un passager
export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { _id, ...updateData } = data;
    const result = await db.collection('passenger').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    return NextResponse.json({ message: 'Passager modifié', modifiedCount: result.modifiedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un passager
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const result = await db.collection('passenger').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Passager supprimé', deletedCount: result.deletedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
