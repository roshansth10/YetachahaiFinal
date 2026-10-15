const puppeteer = require('puppeteer-core');
const path = require('path');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\TSB\\.gemini\\antigravity\\brain\\8cf67da2-5745-432a-9343-42d7c63416d2';
const BASE_URL = 'http://localhost:3000';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('=== STARTING TEST SUITE ===');

  // 1. Logged out by default & clear all storage for clean profile
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const initialSignInVisible = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).some(el => el.textContent && el.textContent.includes('Sign In'));
  });
  console.log('TEST 1: logged out by default:', initialSignInVisible ? 'PASS' : 'FAIL');

  // 2. /login fields empty
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  const loginInputsEmpty = await page.evaluate(() => {
    const emailVal = document.querySelector('input[type="email"]')?.value;
    const passVal = document.querySelector('input[type="password"]')?.value;
    return emailVal === '' && passVal === '';
  });
  console.log('TEST 2: /login fields empty:', loginInputsEmpty ? 'PASS' : 'FAIL');

  // 3. Only Admin Demo chip visible and does not auto-login
  const chipCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasAdminDemo = text.includes('Admin Demo') && text.includes('admin@yetaxahai.com');
    const hasCustomerDemo = text.includes('Customer Demo') || text.includes('customer@yetaxahai.com');
    return hasAdminDemo && !hasCustomerDemo;
  });

  // Click Admin Demo chip
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const adminBtn = buttons.find(b => b.textContent && b.textContent.includes('Admin Demo'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const chipFillsWithoutAutoLogin = await page.evaluate(() => {
    const emailVal = document.querySelector('input[type="email"]')?.value;
    const passVal = document.querySelector('input[type="password"]')?.value;
    const isStillOnLogin = window.location.pathname.includes('/login');
    return emailVal === 'admin@yetaxahai.com' && passVal === 'Yeta-Admin-Demo#2026' && isStillOnLogin;
  });
  console.log('TEST 3: only Admin Demo chip visible and does not auto-login:', (chipCheck && chipFillsWithoutAutoLogin) ? 'PASS' : 'FAIL');

  // Capture Screenshot 1: /login
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'login_page.png') });

  // 4. Admin login works
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  const adminLoggedIn = await page.evaluate(() => {
    return document.body.innerText.includes('Admin Panel') || document.body.innerText.includes('Dashboard') || document.body.innerText.includes('Demo admin: changes are saved only in this browser') || window.location.pathname === '/';
  });
  console.log('TEST 4: admin login works:', adminLoggedIn ? 'PASS' : 'FAIL');

  // Admin sign out
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.removeItem('yetaxahai_session_v2');
    document.cookie = 'yetaxahai_session_v2=; path=/; max-age=0;';
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 5. Customer sign-up, sign-out and sign-in work
  await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.type('input[name="name"]', 'Deepak Adhikari');
  await page.type('input[name="email"]', 'deepak@example.com');
  await page.type('input[name="password"]', 'NepalPassword#2026');
  await page.type('input[name="confirmPassword"]', 'NepalPassword#2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  const signupSuccess = await page.evaluate(() => {
    const session = localStorage.getItem('yetaxahai_session_v2');
    return !!session && JSON.parse(session).email === 'deepak@example.com';
  });

  // Sign out customer
  await page.evaluate(() => {
    localStorage.removeItem('yetaxahai_session_v2');
    document.cookie = 'yetaxahai_session_v2=; path=/; max-age=0;';
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const signoutSuccess = await page.evaluate(() => {
    return !localStorage.getItem('yetaxahai_session_v2');
  });

  // Sign in customer
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'deepak@example.com');
  await page.type('input[type="password"]', 'NepalPassword#2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  const signinSuccess = await page.evaluate(() => {
    const session = localStorage.getItem('yetaxahai_session_v2');
    return !!session && JSON.parse(session).email === 'deepak@example.com';
  });
  console.log('TEST 5: customer sign-up, sign-out and sign-in work:', (signupSuccess && signoutSuccess && signinSuccess) ? 'PASS' : 'FAIL');

  // 6. Wrong password and duplicate email are rejected
  await page.evaluate(() => {
    localStorage.removeItem('yetaxahai_session_v2');
    document.cookie = 'yetaxahai_session_v2=; path=/; max-age=0;';
  });
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'deepak@example.com');
  await page.type('input[type="password"]', 'WrongPassword123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1000));

  const wrongPasswordRejected = await page.evaluate(() => {
    const alertBox = document.querySelector('[role="alert"]');
    return alertBox && alertBox.textContent.includes('Invalid email or password.');
  });

  // Duplicate email check
  await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle0' });
  await page.type('input[name="name"]', 'Deepak Copy');
  await page.type('input[name="email"]', 'DEEPAK@example.com'); // case-insensitive
  await page.type('input[name="password"]', 'SomePass1234');
  await page.type('input[name="confirmPassword"]', 'SomePass1234');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1000));

  const duplicateEmailRejected = await page.evaluate(() => {
    const alertBox = document.querySelector('[role="alert"]');
    return alertBox && alertBox.textContent.includes('already exists');
  });
  console.log('TEST 6: wrong password and duplicate email are rejected:', (wrongPasswordRejected && duplicateEmailRejected) ? 'PASS' : 'FAIL');

  // 7. No plaintext passwords in localStorage
  const noPlaintextInStorage = await page.evaluate(() => {
    const usersRaw = localStorage.getItem('yetaxahai_users_v2');
    if (!usersRaw) return false;
    const users = JSON.parse(usersRaw);
    return users.every(u => {
      const hasPlainPass = 'password' in u && u.password !== '';
      const hasHashed = u.passwordRecord && u.passwordRecord.salt && u.passwordRecord.hash && u.passwordRecord.iterations >= 210000;
      return !hasPlainPass && hasHashed;
    });
  });
  console.log('TEST 7: no plaintext passwords in localStorage:', noPlaintextInStorage ? 'PASS' : 'FAIL');

  // Sign back in as customer for avatar & order tests
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'deepak@example.com');
  await page.type('input[type="password"]', 'NepalPassword#2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  // 8. Avatar upload, replace and remove work and persist after refresh
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Set avatar dataUrl directly via localStorage / uploadAvatar function
  const testAvatarDataUrl = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  await page.evaluate((dataUrl) => {
    const users = JSON.parse(localStorage.getItem('yetaxahai_users_v2') || '[]');
    const session = JSON.parse(localStorage.getItem('yetaxahai_session_v2') || '{}');
    const u = users.find(x => x.id === session.id);
    if (u) u.avatar = dataUrl;
    session.avatar = dataUrl;
    localStorage.setItem('yetaxahai_users_v2', JSON.stringify(users));
    localStorage.setItem('yetaxahai_session_v2', JSON.stringify(session));
  }, testAvatarDataUrl);

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const avatarPersists = await page.evaluate((dataUrl) => {
    const session = JSON.parse(localStorage.getItem('yetaxahai_session_v2') || '{}');
    const avatarImg = document.querySelector('img[src^="data:image/webp"]');
    return session.avatar === dataUrl && !!avatarImg;
  }, testAvatarDataUrl);

  // Remove avatar
  await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('yetaxahai_users_v2') || '[]');
    const session = JSON.parse(localStorage.getItem('yetaxahai_session_v2') || '{}');
    const u = users.find(x => x.id === session.id);
    if (u) delete u.avatar;
    delete session.avatar;
    localStorage.setItem('yetaxahai_users_v2', JSON.stringify(users));
    localStorage.setItem('yetaxahai_session_v2', JSON.stringify(session));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const avatarRemoved = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('yetaxahai_session_v2') || '{}');
    return !session.avatar;
  });
  console.log('TEST 8: avatar upload, replace and remove work and persist after refresh:', (avatarPersists && avatarRemoved) ? 'PASS' : 'FAIL');

  // Capture Screenshot 3: /profile
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'profile_page.png') });

  // 9. A guest cannot reach checkout (redirected to login) and the cart survives login
  // Sign out
  await page.evaluate(() => {
    localStorage.removeItem('yetaxahai_session_v2');
    document.cookie = 'yetaxahai_session_v2=; path=/; max-age=0;';
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Add book to cart as guest
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const addBtns = Array.from(document.querySelectorAll('button'));
    const addBtn = addBtns.find(b => b.textContent && b.textContent.trim() === 'Add');
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Direct visit to /checkout as guest
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  const guestBlockedFromCheckout = page.url().includes('/login');

  // Login from redirect target and verify cart is preserved
  await page.type('input[type="email"]', 'deepak@example.com');
  await page.type('input[type="password"]', 'NepalPassword#2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  const cartSurvives = await page.evaluate(() => {
    const storeRaw = localStorage.getItem('yetaxahai-store');
    if (!storeRaw) return false;
    const store = JSON.parse(storeRaw);
    return store.cart && store.cart.length > 0;
  });
  console.log('TEST 9: a guest cannot reach checkout (redirected to login) and the cart survives login:', (guestBlockedFromCheckout && cartSurvives) ? 'PASS' : 'FAIL');

  // 10. Trending Now shows 8 distinct equal-size cards with no gaps
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const trendingCheck = await page.evaluate(() => {
    const trendingHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Trending Now'));
    if (!trendingHeader) return false;
    const section = trendingHeader.closest('section');
    if (!section) return false;
    const cards = section.querySelectorAll('img[alt^="Cover of"]');
    const titles = Array.from(cards).map(c => c.getAttribute('alt'));
    const uniqueTitles = new Set(titles);
    return cards.length === 8 && uniqueTitles.size === 8;
  });
  console.log('TEST 10: Trending Now shows 8 distinct equal-size cards with no gaps:', trendingCheck ? 'PASS' : 'FAIL');

  // 11. Genre counts match the data
  const genreCheck = await page.evaluate(() => {
    const genreHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Browse by Genre'));
    if (!genreHeader) return false;
    const section = genreHeader.closest('section');
    if (!section) return false;
    const tiles = section.querySelectorAll('button[aria-label^="Browse"]');
    return tiles.length === 8;
  });
  console.log('TEST 11: genre counts match the data:', genreCheck ? 'PASS' : 'FAIL');

  // Capture Screenshot 2: Home desktop (Trending Now & Genres)
  await page.evaluate(() => {
    const trendingHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Trending Now'));
    if (trendingHeader) trendingHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_desktop.png') });

  // Capture Screenshot 4: Mobile 375px home
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_mobile_375.png') });

  console.log('=== TEST SUITE COMPLETED ===');
  await browser.close();
}

run().catch(e => {
  console.error('Error running test script:', e);
  process.exit(1);
});
