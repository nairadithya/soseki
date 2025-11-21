# Soseki - LLM-Assisted Reader App

A Next.js application for saving and reading articles, PDFs, and YouTube videos with AI-powered highlights and commenting.

## Features

- 📚 **Save Multiple Content Types**: Articles, PDFs, and YouTube videos
- ✨ **Smart Highlighting**: Highlight text with context-aware positioning
- 💬 **AI Comments**: Thread-based commenting with LLM assistance
- 🗂️ **Collections**: Organize content with tags and collections
- 📊 **Reading Progress**: Track your progress across all content types

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Drizzle ORM
- **Package Manager**: Bun
- **UI**: Tailwind CSS + Shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed

### Installation

```bash
# Install dependencies
bun install

# Push database schema
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Schema

### Content
Stores articles, PDFs, and YouTube videos with metadata and reading progress.

### Highlights
Text selections from content with position data (varies by content type).

### Comments
Linear conversation threads attached to highlights, including LLM responses.

### Collections
User-created collections for organizing content.

## API Endpoints

### Content
- `GET /api/content` - List all content
- `POST /api/content` - Create new content
- `GET /api/content/[id]` - Get single content
- `PATCH /api/content/[id]` - Update content
- `DELETE /api/content/[id]` - Delete content

### Highlights
- `GET /api/highlights?contentId={id}` - List highlights for content
- `POST /api/highlights` - Create new highlight
- `GET /api/highlights/[id]` - Get single highlight
- `PATCH /api/highlights/[id]` - Update highlight
- `DELETE /api/highlights/[id]` - Delete highlight

### Comments
- `GET /api/comments?highlightId={id}` - List comments for highlight
- `POST /api/comments` - Create new comment
- `GET /api/comments/[id]` - Get single comment
- `PATCH /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment

### Collections
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create new collection
- `GET /api/collections/[id]` - Get collection with content
- `PATCH /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection

## Database Management

```bash
# Generate migrations from schema changes
bun run db:generate

# Push schema directly to database
bun run db:push

# Run migrations
bun run db:migrate

# Open Drizzle Studio (visual database browser)
bun run db:studio
```

## Data Model

### Content Types

**Article**
```typescript
{
  type: 'article',
  metadata: {
    publication?: string,
    publishedDate?: Date,
    wordCount?: number
  }
}
```

**PDF**
```typescript
{
  type: 'pdf',
  metadata: {
    fileUrl: string,
    pageCount: number
  }
}
```

**YouTube Video**
```typescript
{
  type: 'video',
  metadata: {
    videoId: string,
    duration: number,
    transcript?: string,
    channelName?: string
  }
}
```

### Highlight Positions

**Article**: Character offsets
```typescript
{ startOffset: number, endOffset: number }
```

**PDF**: Bounding box coordinates
```typescript
{
  pageNumber: number,
  boundingBox: { x: number, y: number, width: number, height: number }
}
```

**YouTube**: Video timestamp
```typescript
{ timestamp: number }
```

## Project Structure

```
soseki/
├── app/
│   ├── api/              # API routes
│   │   ├── content/
│   │   ├── highlights/
│   │   ├── comments/
│   │   └── collections/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/               # Shadcn components
├── lib/
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema
│   │   └── index.ts      # Database instance
│   ├── types.ts          # TypeScript types
│   └── utils.ts
├── drizzle/              # Migration files
├── docs/                 # Documentation
│   ├── API.md
│   └── DATABASE.md
├── drizzle.config.ts     # Drizzle configuration
└── soseki.db             # SQLite database file
```

## Documentation

- [API Documentation](docs/API.md) - Complete API endpoint reference
- [Database Schema](docs/DATABASE.md) - Detailed schema documentation

## Adding UI Components

This project uses Shadcn/ui. Always use the CLI to add components:

```bash
bunx --bun shadcn@latest add <component-name>
```

Never manually create component files.

## Development Notes

- All timestamps are stored as integers in SQLite (Unix epoch)
- JSON fields are used for flexible metadata and position data
- Foreign key cascades handle cleanup when deleting content/highlights
- Comments are ordered sequentially within each highlight thread
- Collections are stored as JSON arrays in the content table

## License

MIT
