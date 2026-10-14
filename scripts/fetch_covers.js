const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const booksMeta = [
  { id: '1', slug: 'the-midnight-library', title: 'The Midnight Library', author: 'Matt Haig', isbn: '9781786892706' },
  { id: '2', slug: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292' },
  { id: '3', slug: 'dune', title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719' },
  { id: '4', slug: 'the-silent-patient', title: 'The Silent Patient', author: 'Alex Michaelides', isbn: '9781250301697' },
  { id: '5', slug: 'the-name-of-the-wind', title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741' },
  { id: '6', slug: 'sapiens', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '9780062316110' },
  { id: '7', slug: 'pride-and-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518' },
  { id: '8', slug: 'the-alchemist', title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007' },
  { id: '9', slug: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', isbn: '9780812968255' },
  { id: '10', slug: 'the-great-gatsby', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565' },
  { id: '11', slug: 'project-hail-mary', title: 'Project Hail Mary', author: 'Andy Weir', isbn: '9780593135204' },
  { id: '12', slug: 'normal-people', title: 'Normal People', author: 'Sally Rooney', isbn: '9781984822178' },
  { id: '13', slug: 'the-psychology-of-money', title: 'The Psychology of Money', author: 'Morgan Housel', isbn: '9780857197689' },
  { id: '14', slug: 'and-then-there-were-none', title: 'And Then There Were None', author: 'Agatha Christie', isbn: '9780062073488' },
  { id: '15', slug: 'the-way-of-kings', title: 'The Way of Kings', author: 'Brandon Sanderson', isbn: '9780765365279' },
  { id: '16', slug: 'thinking-fast-and-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557' },
  { id: '17', slug: 'the-hobbit', title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227' },
  { id: '18', slug: 'where-the-crawdads-sing', title: 'Where the Crawdads Sing', author: 'Delia Owens', isbn: '9780735219090' },
  { id: '19', slug: '1984', title: '1984', author: 'George Orwell', isbn: '9780451524935' },
  { id: '20', slug: 'the-seven-husbands-of-evelyn-hugo', title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', isbn: '9781501161933' },
  { id: '21', slug: 'the-subtle-art-of-not-giving-a-fck', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', isbn: '9780062457714' },
  { id: '22', slug: 'the-house-in-the-cerulean-sea', title: 'The House in the Cerulean Sea', author: 'TJ Klune', isbn: '9781250217288' },
  { id: '23', slug: 'a-brief-history-of-time', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163' },
  { id: '24', slug: 'the-kite-runner', title: 'The Kite Runner', author: 'Khaled Hosseini', isbn: '9781594631931' },
  { id: '25', slug: 'educated', title: 'Educated', author: 'Tara Westover', isbn: '9780399590504' },
  { id: '26', slug: 'the-art-of-war', title: 'The Art of War', author: 'Sun Tzu', isbn: '9781590302255' },
  { id: '27', slug: 'circe', title: 'Circe', author: 'Madeline Miller', isbn: '9780316556347' },
  { id: '28', slug: 'the-girl-with-the-dragon-tattoo', title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307454546' },
  { id: '29', slug: 'beach-read', title: 'Beach Read', author: 'Emily Henry', isbn: '9781984806734' },
  { id: '30', slug: 'becoming', title: 'Becoming', author: 'Michelle Obama', isbn: '9781524763138' },
  { id: '31', slug: 'rich-dad-poor-dad', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', isbn: '9781612680194' },
  { id: '32', slug: 'the-catcher-in-the-rye', title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488' },
  { id: '33', slug: 'the-lord-of-the-rings', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '9780544003415' },
  { id: '34', slug: 'gone-girl', title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371' },
  { id: '35', slug: 'mans-search-for-meaning', title: 'Man\'s Search for Meaning', author: 'Viktor E. Frankl', isbn: '9780807014295' },
  { id: '36', slug: 'the-martian', title: 'The Martian', author: 'Andy Weir', isbn: '9780553418026' },
  { id: '37', slug: 'little-women', title: 'Little Women', author: 'Louisa May Alcott', isbn: '9780143106654' },
  { id: '38', slug: 'the-power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle', isbn: '9781577314806' },
  { id: '39', slug: 'the-complete-sherlock-holmes', title: 'The Complete Sherlock Holmes', author: 'Arthur Conan Doyle', isbn: '9780553328257' },
  { id: '40', slug: 'a-court-of-thorns-and-roses', title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas', isbn: '9781619634459' },
];

async function checkBook(book) {
  try {
    const cleanTitle = encodeURIComponent(book.title.replace(/[:'*]/g, ''));
    const cleanAuthor = encodeURIComponent(book.author.split(' ').pop());
    const res = await fetch(`https://openlibrary.org/search.json?title=${cleanTitle}&author=${cleanAuthor}&limit=3`);
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          return { ...book, cover_i: doc.cover_i, openLibraryTitle: doc.title };
        }
      }
    }
    return { ...book, cover_i: null };
  } catch (err) {
    return { ...book, cover_i: null, error: err.message };
  }
}

async function main() {
  console.log('Searching Open Library for 40 books...');
  const results = [];
  for (const b of booksMeta) {
    const res = await checkBook(b);
    console.log(`${res.id}: ${res.title} -> cover_i: ${res.cover_i}`);
    results.push(res);
    await new Promise(r => setTimeout(r, 400)); // slight pause to respect rate limits
  }
  fs.writeFileSync('scripts/openlibrary_results.json', JSON.stringify(results, null, 2));
}

main();
