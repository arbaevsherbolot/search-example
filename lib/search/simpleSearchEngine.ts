import { SearchResult, pages } from '../data/pages';

class SimpleSearchEngine {
  async search(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const page of pages) {
      if (page.content.toLowerCase().includes(query.toLowerCase())) {
        results.push(page);
      }
    }

    return results;
  }
}

export { SimpleSearchEngine };
