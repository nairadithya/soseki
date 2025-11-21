import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Content table
export const content = sqliteTable('content', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['article', 'pdf', 'video'] }).notNull(),
  title: text('title').notNull(),
  url: text('url'),
  author: text('author'),
  savedAt: integer('saved_at', { mode: 'timestamp' }).notNull(),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' }).notNull(),
  
  // Stored as JSON
  metadata: text('metadata', { mode: 'json' }).notNull(),
  
  // Content
  content: text('content').notNull(),
  htmlContent: text('html_content'),
  
  // Stored as JSON arrays
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().$defaultFn(() => []),
  collectionIds: text('collection_ids', { mode: 'json' }).$type<string[]>().notNull().$defaultFn(() => []),
  
  // Progress - stored as JSON
  progress: text('progress', { mode: 'json' }).notNull(),
});

// Highlights table
export const highlights = sqliteTable('highlights', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  
  selectedText: text('selected_text').notNull(),
  context: text('context').notNull(),
  
  // Stored as JSON
  position: text('position', { mode: 'json' }).notNull(),
  
  color: text('color').notNull(),
  note: text('note'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Comments table (declared without explicit type to avoid circular reference issues)
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  highlightId: text('highlight_id').notNull().references(() => highlights.id, { onDelete: 'cascade' }),
  contentId: text('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  
  text: text('text').notNull(),
  authorType: text('author_type', { enum: ['user', 'llm'] }).notNull(),
  
  // Stored as JSON
  llmMetadata: text('llm_metadata', { mode: 'json' }),
  
  parentCommentId: text('parent_comment_id'),
  order: integer('order').notNull(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Collections table
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  icon: text('icon'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Relations
export const contentRelations = relations(content, ({ many }) => ({
  highlights: many(highlights),
  comments: many(comments),
}));

export const highlightsRelations = relations(highlights, ({ one, many }) => ({
  content: one(content, {
    fields: [highlights.contentId],
    references: [content.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  highlight: one(highlights, {
    fields: [comments.highlightId],
    references: [highlights.id],
  }),
  content: one(content, {
    fields: [comments.contentId],
    references: [content.id],
  }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'comment_replies',
  }),
  replies: many(comments, {
    relationName: 'comment_replies',
  }),
}));
