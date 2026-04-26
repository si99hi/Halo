import { NewsResponse, NewsCategory } from '../types/news.types';

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export const fetchCityNews = async (
  city: string,
  category: NewsCategory,
  page: number = 1,
  pageSize: number = 20
): Promise<NewsResponse> => {
  if (!NEWS_API_KEY) {
    throw new Error('News API key is missing from environment variables.');
  }

  try {
    // For NewsAPI free tier, /top-headlines with 'q' for cities often yields 0 results.
    // We use /everything to ensure we get local news for the specific city.
    const url = new URL(`${BASE_URL}/everything`);
    
    // Add the query parameter for the city name
    if (city) {
      // Append India to reduce ambiguous city names
      url.searchParams.append('q', `${city} India`);
    } else {
      url.searchParams.append('q', 'India');
    }
    
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('language', 'en');
    
    url.searchParams.append('pageSize', pageSize.toString());
    url.searchParams.append('page', page.toString());
    url.searchParams.append('apiKey', NEWS_API_KEY);

    const response = await fetch(url.toString());
    
    const data: NewsResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news from API.');
    }

    return data;
  } catch (error) {
    console.error('Error fetching city news:', error);
    throw error;
  }
};
