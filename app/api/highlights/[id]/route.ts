import { NextRequest, NextResponse } from 'next/server';
import { db, highlights } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/highlights/[id] - Get single highlight
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(highlights)
      .where(eq(highlights.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch highlight' },
      { status: 500 }
    );
  }
}

// PATCH /api/highlights/[id] - Update highlight
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db
      .update(highlights)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(highlights.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update highlight' },
      { status: 500 }
    );
  }
}

// DELETE /api/highlights/[id] - Delete highlight
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(highlights)
      .where(eq(highlights.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}
