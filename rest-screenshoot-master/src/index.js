const express = require('express');
const { chromium } = require('playwright');

const app = express();

app.get('/screenshot', async (req, res) => {
    const { url, pick = null, width = 1280, height = 900 } = req.query;

    if (!url) {
        return res.status(400).send('url is required');
    }

    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
            ],
        });

        const page = await browser.newPage();
        await page.setViewportSize({ width: Number(width), height: Number(height) });
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // Give React/Next.js time to hydrate and render content after network idle
        await page.waitForTimeout(3000);

        let buf;
        if (pick) {
            await page.waitForSelector(pick, { timeout: 10000 });
            const element = await page.$(pick);
            if (!element) {
                return res.status(404).send('selector not found');
            }
            buf = await element.screenshot({ type: 'png' });
        } else {
            buf = await page.screenshot({ type: 'png' });
        }

        res.type('image/png');
        res.send(buf);
    } catch (err) {
        console.error('[screenshot] error:', err.message);
        res.status(500).send('Screenshot failed');
    } finally {
        await browser?.close();
    }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Server listening on port ${port}`));
