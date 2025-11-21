# Database Schema

## Overview

Soseki uses SQLite with Drizzle ORM. The schema consists of 4 main tables with relational integrity enforced through foreign keys.

## Tables

### content

Stores all saved content (articles, PDFs, videos).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | UUID identifier |
| type | text | NOT NULL | Enum: 'article', 'pdf', 'video' |
| title | text | NOT NULL | Content title |
| url | text | | Original source URL |
| author | text | | Content author |
| saved_at | integer | NOT NULL | Unix timestamp (ms) |
| last_accessed_at | integer | NOT NULL | Unix timestamp (ms) |
| metadata | text | NOT NULL | JSON - type-specific metadata |
| content | text | NOT NULL | Cleaned text/transcript |
| html_content | text | | HTML version (articles only) |
| tags | text | NOT NULL | JSON array of strings |
| collection_ids | text | NOT NULL | JSON array of collection UUIDs |
| progress | text | NOT NULL | JSON object with position & completed |

**Metadata Structure by Type:**

Article:
```json
{
  "publication": "string",
  "publishedDate": "ISO date",
  "wordCount": 0
}
```

PDF:
```json
{
  "fileUrl": "string",
  "pageCount": 0
}
```

Video:
```json
{
  "videoId": "string",
  "duration": 0,
  "transcript": "string",
  "channelName": "string"
}
```

**Progress Structure:**
```json
{
  "position": 0,
  "completed": false
}
```

### highlights

Text selections from content with position data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | UUID identifier |
| content_id | text | NOT NULL, FK → content.id (CASCADE) | Parent content |
| selected_text | text | NOT NULL | Highlighted text |
| context | text | NOT NULL | Surrounding text for context |
| position | text | NOT NULL | JSON - type-specific position |
| color | text | NOT NULL | Hex color code |
| note | text | | User annotation |
| created_at | integer | NOT NULL | Unix timestamp (ms) |
| updated_at | integer | NOT NULL | Unix timestamp (ms) |

**Position Structure by Content Type:**

Article:
```json
{
  "startOffset": 0,
  "endOffset": 0
}
```

PDF:
```json
{
  "pageNumber": 0,
  "boundingBox": {
    "x": 0,
    "y": 0,
    "width": 0,
    "height": 0
  }
}
```

Video:
```json
{
  "timestamp": 0
}
```

### comments

Conversation threads attached to highlights.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | UUID identifier |
| highlight_id | text | NOT NULL, FK → highlights.id (CASCADE) | Parent highlight |
| content_id | text | NOT NULL, FK → content.id (CASCADE) | For indexing |
| text | text | NOT NULL | Comment text |
| author_type | text | NOT NULL | Enum: 'user', 'llm' |
| llm_metadata | text | | JSON - LLM response metadata |
| parent_comment_id | text | | Self-referencing for threading |
| order | integer | NOT NULL | Position in thread (0, 1, 2...) |
| created_at | integer | NOT NULL | Unix timestamp (ms) |

**LLM Metadata Structure:**
```json
{
  "model": "string",
  "prompt": "string",
  "relatedContentIds": ["uuid", "uuid"]
}
```

### collections

User-created collections for organizing content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | UUID identifier |
| name | text | NOT NULL | Collection name |
| description | text | | Collection description |
| color | text | | Hex color code |
| icon | text | | Icon identifier |
| created_at | integer | NOT NULL | Unix timestamp (ms) |
| updated_at | integer | NOT NULL | Unix timestamp (ms) |

## Relationships

```
content (1) ──< highlights (many)
             └< comments (many)

highlights (1) ──< comments (many)

comments (1) ──< comments (many) [self-referencing]
```

## Foreign Key Cascades

- Deleting content → deletes all associated highlights and comments
- Deleting highlight → deletes all associated comments
- Deleting parent comment → deletes all child comments

## Indexes

Default indexes are created on:
- Primary keys (id)
- Foreign keys (content_id, highlight_id, parent_comment_id)

Additional indexes can be added for:
- `content.type` (for filtering by content type)
- `content.tags` (for tag-based queries)
- `highlights.content_id` (already indexed via FK)
- `comments.highlight_id` (already indexed via FK)

## Drizzle Schema Location

The schema is defined in: `lib/db/schema.ts`

## Managing the Database

```bash
# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Push schema directly (development)
bun run db:push

# Visual database browser
bun run db:studio
```

## SQLite Notes

- Timestamps are stored as INTEGER (Unix epoch in milliseconds)
- JSON fields are stored as TEXT
- Booleans are stored as INTEGER (0 or 1)
- Foreign key constraints are enabled
- WAL mode is recommended for better concurrency

## Type Safety

Drizzle provides full TypeScript types inferred from the schema:

```typescript
import { content, highlights } from '@/lib/db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Query result type
type Content = InferSelectModel<typeof content>;

// Insert payload type
type NewContent = InferInsertModel<typeof content>;
```
