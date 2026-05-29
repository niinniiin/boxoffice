import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  const apiKey = process.env.KOBIS_API_KEY || 'ea6264853575a7b3188c9076441a7562';

  // API Route: Daily Box Office
  app.get('/api/boxoffice', async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string' || !/^\d{8}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Expected YYYYMMDD.' });
      }

      console.log(`[Proxy] Fetching Daily Box Office for date: ${date}`);
      const url = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${date}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS API returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching box office:', error);
      res.status(500).json({ status: 'fail', message: error.message || 'Failed to fetch box office data' });
    }
  });

  // API Route: Movie Details
  app.get('/api/movie', async (req, res) => {
    try {
      const { movieCd } = req.query;
      if (!movieCd || typeof movieCd !== 'string') {
        return res.status(400).json({ error: 'movieCd query parameter is required' });
      }

      console.log(`[Proxy] Fetching Movie Details for box office movie CD: ${movieCd}`);
      const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`KOBIS API returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching movie details:', error);
      res.status(500).json({ status: 'fail', message: error.message || 'Failed to fetch movie details' });
    }
  });

  // Serve static assets / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
