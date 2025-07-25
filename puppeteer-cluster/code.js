import express from 'express';
import { Cluster } from 'puppeteer-cluster';

const app = express();
const PORT = 8800;

app.use(express.json());

let cluster;

(async () => {
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
    puppeteerOptions: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    timeout: 2 * 60 * 1000, 
    monitor: true, 
  });

  await cluster.task(async ({ page, data }) => {
    const { url } = data;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    return buffer;
  });

  app.post('/export', async (req, res) => {
    const { url, type = 'pdf' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing URL in request body' });
    }

    if (type !== 'pdf') {
      return res.status(400).json({ error: `Unsupported export type: ${type}` });
    }

    try {
      const pdfBuffer = await cluster.execute({ url });

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=export.pdf',
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation failed:', error);
      res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`✅ Export service running at http://localhost:${PORT}`);
  });
})();
