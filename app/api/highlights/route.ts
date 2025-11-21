import { NextRequest, NextResponse } from 'next/server';
import { db, highlights } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET /api/highlights?contentId=xxx - List highlights for content
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(highlights)
      .where(eq(highlights.contentId, contentId));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

// POST /api/highlights - Create new highlight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newHighlight = {
      id: randomUUID(),
      contentId: body.contentId,
      selectedText: body.selectedText,
      context: body.context,
      position: body.position,
      color: body.color || '#ffeb3b',
      note: body.note,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(highlights).values(newHighlight).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}
