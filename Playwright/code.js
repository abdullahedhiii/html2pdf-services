import express from 'express';
import { chromium } from 'playwright'; 

const app = express();
const PORT = 8765;

app.use(express.json());

app.post('/export', async (req, res) => {
  const {url,type} = req.body
  let browser;
  try {
     browser = await chromium.launch({
      args: ['--no-sandbox'],
      headless: true
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load',timeout : 60000 });

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

try{
  app.listen(PORT, () => {
  console.log(`Playwright PDF service running at http://localhost:${PORT}`);
});
}
catch(err){
    console.error('Error starting server:', err);
}

export default app;