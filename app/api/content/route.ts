import { NextRequest, NextResponse } from 'next/server';
import { db, content } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { fetchArticleMetadata, extractArticleFromHtml } from '@/lib/content-utils';

// GET /api/content - List all content
export async function GET() {
  try {
    const allContent = await db.select().from(content);
    return NextResponse.json(allContent);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Handle multipart form data (for PDFs with file upload)
    if (contentType.includes('multipart/form-data')) {
      return await handleMultipartContent(request);
    }
    
    // Handle JSON (for articles and videos)
    return await handleJsonContent(request);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

async function handleJsonContent(request: NextRequest) {
  const body = await request.json();
  
  // Validate required fields
  if (!body.type || !body.url) {
    return NextResponse.json(
      { error: 'type and url are required' },
      { status: 400 }
    );
  }

  let title = body.title;
  let author = body.author;
  let contentText = body.content || '';
  let htmlContent = body.htmlContent;
  let metadata = body.metadata || {};

  // Fetch metadata for articles
  if (body.type === 'article') {
    let fetchedMeta;
    
    // If URL provided, fetch from URL
    if (body.url) {
      fetchedMeta = await fetchArticleMetadata(body.url);
    }
    // Otherwise, if HTML provided, extract from HTML
    else if (body.htmlContent) {
      fetchedMeta = await extractArticleFromHtml(body.htmlContent, body.url);
    }

    if (fetchedMeta) {
      // Use fetched metadata if not provided
      title = title || fetchedMeta.title || 'Untitled Article';
      author = author || fetchedMeta.author;
      contentText = contentText || fetchedMeta.content || '';
      htmlContent = htmlContent || fetchedMeta.htmlContent;
      
      // Store additional metadata
      metadata = {
        ...metadata,
        publication: metadata.publication || fetchedMeta.publication,
        publishedDate: metadata.publishedDate || fetchedMeta.publishedDate,
        description: fetchedMeta.description,
        image: fetchedMeta.image,
        wordCount: fetchedMeta.wordCount,
      };
    }
  }

  // For videos, ensure we have basic metadata
  if (body.type === 'video') {
    title = title || 'Untitled Video';
    // Extract video ID from YouTube URL
    const videoIdMatch = body.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (videoIdMatch) {
      metadata = {
        ...metadata,
        videoId: videoIdMatch[1],
        duration: metadata.duration || 0,
      };
    }
  }

  const newContent = {
    id: randomUUID(),
    type: body.type,
    title,
    url: body.url,
    author: author || null,
    savedAt: new Date(),
    lastAccessedAt: new Date(),
    metadata,
    content: contentText,
    htmlContent: htmlContent || null,
    tags: body.tags || [],
    collectionIds: body.collectionIds || [],
    progress: body.progress || { position: 0, completed: false },
  };

  const result = await db.insert(content).values(newContent).returning();
  return NextResponse.json(result[0], { status: 201 });
}

async function handleMultipartContent(request: NextRequest) {
  const formData = await request.formData();
  
  const type = formData.get('type') as string;
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const author = formData.get('author') as string | null;
  const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
  const collectionIds = formData.get('collectionIds') ? JSON.parse(formData.get('collectionIds') as string) : [];

  // Validate
  if (type !== 'pdf' || !file) {
    return NextResponse.json(
      { error: 'multipart upload is only for PDF type with file' },
      { status: 400 }
    );
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Only PDF files are allowed' },
      { status: 400 }
    );
  }

  // Upload the file first
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  
  const uploadResponse = await fetch(
    new URL('/api/upload/pdf', request.url).toString(),
    {
      method: 'POST',
      body: uploadFormData,
    }
  );

  if (!uploadResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to upload PDF file' },
      { status: 500 }
    );
  }

  const uploadData = await uploadResponse.json();

  // Create content entry
  // TODO: Extract PDF metadata and text content
  const newContent = {
    id: randomUUID(),
    type: 'pdf' as const,
    title: title || uploadData.originalName.replace('.pdf', ''),
    url: null,
    author: author || null,
    savedAt: new Date(),
    lastAccessedAt: new Date(),
    metadata: {
      fileUrl: uploadData.fileUrl,
      pageCount: 0, // TODO: Extract from PDF
    },
    content: '', // TODO: Extract text from PDF
    htmlContent: null,
    tags,
    collectionIds,
    progress: { position: 0, completed: false },
  };

  const result = await db.insert(content).values(newContent).returning();
  return NextResponse.json(result[0], { status: 201 });
}
