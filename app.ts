import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import { searchEngine } from './lib/search/searchEngine';

const app: Application = express();
const port = 9999;

const requestCounts: Record<string, { count: number; lastReset: number }> = {};
const MAX_REQUESTS = 20;
const WINDOW_MS = 5 * 1000;

app.use(
  cors({
    origin: ['https://search-example-client.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  }),
);

app.use(cookieParser());
app.use(express.json());

const limiter = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
) => {
  const ip = request.ip;
  const now = Date.now();

  if (!requestCounts[ip] || requestCounts[ip].lastReset + WINDOW_MS < now) {
    requestCounts[ip] = { count: 0, lastReset: now };
  }

  if (requestCounts[ip].count >= MAX_REQUESTS) {
    return response.status(429).json({
      error: 'Too Many Requests',
      message: `Wait around ${WINDOW_MS / 1000}s`,
    });
  }

  requestCounts[ip].count++;
  next();
};

app.get(
  '/search',
  limiter,
  async (request: express.Request, response: express.Response) => {
    try {
      const { query, count } = request.query;
      const decodedQuery = decodeURIComponent(query as string);
      const pages = await searchEngine.search(decodedQuery);
      const countOfResult = parseInt(count as string);

      response.status(200).json({
        count: pages.length,
        result: pages.map((page) => ({
          ...page,
          selected: countOfResult === page.id,
          content: `${page.id}. ${page.content}`,
        })),
      });
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  },
);

app.listen(port, () =>
  console.log(`Server is running on: http://localhost:${port}`),
);
