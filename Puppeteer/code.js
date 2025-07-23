import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 8765;

app.use(express.json());

app.post('/export', async (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" in request body' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
      ]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error rendering page:', err);
    res.status(500).json({ error: 'Failed to render page', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Puppeteer service running at http://localhost:${PORT}`);
});

export default app;