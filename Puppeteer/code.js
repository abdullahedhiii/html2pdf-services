import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/export', async (req, res) => {
  const {url,type} = req.body

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" in request body' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      // executablePath: '/usr/bin/chromium',
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
      ]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    if(type == 'pdf'){
        const pdfBuffer = await page.pdf({ format: 'A4' });  
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
        res.send(pdfBuffer);    
    }

    else{
      res.status(200).json({ message: 'Not yet implemented.' });
    }
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