import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET /api/collections - List all collections
export async function GET() {
  try {
    const allCollections = await db.select().from(collections);
    return NextResponse.json(allCollections);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create new collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCollection = {
      id: randomUUID(),
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(collections).values(newCollection).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
