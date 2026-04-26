import { useState, useCallback, useEffect } from 'react';
import { NewsArticle, NewsCategory } from '../types/news.types';
import { fetchCityNews } from '../services/newsApi';

interface UseInfiniteNewsResult {
  articles: NewsArticle[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  onRefresh: () => void;
}

export const useInfiniteNews = (city: string | null, category: NewsCategory): UseInfiniteNewsResult => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (!city) {
      if (isRefresh) setRefreshing(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetchCityNews(city, category, pageNum);

      // Filter out removed or empty articles
      const validArticles = response.articles.filter(
        article => article.title && article.title !== '[Removed]' && article.url
      );

      setArticles(prev => {
        if (isRefresh || pageNum === 1) return validArticles;
        
        // Prevent duplicates
        const newUrls = new Set(validArticles.map(a => a.url));
        const filteredPrev = prev.filter(a => !newUrls.has(a.url));
        return [...filteredPrev, ...validArticles];
      });

      // NewsAPI developer plan caps at 100 results total
      const maxResults = Math.min(response.totalResults, 100);
      setHasMore(articles.length + validArticles.length < maxResults && validArticles.length > 0);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching news.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [city, category, articles.length]);

  // Reset and fetch when city or category changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setArticles([]);
    loadNews(1, false);
  }, [city, category]); // We explicitly don't include loadNews in dependency array to avoid loops, city and category are the triggers

  const loadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore && city) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNews(nextPage, false);
    }
  }, [loading, refreshing, hasMore, page, loadNews, city]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadNews(1, true);
  }, [loadNews]);

  return {
    articles,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    onRefresh,
  };
};
