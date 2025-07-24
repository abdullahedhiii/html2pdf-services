import express from 'express';
import { chromium } from 'playwright';

const app = express();
const PORT = 8765;

app.use(express.json());

let browser;

(async () => {
  try {
    browser = await chromium.launch({
      // executablePath: '/usr/bin/chromium',
      headless: true,
      args: ['--no-sandbox']
    });

    app.post('/export', async (req, res) => {
      const { url, type } = req.body;

      if (!url || !type) {
        return res.status(400).json({ error: 'Missing url or type in request body' });
      }

      const context = await browser.newContext(); 
      const page = await context.newPage();

      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        if (type === 'pdf') {
          const pdfBuffer = await page.pdf({ format: 'A4' });
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
          res.send(pdfBuffer);
        } else {
          res.status(400).json({ error: 'Unsupported export type' });
        }
      } catch (err) {
        console.error('Error rendering page:', err);
        res.status(500).json({ error: 'Failed to render page', details: err.message });
      } finally {
        await context.close(); 
      }
    });

    app.listen(PORT, () => {
      console.log(`Playwright PDF service running at http://localhost:${PORT}`);
    });

    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await browser?.close();
      process.exit();
    });

  } catch (err) {
    console.error('Failed to launch browser:', err);
    process.exit(1);
  }
})();

export default app;
