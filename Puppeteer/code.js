import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 9900;

app.use(express.json());

let browser; // Reused across requests

// Start the browser once when the server starts
(async () => {
  browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
    ],
  });
  console.log('✅ Puppeteer browser launched');
})();

app.post('/export', async (req, res) => {
  const { url, type } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" in request body' });
  }

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    if (type === 'pdf') {
      const pdfBuffer = await page.pdf({ format: 'A4' });
      await page.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
      return res.send(pdfBuffer);
    } else {
      await page.close();
      return res.status(200).json({ message: 'Not yet implemented.' });
    }
  } catch (err) {
    console.error('Error rendering page:', err);
    res.status(500).json({ error: 'Failed to render page', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`📄 Puppeteer service running at http://localhost:${PORT}`);
});

export default app;