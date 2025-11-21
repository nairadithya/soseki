// Core content types
export type ContentType = 'article' | 'pdf' | 'video';

export type AuthorType = 'user' | 'llm';

// Metadata interfaces for different content types
export interface ArticleMetadata {
  publication?: string;
  publishedDate?: Date;
  wordCount?: number;
}

export interface PDFMetadata {
  fileUrl: string;
  pageCount: number;
}

export interface VideoMetadata {
  videoId: string; // YouTube ID
  duration: number; // seconds
  transcript?: string;
  channelName?: string;
}

export type ContentMetadata = ArticleMetadata | PDFMetadata | VideoMetadata;

// Reading progress
export interface ReadingProgress {
  position: number; // scroll %, page number, or video timestamp in seconds
  completed: boolean;
}

// Main Content entity
export interface Content {
  id: string; // UUID
  type: ContentType;
  title: string;
  url?: string; // original source
  author?: string;
  savedAt: Date;
  lastAccessedAt: Date;
  
  // Type-specific metadata
  metadata: ContentMetadata;
  
  // Processed content
  content: string; // cleaned text/transcript
  htmlContent?: string; // for articles
  
  // Organization
  tags: string[];
  collectionIds: string[];
  
  // Reading progress
  progress: ReadingProgress;
}

// Position types for different content
export interface ArticlePosition {
  startOffset: number;
  endOffset: number;
}

export interface PDFPosition {
  pageNumber: number;
  // Bounding box coordinates for precise highlighting
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface VideoPosition {
  timestamp: number; // seconds
}

export type HighlightPosition = ArticlePosition | PDFPosition | VideoPosition;

// Highlight entity
export interface Highlight {
  id: string; // UUID
  contentId: string;
  
  // Selection details
  selectedText: string;
  context: string; // surrounding text for context
  
  // Position (varies by content type)
  position: HighlightPosition;
  
  // Visual
  color: string; // hex color
  
  // User annotation
  note?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// LLM metadata for AI-generated comments
export interface LLMMetadata {
  model: string;
  prompt: string;
  relatedContentIds: string[]; // other articles referenced
}

// Comment entity (linear thread per highlight)
export interface Comment {
  id: string; // UUID
  highlightId: string;
  contentId: string; // for indexing
  
  // Comment content
  text: string;
  authorType: AuthorType;
  
  // For LLM responses
  llmMetadata?: LLMMetadata;
  
  // Simple linear threading
  parentCommentId?: string; // null for root user comment
  order: number; // position in thread: 0, 1, 2, 3...
  
  createdAt: Date;
}

// Collection entity
export interface Collection {
  id: string; // UUID
  name: string;
  description?: string;
  color?: string; // hex color
  icon?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Type guards
export function isArticleMetadata(metadata: ContentMetadata): metadata is ArticleMetadata {
  return 'wordCount' in metadata || 'publication' in metadata;
}

export function isPDFMetadata(metadata: ContentMetadata): metadata is PDFMetadata {
  return 'fileUrl' in metadata && 'pageCount' in metadata;
}

export function isVideoMetadata(metadata: ContentMetadata): metadata is VideoMetadata {
  return 'videoId' in metadata && 'duration' in metadata;
}

export function isArticlePosition(position: HighlightPosition): position is ArticlePosition {
  return 'startOffset' in position && 'endOffset' in position;
}

export function isPDFPosition(position: HighlightPosition): position is PDFPosition {
  return 'pageNumber' in position && 'boundingBox' in position;
}

export function isVideoPosition(position: HighlightPosition): position is VideoPosition {
  return 'timestamp' in position && !('pageNumber' in position);
}
