/**
 * Article domain model
 *
 * Represents an article node in the system.
 * Articles are rich-text documents with Notion-like editing capabilities.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.10, 9.1, 10.1
 */

export interface Article {
  _id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isPublished: boolean;
  isDeleted: boolean;
  readingTime: number;
  wordCount: number;
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  content: string;
  tags: string[];
  isPublished: boolean;
}

export interface UpdateArticleInput {
  id: string;
  slug?: string;
  title?: string;
  content?: string;
  tags?: string[];
  isPublished?: boolean;
}
