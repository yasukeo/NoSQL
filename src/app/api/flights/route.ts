import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Récupérer tous les vols
// Requête MongoDB: db.collection('flight').find().toArray()
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Requête MongoDB: FIND (lire tous les documents)
    const flights = await db.collection('flight').find().toArray();
    
    return NextResponse.json(flights);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau vol
// Requête MongoDB: db.collection('flight').insertOne(data)
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    
    // Requête MongoDB: INSERT (créer un document)
    const result = await db.collection('flight').insertOne(data);
    
    return NextResponse.json({ 
      message: 'Vol créé avec succès', 
      insertedId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier un vol
// Requête MongoDB: db.collection('flight').updateOne({ _id }, { $set: data })
export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { _id, ...updateData } = data;
    
    // Requête MongoDB: UPDATE (modifier un document)
    const result = await db.collection('flight').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ 
      message: 'Vol modifié avec succès',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un vol
// Requête MongoDB: db.collection('flight').deleteOne({ _id })
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    // Requête MongoDB: DELETE (supprimer un document)
    const result = await db.collection('flight').deleteOne({
      _id: new ObjectId(id)
    });
    
    return NextResponse.json({ 
      message: 'Vol supprimé avec succès',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
