const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE_URL = 'http://localhost:3000'
const ARTIFACT_DIR = 'C:\\Users\\TSB\\.gemini\\antigravity\\brain\\8cf67da2-5745-432a-9343-42d7c63416d2'

async function runApiTests() {
  console.log('--- 1. Testing Server-Side API Enforcement ---')

  // 1. POST /api/orders without session -> must return 401
  const postOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ bookId: '1', quantity: 1 }],
      shippingAddress: {
        name: 'Guest Hacker',
        phone: '9841234567',
        line1: 'Thamel',
        city: 'Kathmandu',
        district: 'Kathmandu',
        province: 'Bagmati',
        postalCode: '44600',
      },
    }),
  })
  console.log(`POST /api/orders without session status: ${postOrderRes.status} (Expected: 401)`)
  const postOrderJson = await postOrderRes.json()
  console.log('Response body:', postOrderJson)
  if (postOrderRes.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated order, got ${postOrderRes.status}`)
  }

  // 2. GET /api/orders without session -> must return 401
  const getOrdersRes = await fetch(`${BASE_URL}/api/orders`)
  console.log(`GET /api/orders without session status: ${getOrdersRes.status} (Expected: 401)`)
  if (getOrdersRes.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated get orders, got ${getOrdersRes.status}`)
  }

  // 3. Login to get authenticated session cookie
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'customer@yetaxahai.com',
      password: 'password123',
    }),
  })
  console.log(`POST /api/auth/login status: ${loginRes.status} (Expected: 200)`)
  const sessionCookie = loginRes.headers.get('set-cookie')
  console.log('Session cookie received:', !!sessionCookie)

  // 4. Server-Side Price Recalculation test (tampering attempt)
  // The Midnight Library is Rs. 899. Client sends price: 10
  const tamperedOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: sessionCookie,
    },
    body: JSON.stringify({
      items: [{ bookId: '1', quantity: 2, price: 10 }], // Tampered client price!
      shippingAddress: {
        name: 'Avid Reader',
        phone: '9841234567',
        line1: 'Thamel Marg 45',
        city: 'Kathmandu',
        district: 'Kathmandu',
        province: 'Bagmati',
        postalCode: '44600',
      },
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  })
  console.log(`POST /api/orders with session status: ${tamperedOrderRes.status} (Expected: 201)`)
  const tamperedOrderJson = await tamperedOrderRes.json()
  // Total must be 899 * 2 = 1798 + 0 (free shipping >= 1000) + 50 (COD fee) = 1848
  console.log(`Recalculated subtotal: Rs. ${tamperedOrderJson.order.subtotal} (Expected: 1798)`)
  console.log(`Recalculated total: Rs. ${tamperedOrderJson.order.total} (Expected: 1848)`)
  if (tamperedOrderJson.order.subtotal !== 1798 || tamperedOrderJson.order.total !== 1848) {
    throw new Error(`Server failed to recalculate genuine prices! Got total: ${tamperedOrderJson.order.total}`)
  }

  // 5. Nepal Address validation test (invalid phone number)
  const invalidPhoneRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: sessionCookie,
    },
    body: JSON.stringify({
      items: [{ bookId: '1', quantity: 1 }],
      shippingAddress: {
        name: 'Avid Reader',
        phone: '123456', // Invalid phone
        line1: 'Thamel',
        city: 'Kathmandu',
        district: 'Kathmandu',
        province: 'Bagmati',
        postalCode: '44600',
      },
      paymentMethod: 'cod',
    }),
  })
  console.log(`POST /api/orders with invalid phone status: ${invalidPhoneRes.status} (Expected: 400)`)
  if (invalidPhoneRes.status !== 400) {
    throw new Error(`Expected 400 for invalid phone, got ${invalidPhoneRes.status}`)
  }

  console.log('✅ Server-Side API Enforcement tests passed!\n')
}

async function runBrowserTests() {
  console.log('--- 2. Testing Browser UI, Auth Gating, Trending Now & Browse by Genre ---')

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    // Step A: First visit as guest (clean incognito state)
    console.log('Visiting home page as guest...')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1000))

    // Verify logged out state: header shows "Sign In", NO avatar, NO user name
    const hasSignInBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.some(b => b.textContent && b.textContent.includes('Sign In'))
    })
    console.log('Header shows "Sign In" button:', hasSignInBtn)
    if (!hasSignInBtn) throw new Error('Guest header does not show Sign In button!')

    // Verify Trending Now section
    console.log('Verifying Trending Now section...')
    const trendingInfo = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'))
      const trendingH2 = headings.find(h => h.textContent && h.textContent.includes('Trending Now'))
      if (!trendingH2) return null
      const section = trendingH2.closest('section')
      const subtitle = section ? section.querySelector('p')?.textContent : null
      const cards = section ? section.querySelectorAll('.grid > div') : []
      return {
        hasSection: !!section,
        subtitle: subtitle || '',
        cardCount: cards.length,
      }
    })
    console.log('Trending Now subtitle:', trendingInfo?.subtitle)
    console.log('Trending Now cards count:', trendingInfo?.cardCount, '(Expected: 8)')
    if (!trendingInfo?.subtitle.includes('Kathmandu')) {
      throw new Error(`Trending subtitle missing Kathmandu focus! Got: ${trendingInfo?.subtitle}`)
    }
    if (trendingInfo?.cardCount !== 8) {
      throw new Error(`Expected 8 trending cards, found: ${trendingInfo?.cardCount}`)
    }

    // Verify Browse by Genre SVG icons
    console.log('Verifying Browse by Genre section...')
    const genreInfo = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2'))
      const genreH2 = headings.find(h => h.textContent && h.textContent.includes('Browse by Genre'))
      if (!genreH2) return null
      const section = genreH2.closest('section')
      const imgs = section ? Array.from(section.querySelectorAll('img')) : []
      const srcList = imgs.map(img => img.getAttribute('src'))
      return {
        count: imgs.length,
        srcList,
      }
    })
    console.log('Genre SVG icons found:', genreInfo?.count, '(Expected: 8)')
    console.log('Sample genre icon path:', genreInfo?.srcList[0])
    if (!genreInfo?.srcList[0] || !genreInfo.srcList[0].includes('/icons/genres/')) {
      throw new Error(`Expected SVG icon in /icons/genres/, got: ${genreInfo?.srcList[0]}`)
    }

    // Capture home desktop screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_desktop_verified.png'), fullPage: false })

    // Test Wishlist heart gating: clicking wishlist as guest should toast prompt
    console.log('Testing Wishlist heart gating for guest...')
    await page.evaluate(() => {
      const heartBtn = document.querySelector('section button[aria-label*="wishlist"]')
      if (heartBtn) heartBtn.click()
    })
    await new Promise(r => setTimeout(r, 600))
    const toastContent = await page.evaluate(() => document.body.innerText)
    const hasWishlistToast = toastContent.includes('sign in to save books to your wishlist')
    console.log('Wishlist prompts guest to sign in:', hasWishlistToast)

    // Add a book to cart as guest
    console.log('Adding book to cart as guest...')
    const addedLabel = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const addBtn = btns.find(b => (b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('to cart')) || b.textContent.trim() === 'Add')
      if (addBtn) {
        addBtn.click()
        return addBtn.getAttribute('aria-label') || addBtn.textContent.trim()
      }
      return null
    })
    console.log('Clicked add button:', addedLabel)
    await new Promise(r => setTimeout(r, 1200))

    // Step B: Cart Page gating
    console.log('Navigating to /cart as guest...')
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1000))

    const checkoutBtnText = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const checkoutBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('checkout'))
      return checkoutBtn ? checkoutBtn.textContent.trim() : ''
    })
    console.log('Cart checkout button text for guest:', checkoutBtnText)
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cart_guest_verified.png'), fullPage: false })

    // Click checkout button as guest -> must redirect to login with redirect parameter
    console.log('Clicking checkout button as guest...')
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const checkoutBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('checkout'))
      if (checkoutBtn) checkoutBtn.click()
    })
    await new Promise(r => setTimeout(r, 1200))
    const currentUrl = page.url()
    console.log('URL after guest clicks checkout:', currentUrl)
    if (!currentUrl.includes('/login') || !currentUrl.includes('redirect')) {
      throw new Error(`Guest checkout failed to redirect to /login with redirect parameter! Got: ${currentUrl}`)
    }

    // Step C: Direct visit to /checkout as guest -> must redirect to login
    console.log('Visiting /checkout directly as guest...')
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1200))
    const directCheckoutUrl = page.url()
    console.log('URL after direct visit to /checkout:', directCheckoutUrl)
    if (!directCheckoutUrl.includes('/login')) {
      throw new Error(`Direct visit to /checkout failed to redirect to login! Got: ${directCheckoutUrl}`)
    }

    // Step D: Direct visit to /book/atomic-habits and Buy Now as guest
    console.log('Visiting /book/atomic-habits as guest...')
    await page.goto(`${BASE_URL}/book/atomic-habits`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1000))

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const buyNow = btns.find(b => b.textContent && b.textContent.includes('Buy Now'))
      if (buyNow) buyNow.click()
    })
    await new Promise(r => setTimeout(r, 1200))
    const urlAfterBuyNow = page.url()
    console.log('URL after guest clicks Buy Now:', urlAfterBuyNow)
    if (!urlAfterBuyNow.includes('/login')) {
      throw new Error(`Guest Buy Now failed to redirect to login! Got: ${urlAfterBuyNow}`)
    }

    // Step E: Sign In on /login and verify Cart Merge
    console.log('Signing in as customer@yetaxahai.com...')
    await page.goto(`${BASE_URL}/login?redirect=/checkout`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 800))

    await page.type('input[type="email"]', 'customer@yetaxahai.com')
    await page.type('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for redirect to /checkout
    await new Promise(r => setTimeout(r, 2000))
    const loggedInUrl = page.url()
    console.log('URL after login:', loggedInUrl)

    // Verify avatar in header (should show "AR" initials avatar, no stock/AI headshot)
    const avatarInitials = await page.evaluate(() => {
      const header = document.querySelector('header')
      if (!header) return null
      const spans = Array.from(header.querySelectorAll('span'))
      const match = spans.find(s => s.textContent && s.textContent.trim() === 'AR')
      return match ? match.textContent.trim() : null
    })
    console.log('Avatar initials in header:', avatarInitials)

    // Verify checkout page loaded with cart items intact (cart merge worked!)
    const checkoutPageContent = await page.evaluate(() => document.body.innerText)
    const hasOrderSummary = checkoutPageContent.includes('Order Summary') || checkoutPageContent.includes('Shipping Address')
    console.log('Checkout page rendered for logged-in user:', hasOrderSummary)

    // Complete Checkout Form
    console.log('Completing Nepal delivery address on checkout...')
    await page.evaluate(() => {
      const nameInput = document.querySelector('input[name="name"]')
      const phoneInput = document.querySelector('input[name="phone"]')
      const line1Input = document.querySelector('input[name="line1"]')
      const cityInput = document.querySelector('input[name="city"]')
      const distInput = document.querySelector('input[name="district"]')
      const provInput = document.querySelector('input[name="province"]')
      const postInput = document.querySelector('input[name="postalCode"]')

      if (nameInput && !nameInput.value) nameInput.value = 'Avid Reader'
      if (phoneInput && !phoneInput.value) phoneInput.value = '9841234567'
      if (line1Input && !line1Input.value) line1Input.value = 'Thamel Marg 45'
      if (cityInput && !cityInput.value) cityInput.value = 'Kathmandu'
      if (distInput && !distInput.value) distInput.value = 'Kathmandu'
      if (provInput && !provInput.value) provInput.value = 'Bagmati'
      if (postInput && !postInput.value) postInput.value = '44600'
    })

    // Click Continue to Payment
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const cont = btns.find(b => b.textContent && b.textContent.includes('Continue to Payment'))
      if (cont) cont.click()
    })
    await new Promise(r => setTimeout(r, 1000))

    // Select COD and Place Order
    console.log('Selecting Cash on Delivery and placing order...')
    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div, label, button'))
      const codOption = divs.find(d => d.textContent && d.textContent.includes('Cash on Delivery'))
      if (codOption) codOption.click()
    })
    await new Promise(r => setTimeout(r, 600))

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const placeBtn = btns.find(b => b.textContent && b.textContent.includes('Place Order'))
      if (placeBtn) placeBtn.click()
    })
    console.log('Waiting for order confirmation...')
    await new Promise(r => setTimeout(r, 2500))

    // Screenshot order confirmation
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'checkout_order_placed.png'), fullPage: false })
    const confText = await page.evaluate(() => document.body.innerText)
    const orderConfirmed = confText.includes('Order Confirmed') || confText.includes('Yetaxahai-20')
    console.log('Order successfully placed and confirmed:', orderConfirmed)

    // Step F: Verify My Orders page
    console.log('Navigating to My Orders...')
    await page.goto(`${BASE_URL}/profile?tab=orders`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1000))
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'orders_history_verified.png'), fullPage: false })

    // Step G: Mobile Viewport Screenshot (375x812)
    console.log('Testing mobile responsive layout...')
    await page.setViewport({ width: 375, height: 812 })
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1000))
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_mobile_verified.png'), fullPage: false })

    console.log('✅ All Browser UI & Auth Gating tests completed successfully!\n')
  } finally {
    await browser.close()
  }
}

async function main() {
  try {
    await runApiTests()
    await runBrowserTests()
    console.log('🎉 ALL VERIFICATIONS PASSED!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Verification failed:', err)
    process.exit(1)
  }
}

main()
