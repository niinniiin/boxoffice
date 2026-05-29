import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// API Route: AI Movie Review Generator
app.post('/api/review/generate', async (req, res) => {
  try {
    const { movieTitle, genre, keywords } = req.body;
    if (!movieTitle) {
      return res.status(400).json({ error: 'movieTitle parameter is required in request body.' });
    }
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'At least one keyword is required.' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(400).json({
        error: 'Gemini API API key (GEMINI_API_KEY) is not set on the server. Please add this variable in settings or .env file.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `당신은 영화 평론가입니다. 다음 정보를 가진 영화에 대해, 전달된 3가지 키워드를 자연스럽고 조화롭게 포함하여 설득력 있고 마음을 사로잡는 감상평(영화 리뷰)을 3~4문장 분량으로 인상 깊게 작성해주세요.

영화 제목: ${movieTitle}
장르/추가 정보: ${genre || '영화'}
반드시 포함할 핵심 키워드 3개: ${keywords.filter(Boolean).join(', ')}

[작성 지침]
- 주어진 3가지 키워드는 변형 없이(접사 제외) 글 속에 그대로 한 번 이상 각각 자연스럽게 녹아 들어가야 합니다.
- 불필요한 메타 발언(예: "안녕하세요", "준비한 리뷰입니다", "이상 평론가였습니다")이나 부가 해설은 모두 제거하고, 오직 완성된 하나의 영화 감상평 본문 구절(3~4문장)만을 완성도 높은 한국어로 제시해 주세요.
- 완성된 글이 매우 세련되고 한 편의 명대사나 명평론처럼 느껴지도록 품격 있게 서술해 주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const review = response.text || '';
    res.json({ review: review.trim() });
  } catch (error: any) {
    console.error('Error generating AI review:', error);
    res.status(500).json({ error: error.message || 'Failed to generate review' });
  }
});

// Serve static assets / Vite middleware
async function setupViteAndListen() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } else {
    // Standard Production Environment (Cloud Run/Custom VM)
    // On Vercel, static serving is handled automatically by vercel.json rewriting,
    // and process.env.VERCEL is set as true, so we don't bind port 3000.
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  }
}

setupViteAndListen();

export default app;
