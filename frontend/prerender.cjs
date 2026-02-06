const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');

// Define routes to pre-render
const routes = [
    '/',
    '/still_working',
    '/blog',
    '/policies',
    '/policies/terms',
    '/policies/privacy',
    '/policies/refund'
];

// Add blog post routes dynamically
const blogDir = path.join(__dirname, 'src', 'content', 'blog-html');
if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const slug = file.replace('.html', '');
            routes.push(`/blog/${slug}`);
        }
    });
}

async function prerender() {
    console.log('Starting pre-rendering...');

    // Start a local server serving the dist folder
    // We use 'serve' to serve the static files on a custom port
    const PORT = 3333;
    const server = exec(`npx serve -s dist -p ${PORT}`);

    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    for (const route of routes) {
        try {
            console.log(`Pre-rendering: ${route}`);

            await page.goto(`http://localhost:${PORT}${route}`, {
                waitUntil: 'domcontentloaded',
                timeout: 60000
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
        } catch (error) {
            console.error(`Failed to prerender ${route}:`, error);
            // Continue to next route
        }
    }

    // Generate Sitemap
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => {
        let priority = '0.7';
        let changefreq = 'weekly';

        if (route === '/') {
            priority = '1.0';
            changefreq = 'daily';
        } else if (route.startsWith('/blog')) {
            priority = '0.8';
            changefreq = 'weekly';
        } else if (route.startsWith('/policies')) {
            priority = '0.5';
            changefreq = 'monthly';
        }

        return `  <url>
    <loc>https://co-interview.com${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(__dirname, 'dist', 'sitemap.xml'), sitemapContent);
    console.log('Sitemap generated at dist/sitemap.xml');

    await browser.close();
    server.kill();
    console.log('Pre-rendering complete.');
    process.exit(0);
}

prerender().catch(err => {
    console.error(err);
    process.exit(1);
});
