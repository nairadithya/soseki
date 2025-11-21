import { JSDOM } from 'jsdom';
import { Defuddle, type DefuddleResponse } from 'defuddle/node';

export interface ArticleMetadata {
  title?: string;
  author?: string;
  description?: string;
  publication?: string;
  publishedDate?: string;
  image?: string;
  content?: string;
  htmlContent?: string;
  wordCount?: number;
}

export async function fetchArticleMetadata(url: string): Promise<ArticleMetadata> {
  try {
    const dom = await JSDOM.fromURL(url);
    const result = await Defuddle(dom, url);

    // Convert Defuddle HTML content to plain text
    const plainText = result.content ? extractPlainText(result.content) : '';

    return {
      title: result.title,
      author: result.author,
      description: result.description,
      publication: result.site,
      publishedDate: result.published,
      image: result.image,
      content: plainText,
      htmlContent: result.content,
      wordCount: result.wordCount,
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {};
  }
}

export async function extractArticleFromHtml(html: string, url?: string): Promise<ArticleMetadata> {
  try {
    const result = await Defuddle(html, url);
    
    // Convert Defuddle HTML content to plain text
    const plainText = result.content ? extractPlainText(result.content) : '';
    
    return {
      title: result.title,
      author: result.author,
      description: result.description,
      publication: result.site,
      content: plainText,
      htmlContent: result.content,
      wordCount: result.wordCount,
    };
  } catch (error) {
    console.error('Error extracting article:', error);
    return {};
  }
}

function extractPlainText(html: string): string {
  try {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent?.trim() || '';
  } catch (error) {
    console.error('Error extracting plain text:', error);
    return '';
  }
}
