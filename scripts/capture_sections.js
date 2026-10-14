const path = require('path')
const puppeteer = require('puppeteer-core')

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE_URL = 'http://localhost:3000'
const ARTIFACT_DIR = 'C:\\Users\\TSB\\.gemini\\antigravity\\brain\\8cf67da2-5745-432a-9343-42d7c63416d2'

async function main() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1000))

    // 1. Scroll to Trending Now and capture
    await page.evaluate(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(el => el.textContent.includes('Trending Now'))
      if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    await new Promise(r => setTimeout(r, 800))
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'trending_now_grid.png'), fullPage: false })

    // 2. Scroll to Browse by Genre and capture
    await page.evaluate(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(el => el.textContent.includes('Browse by Genre'))
      if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    await new Promise(r => setTimeout(r, 800))
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browse_by_genre_svg.png'), fullPage: false })

    console.log('Successfully captured Trending Now and Browse by Genre screenshots.')
  } finally {
    await browser.close()
  }
}

main()
