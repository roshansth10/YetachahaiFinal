const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const books = [
  { id: '1', slug: 'the-midnight-library', title: 'The Midnight Library', author: 'Matt Haig', cover_i: 10313767 },
  { id: '2', slug: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', cover_i: 12539702 },
  { id: '3', slug: 'dune', title: 'Dune', author: 'Frank Herbert', cover_i: 11481354 },
  { id: '4', slug: 'the-silent-patient', title: 'The Silent Patient', author: 'Alex Michaelides', cover_i: 9407338 },
  { id: '5', slug: 'the-name-of-the-wind', title: 'The Name of the Wind', author: 'Patrick Rothfuss', cover_i: 11480483 },
  { id: '6', slug: 'sapiens', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', cover_i: 8634250 },
  { id: '7', slug: 'pride-and-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen', cover_i: 14348537 },
  { id: '8', slug: 'the-alchemist', title: 'The Alchemist', author: 'Paulo Coelho', cover_i: 11556106 },
  { id: '9', slug: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', cover_i: 211529 },
  { id: '10', slug: 'the-great-gatsby', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_i: 10590366 },
  { id: '11', slug: 'project-hail-mary', title: 'Project Hail Mary', author: 'Andy Weir', cover_i: 11200092 },
  { id: '12', slug: 'normal-people', title: 'Normal People', author: 'Sally Rooney', cover_i: 8794265 },
  { id: '13', slug: 'the-psychology-of-money', title: 'The Psychology of Money', author: 'Morgan Housel', cover_i: 10389354 },
  { id: '14', slug: 'and-then-there-were-none', title: 'And Then There Were None', author: 'Agatha Christie', cover_i: 11172296 },
  { id: '15', slug: 'the-way-of-kings', title: 'The Way of Kings', author: 'Brandon Sanderson', cover_i: 14658316 },
  { id: '16', slug: 'thinking-fast-and-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', cover_i: 13290711 },
  { id: '17', slug: 'the-hobbit', title: 'The Hobbit', author: 'J.R.R. Tolkien', cover_i: 14627509 },
  { id: '18', slug: 'where-the-crawdads-sing', title: 'Where the Crawdads Sing', author: 'Delia Owens', cover_i: 8362947 },
  { id: '19', slug: '1984', title: '1984', author: 'George Orwell', cover_i: 8745958 },
  { id: '20', slug: 'the-seven-husbands-of-evelyn-hugo', title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', cover_i: 8354226 },
  { id: '21', slug: 'the-subtle-art-of-not-giving-a-fck', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', cover_i: 8231990 },
  { id: '22', slug: 'the-house-in-the-cerulean-sea', title: 'The House in the Cerulean Sea', author: 'TJ Klune', cover_i: 9312772 },
  { id: '23', slug: 'a-brief-history-of-time', title: 'A Brief History of Time', author: 'Stephen Hawking', cover_i: 10432365 },
  { id: '24', slug: 'the-kite-runner', title: 'The Kite Runner', author: 'Khaled Hosseini', cover_i: 14846827 },
  { id: '25', slug: 'educated', title: 'Educated', author: 'Tara Westover', cover_i: 8314077 },
  { id: '26', slug: 'the-art-of-war', title: 'The Art of War', author: 'Sun Tzu', cover_i: 4849549 },
  { id: '27', slug: 'circe', title: 'Circe', author: 'Madeline Miller', cover_i: 8739376 },
  { id: '28', slug: 'the-girl-with-the-dragon-tattoo', title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', cover_i: 9274740 },
  { id: '29', slug: 'beach-read', title: 'Beach Read', author: 'Emily Henry', cover_i: 9426296 },
  { id: '30', slug: 'becoming', title: 'Becoming', author: 'Michelle Obama', cover_i: 8824664 },
  { id: '31', slug: 'rich-dad-poor-dad', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', cover_i: 8315603 },
  { id: '32', slug: 'the-catcher-in-the-rye', title: 'The Catcher in the Rye', author: 'J.D. Salinger', cover_i: 9273490 },
  { id: '33', slug: 'the-lord-of-the-rings', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', cover_i: 14625765 },
  { id: '34', slug: 'gone-girl', title: 'Gone Girl', author: 'Gillian Flynn', cover_i: 8368314 },
  { id: '35', slug: 'mans-search-for-meaning', title: 'Man\'s Search for Meaning', author: 'Viktor E. Frankl', cover_i: 11203708 },
  { id: '36', slug: 'the-martian', title: 'The Martian', author: 'Andy Weir', cover_i: 11447888 },
  { id: '37', slug: 'little-women', title: 'Little Women', author: 'Louisa May Alcott', cover_i: 8775559 },
  { id: '38', slug: 'the-power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle', cover_i: 551262 },
  { id: '39', slug: 'the-complete-sherlock-holmes', title: 'The Complete Sherlock Holmes', author: 'Arthur Conan Doyle', cover_i: 12501284 },
  { id: '40', slug: 'a-court-of-thorns-and-roses', title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas', cover_i: 15254465 },
];

const destDir = path.join(__dirname, '..', 'public', 'books');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Typographic placeholder generator if needed
async function generateTypographicCover(book, destPath) {
  const width = 600;
  const height = 900;
  const bgColors = ['#2C3E50', '#8E44AD', '#2980B9', '#D35400', '#27AE60', '#C0392B', '#16A085', '#7F8C8D'];
  const bgColor = bgColors[parseInt(book.id, 10) % bgColors.length];
  
  // Escape XML
  const escapeXml = (str) => str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${bgColor}"/>
    <rect x="25" y="25" width="${width - 50}" height="${height - 50}" fill="none" stroke="#F5ECD7" stroke-width="2" stroke-opacity="0.4"/>
    <rect x="35" y="35" width="${width - 70}" height="${height - 70}" fill="none" stroke="#F5ECD7" stroke-width="1" stroke-opacity="0.2"/>
    <text x="300" y="200" font-family="Georgia, serif" font-size="20" fill="#F5ECD7" letter-spacing="4" text-anchor="middle" opacity="0.8">YETAXAHAI CLASSICS</text>
    <text x="300" y="420" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${escapeXml(book.title)}
    </text>
    <line x1="200" y1="480" x2="400" y2="480" stroke="#E0533C" stroke-width="3" />
    <text x="300" y="540" font-family="sans-serif" font-size="22" fill="#F5ECD7" text-anchor="middle" font-style="italic">
      ${escapeXml(book.author)}
    </text>
    <text x="300" y="820" font-family="monospace" font-size="14" fill="#F5ECD7" text-anchor="middle" opacity="0.6">EDITION RS. NPR</text>
  </svg>
  `;

  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(destPath);
}

async function processBook(book) {
  const destPath = path.join(destDir, `${book.slug}.jpg`);
  const url = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    
    // Check if buffer is a real image
    const meta = await sharp(buf).metadata();
    if (!meta.width || meta.width < 50 || meta.height < 50) {
      throw new Error(`Corrupted/blank cover (width: ${meta.width}, height: ${meta.height})`);
    }

    // Target at least 600px wide, or maintain high resolution
    let transformer = sharp(buf);
    if (meta.width < 600) {
      // Upscale cleanly to 600px width keeping aspect ratio
      transformer = transformer.resize({ width: 600 });
    } else if (meta.width > 1200) {
      transformer = transformer.resize({ width: 1000 });
    }

    await transformer.jpeg({ quality: 85, mozjpeg: true }).toFile(destPath);
    const finalMeta = await sharp(destPath).metadata();
    console.log(`[OK] ${book.id}: ${book.slug}.jpg (${finalMeta.width}x${finalMeta.height})`);
    return { ...book, success: true, width: finalMeta.width, height: finalMeta.height, placeholder: false };
  } catch (err) {
    console.warn(`[WARN] Failed to download cover for ${book.title}: ${err.message}. Generating typographic placeholder.`);
    await generateTypographicCover(book, destPath);
    const finalMeta = await sharp(destPath).metadata();
    return { ...book, success: true, width: finalMeta.width, height: finalMeta.height, placeholder: true, reason: err.message };
  }
}

async function run() {
  console.log(`Starting download of ${books.length} covers...`);
  const results = [];
  for (const book of books) {
    const res = await processBook(book);
    results.push(res);
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Verify no duplicates
  const hashes = new Set();
  const duplicates = [];
  for (const r of results) {
    const filePath = path.join(destDir, `${r.slug}.jpg`);
    const data = fs.readFileSync(filePath);
    const hash = require('crypto').createHash('md5').update(data).digest('hex');
    if (hashes.has(hash)) {
      duplicates.push({ id: r.id, slug: r.slug, hash });
    } else {
      hashes.add(hash);
    }
  }

  console.log('\n--- VERIFICATION REPORT ---');
  console.log(`Total covers processed: ${results.length}`);
  console.log(`Typographic placeholders used: ${results.filter(r => r.placeholder).length}`);
  console.log(`Duplicate covers detected: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.error('Duplicates:', duplicates);
  }
  fs.writeFileSync('scripts/download_report.json', JSON.stringify({ results, duplicates }, null, 2));
}

run();
