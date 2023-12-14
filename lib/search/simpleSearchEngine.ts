import { SearchResult, pages } from '../data/pages';

class SimpleSearchEngine {
  private cachedResults: Record<string, SearchResult[]> = {};

  async search(query: string): Promise<SearchResult[]> {
    const normalizedQuery = query.toLowerCase();

    if (this.cachedResults[normalizedQuery]) {
      return this.cachedResults[normalizedQuery];
    }

    const results = pages.filter((page) =>
      new RegExp(normalizedQuery, 'i').test(page.content),
    );

    this.cachedResults[normalizedQuery] = results;

    return results;
  }
}

export { SimpleSearchEngine };
