const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');

// Define routes to pre-render
const routes = [
    '/',
    '/still_working'
];

async function prerender() {
    console.log('Starting pre-rendering...');

    // Start a local server serving the dist folder
    // We use 'serve' to serve the static files on a custom port
    const PORT = 3333;
    const server = exec(`npx serve -s dist -p ${PORT}`);

    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();

    for (const route of routes) {
        console.log(`Pre-rendering: ${route}`);

        await page.goto(`http://localhost:${PORT}${route}`, {
            waitUntil: 'networkidle0'
        });

        // Wait for Helmet to update the title
        await page.waitForFunction(() => document.title.includes('Co-Interview'), { timeout: 5000 }).catch(() => console.log('Title wait timeout'));

        // Get the HTML content
        const content = await page.content();

        // Determine output path
        const filePath = route === '/'
            ? path.join(__dirname, 'dist', 'index.html')
            : path.join(__dirname, 'dist', route.substring(1), 'index.html');

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // write file
        fs.writeFileSync(filePath, content);
        console.log(`Saved: ${filePath}`);
    }

    await browser.close();
    server.kill();
    console.log('Pre-rendering complete.');
    process.exit(0);
}

prerender().catch(err => {
    console.error(err);
    process.exit(1);
});
