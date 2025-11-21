import { NextRequest, NextResponse } from 'next/server';
import { db, collections, content } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

// GET /api/collections/[id] - Get single collection with content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Get all content in this collection
    const collectionContent = await db
      .select()
      .from(content)
      .where(sql`json_array_length(${content.collectionIds}) > 0 AND EXISTS (
        SELECT 1 FROM json_each(${content.collectionIds}) 
        WHERE json_each.value = ${id}
      )`);

    return NextResponse.json({
      ...result[0],
      content: collectionContent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PATCH /api/collections/[id] - Update collection
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db
      .update(collections)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id] - Delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Remove collection from all content items
    const contentInCollection = await db
      .select()
      .from(content)
      .where(sql`json_array_length(${content.collectionIds}) > 0 AND EXISTS (
        SELECT 1 FROM json_each(${content.collectionIds}) 
        WHERE json_each.value = ${id}
      )`);

    for (const item of contentInCollection) {
      const collectionIds = item.collectionIds as string[];
      await db
        .update(content)
        .set({
          collectionIds: collectionIds.filter((cid) => cid !== id),
        })
        .where(eq(content.id, item.id));
    }

    const result = await db
      .delete(collections)
      .where(eq(collections.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
