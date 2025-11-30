import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Récupérer toutes les réservations avec jointure
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Requête MongoDB AGGREGATE avec $lookup (jointure)
    // Permet de récupérer les infos du passager et du vol pour chaque réservation
    const bookings = await db.collection('booking').aggregate([
      {
        $lookup: {
          from: 'passenger',
          localField: 'pid',
          foreignField: 'pid',
          as: 'passenger_info'
        }
      },
      {
        $lookup: {
          from: 'flight',
          localField: 'flno',
          foreignField: 'flno',
          as: 'flight_info'
        }
      },
      {
        $unwind: { path: '$passenger_info', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$flight_info', preserveNullAndEmptyArrays: true }
      }
    ]).toArray();
    
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle réservation
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const result = await db.collection('booking').insertOne(data);
    return NextResponse.json({ message: 'Réservation créée', insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier une réservation
export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { _id, bid, ...updateData } = data;
    
    // Permettre la mise à jour par _id OU par bid
    let filter: any;
    if (_id) {
      filter = { _id: new ObjectId(_id) };
    } else if (bid) {
      filter = { bid: bid };
    } else {
      return NextResponse.json({ error: 'ID ou BID requis' }, { status: 400 });
    }
    
    const result = await db.collection('booking').updateOne(
      filter,
      { $set: updateData }
    );
    return NextResponse.json({ message: 'Réservation modifiée', modifiedCount: result.modifiedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une réservation
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const result = await db.collection('booking').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Réservation supprimée', deletedCount: result.deletedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
