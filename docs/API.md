# API Documentation

## Content Endpoints

### List All Content
```http
GET /api/content
```

**Response**
```json
[
  {
    "id": "uuid",
    "type": "article",
    "title": "Example Article",
    "url": "https://example.com",
    "author": "John Doe",
    "savedAt": "2025-11-21T10:00:00.000Z",
    "lastAccessedAt": "2025-11-21T10:00:00.000Z",
    "metadata": {},
    "content": "Article text...",
    "htmlContent": "<p>Article text...</p>",
    "tags": ["tech", "ai"],
    "collectionIds": ["collection-uuid"],
    "progress": { "position": 0, "completed": false }
  }
]
```

### Create Content

#### For Articles (JSON)
```http
POST /api/content
Content-Type: application/json

{
  "type": "article",
  "url": "https://example.com/article",
  "title": "Optional - will be fetched from URL if not provided",
  "author": "Optional - will be fetched from URL if not provided",
  "content": "Optional - extracted text content",
  "htmlContent": "Optional - HTML content",
  "tags": ["tech", "ai"],
  "collectionIds": []
}
```

**Automatic Metadata Fetching:**
When creating an article with a URL, the server automatically fetches:
- Title (from og:title, twitter:title, or <title> tag)
- Author (from author meta tags)
- Publication (from og:site_name)
- Published date (from article:published_time)
- Description and image

Any manually provided values override the fetched metadata.

#### For Videos (JSON)
```http
POST /api/content
Content-Type: application/json

{
  "type": "video",
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "title": "Optional video title",
  "tags": ["education"],
  "collectionIds": []
}
```

The video ID is automatically extracted from the YouTube URL.

#### For PDFs (Multipart Form Data)
```http
POST /api/content
Content-Type: multipart/form-data

type: pdf
file: [PDF file]
title: Optional PDF title (defaults to filename)
author: Optional author name
tags: ["research", "papers"] (JSON string)
collectionIds: [] (JSON string)
```

**PDF Upload Process:**
1. File is validated (must be PDF)
2. File is saved to `/uploads/pdfs/` with a UUID filename
3. Content entry is created with file URL
4. Page count and text extraction are placeholders (TODO)

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/api/content \
  -F "type=pdf" \
  -F "file=@document.pdf" \
  -F "title=Research Paper" \
  -F "author=John Doe" \
  -F 'tags=["research"]'
```

### Get Content by ID
```http
GET /api/content/{id}
```

Automatically updates `lastAccessedAt` timestamp.

### Update Content
```http
PATCH /api/content/{id}
Content-Type: application/json

{
  "progress": { "position": 50, "completed": false },
  "tags": ["tech", "ai", "reading"]
}
```

### Delete Content
```http
DELETE /api/content/{id}
```

Cascades to delete all associated highlights and comments.

---

## Highlight Endpoints

### List Highlights for Content
```http
GET /api/highlights?contentId={contentId}
```

**Response**
```json
[
  {
    "id": "uuid",
    "contentId": "content-uuid",
    "selectedText": "Important text here",
    "context": "...surrounding text for context...",
    "position": {
      "startOffset": 100,
      "endOffset": 120
    },
    "color": "#ffeb3b",
    "note": "This is important",
    "createdAt": "2025-11-21T10:00:00.000Z",
    "updatedAt": "2025-11-21T10:00:00.000Z"
  }
]
```

### Create Highlight
```http
POST /api/highlights
Content-Type: application/json

{
  "contentId": "content-uuid",
  "selectedText": "Important text here",
  "context": "...surrounding text...",
  "position": {
    "pageNumber": 5,
    "boundingBox": { "x": 100, "y": 200, "width": 300, "height": 20 }
  },
  "color": "#ffeb3b",
  "note": "Optional note"
}
```

**Position Examples:**

Article:
```json
{ "startOffset": 100, "endOffset": 120 }
```

PDF:
```json
{
  "pageNumber": 5,
  "boundingBox": { "x": 100, "y": 200, "width": 300, "height": 20 }
}
```

YouTube:
```json
{ "timestamp": 125 }
```

### Get Highlight by ID
```http
GET /api/highlights/{id}
```

### Update Highlight
```http
PATCH /api/highlights/{id}
Content-Type: application/json

{
  "color": "#4caf50",
  "note": "Updated note"
}
```

### Delete Highlight
```http
DELETE /api/highlights/{id}
```

Cascades to delete all associated comments.

---

## Comment Endpoints

### List Comments for Highlight
```http
GET /api/comments?highlightId={highlightId}
```

Returns comments ordered by thread position.

**Response**
```json
[
  {
    "id": "uuid",
    "highlightId": "highlight-uuid",
    "contentId": "content-uuid",
    "text": "What does this mean?",
    "authorType": "user",
    "llmMetadata": null,
    "parentCommentId": null,
    "order": 0,
    "createdAt": "2025-11-21T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "highlightId": "highlight-uuid",
    "contentId": "content-uuid",
    "text": "This refers to...",
    "authorType": "llm",
    "llmMetadata": {
      "model": "gpt-4",
      "prompt": "Explain this highlight",
      "relatedContentIds": ["content-uuid-2"]
    },
    "parentCommentId": "first-comment-uuid",
    "order": 1,
    "createdAt": "2025-11-21T10:01:00.000Z"
  }
]
```

### Create Comment
```http
POST /api/comments
Content-Type: application/json

{
  "highlightId": "highlight-uuid",
  "contentId": "content-uuid",
  "text": "What does this mean?",
  "authorType": "user",
  "parentCommentId": null
}
```

For LLM responses:
```json
{
  "highlightId": "highlight-uuid",
  "contentId": "content-uuid",
  "text": "This refers to...",
  "authorType": "llm",
  "llmMetadata": {
    "model": "gpt-4",
    "prompt": "Explain this highlight",
    "relatedContentIds": ["content-uuid-2"]
  },
  "parentCommentId": "parent-comment-uuid"
}
```

The `order` field is automatically calculated based on existing comments.

### Get Comment by ID
```http
GET /api/comments/{id}
```

### Update Comment
```http
PATCH /api/comments/{id}
Content-Type: application/json

{
  "text": "Updated comment text"
}
```

### Delete Comment
```http
DELETE /api/comments/{id}
```

---

## Collection Endpoints

### List All Collections
```http
GET /api/collections
```

**Response**
```json
[
  {
    "id": "uuid",
    "name": "Technical Reading",
    "description": "Articles about programming",
    "color": "#2196f3",
    "icon": "book",
    "createdAt": "2025-11-21T10:00:00.000Z",
    "updatedAt": "2025-11-21T10:00:00.000Z"
  }
]
```

### Create Collection
```http
POST /api/collections
Content-Type: application/json

{
  "name": "Technical Reading",
  "description": "Articles about programming",
  "color": "#2196f3",
  "icon": "book"
}
```

### Get Collection with Content
```http
GET /api/collections/{id}
```

**Response**
```json
{
  "id": "uuid",
  "name": "Technical Reading",
  "description": "Articles about programming",
  "color": "#2196f3",
  "icon": "book",
  "createdAt": "2025-11-21T10:00:00.000Z",
  "updatedAt": "2025-11-21T10:00:00.000Z",
  "content": [
    {
      "id": "content-uuid",
      "title": "Example Article",
      // ... full content object
    }
  ]
}
```

### Update Collection
```http
PATCH /api/collections/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "color": "#4caf50"
}
```

### Delete Collection
```http
DELETE /api/collections/{id}
```

Removes the collection ID from all content items before deleting.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

- All IDs are UUIDs (v4)
- Timestamps are ISO 8601 strings in responses
- JSON fields (metadata, position, etc.) accept any valid JSON structure
- Foreign key relationships enforce cascade deletes
- Comments are automatically ordered within each highlight thread
