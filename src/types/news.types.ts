export interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsArticle {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
  message?: string; // Present on error
  code?: string; // Present on error
}

export type NewsCategory = 
  | 'general' 
  | 'business' 
  | 'entertainment' 
  | 'health' 
  | 'science' 
  | 'sports' 
  | 'technology';

export const NEWS_CATEGORIES: NewsCategory[] = [
  'general',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology'
];
