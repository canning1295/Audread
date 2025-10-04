import puppeteer from 'puppeteer';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// POST /api/amazon/login { email, password }
app.post('/api/amazon/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.amazon.com/ap/signin');

    // Login flow
    await page.type('#ap_email', email);
    await page.click('#continue');
    await page.waitForSelector('#ap_password', { timeout: 5000 });
    await page.type('#ap_password', password);
    await page.click('#signInSubmit');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Go to Kindle library
    await page.goto('https://www.amazon.com/hz/mycd/digital-console/contentlist/booksAll');
    await page.waitForSelector('.contentTable', { timeout: 10000 });

    // Scrape book data
    const books = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.contentTable tbody tr'));
      return rows.map(row => {
        const title = row.querySelector('.titleColumn')?.textContent?.trim() || '';
        const author = row.querySelector('.authorColumn')?.textContent?.trim() || '';
        return { title, author };
      });
    });

    res.json({ books });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch library', details: err?.message || String(err) });
  } finally {
    if (browser) await browser.close();
  }
});

// Start server (for local dev)
if (require.main === module) {
  app.listen(4000, () => {
    console.log('Amazon library service running on port 4000');
  });
}

export default app;
