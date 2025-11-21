import { NextRequest, NextResponse } from 'next/server';
import { db, comments } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET /api/comments?highlightId=xxx - List comments for highlight
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const highlightId = searchParams.get('highlightId');

    if (!highlightId) {
      return NextResponse.json(
        { error: 'highlightId is required' },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.highlightId, highlightId))
      .orderBy(comments.order);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the current max order for this highlight
    const existingComments = await db
      .select()
      .from(comments)
      .where(eq(comments.highlightId, body.highlightId));
    
    const maxOrder = existingComments.length > 0
      ? Math.max(...existingComments.map(c => c.order))
      : -1;
    
    const newComment = {
      id: randomUUID(),
      highlightId: body.highlightId,
      contentId: body.contentId,
      text: body.text,
      authorType: body.authorType,
      llmMetadata: body.llmMetadata,
      parentCommentId: body.parentCommentId,
      order: maxOrder + 1,
      createdAt: new Date(),
    };

    const result = await db.insert(comments).values(newComment).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
