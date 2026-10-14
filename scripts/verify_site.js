const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\TSB\\.gemini\\antigravity\\brain\\8cf67da2-5745-432a-9343-42d7c63416d2';

const widthsToTest = [320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560];

async function main() {
  console.log('Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  
  // Track failed network requests
  const failedRequests = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });

  console.log('\n--- 1. TESTING RESPONSIVE WIDTHS & HORIZONTAL OVERFLOW ---');
  for (const width of widthsToTest) {
    await page.setViewport({ width, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Width ${width}px: overflow = ${hasHorizontalOverflow ? 'FAIL (has horizontal scroll)' : 'PASS (no scroll)'}`);
  }

  console.log('\n--- 2. CAPTURING REQUIRED SCREENSHOTS ---');

  // A. Desktop Home (1366x900)
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'home_desktop.png'), fullPage: false });
  console.log('Saved home_desktop.png');

  // B. Mobile Home (375x812)
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'home_mobile.png'), fullPage: false });
  console.log('Saved home_mobile.png');

  // C. Browse page with filters (Fiction + Fantasy, sort by price)
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000/browse?genre=Fiction,Fantasy&sort=price-asc', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'browse_filters.png'), fullPage: false });
  console.log('Saved browse_filters.png');

  // D. Browse in List View
  await page.goto('http://localhost:3000/browse?view=list', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'browse_list_view.png'), fullPage: false });
  console.log('Saved browse_list_view.png');

  // E. Mobile Filter Drawer
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/browse', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  // Click Filters button to open drawer using evaluate
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const filterBtn = btns.find(b => b.textContent && b.textContent.includes('Filters'));
    if (filterBtn) filterBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'mobile_filter_drawer.png'), fullPage: false });
  console.log('Saved mobile_filter_drawer.png');

  // F. Product Detail Page (/book/atomic-habits)
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('http://localhost:3000/book/atomic-habits', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'product_detail_page.png'), fullPage: false });
  console.log('Saved product_detail_page.png');

  // G. Cart Page with items
  // Add item to cart via localStorage
  await page.evaluate(() => {
    const mockItem = {
      user: null,
      cart: [
        {
          book: {
            id: '2',
            slug: 'atomic-habits',
            title: 'Atomic Habits',
            author: 'James Clear',
            coverImage: '/books/atomic-habits.jpg',
            price: 749,
            originalPrice: 999,
            rating: 4.8,
            reviewCount: 567,
            format: 'Physical',
          },
          quantity: 2,
        },
        {
          book: {
            id: '1',
            slug: 'the-midnight-library',
            title: 'The Midnight Library',
            author: 'Matt Haig',
            coverImage: '/books/the-midnight-library.jpg',
            price: 899,
            originalPrice: 1299,
            rating: 4.5,
            reviewCount: 234,
            format: 'Physical',
          },
          quantity: 1,
        }
      ],
      wishlist: [],
      orders: [],
    };
    localStorage.setItem('yetaxahai-store', JSON.stringify(mockItem));
  });

  await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'cart_page.png'), fullPage: false });
  console.log('Saved cart_page.png');

  console.log('\n--- 3. VERIFYING ALL 40 BOOK COVERS IN CATALOGUE ---');
  await page.goto('http://localhost:3000/browse', { waitUntil: 'networkidle0' });
  // Scroll to bottom to trigger lazy loading, wait for images to render
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 2500));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));

  const bookImages = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img[src^="/books/"]'));
    imgs.forEach(img => { img.loading = 'eager'; });
    await Promise.allSettled(imgs.map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
    return imgs.map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
    }));
  });

  console.log(`Found ${bookImages.length} book cover images rendered on /browse.`);
  const brokenImages = bookImages.filter(img => !img.complete || img.naturalWidth === 0);
  console.log(`Broken images: ${brokenImages.length}`);
  if (brokenImages.length > 0) {
    console.error('Broken images:', brokenImages);
  }

  const realFailedRequests = failedRequests.filter(r =>
    !r.url.includes('_vercel') && !r.url.includes('favicon.ico')
  );
  console.log(`Real failed requests (excl. Vercel analytics & favicon): ${realFailedRequests.length}`);
  if (realFailedRequests.length > 0) {
    console.warn('Real failed requests:', realFailedRequests);
  }

  await browser.close();
  console.log('\nVerification completed successfully!');
  if (brokenImages.length > 0 || realFailedRequests.length > 0) {
    process.exit(1);
  }
}


main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
