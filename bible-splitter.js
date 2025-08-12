const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "/bible/malayalam-bible.json");
const chapterInfoFile = path.join(__dirname, "/bible-chapter-info.json");
const chapterSummaryFile = path.join(__dirname, "/bible-chapter-summary.json");
const outputDir = path.join(__dirname, "/api/malayalam-bible");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function printProgress(current, total) {
  const percent = ((current / total) * 100).toFixed(1);
  process.stdout.write(`Progress: ${current}/${total} verses (${percent}%)\r`);
}

async function main() {
  console.log("📖 Reading Bible JSON...");
  const verses = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  console.log("📖 Reading chapter info...");
  const chapterInfo = JSON.parse(fs.readFileSync(chapterInfoFile, "utf8"));
  const chapterInfoMap = {};
  for (const info of chapterInfo) {
    chapterInfoMap[info.n] = info;
  }

  console.log("📖 Reading chapter summaries...");
  const chapterSummary = JSON.parse(fs.readFileSync(chapterSummaryFile, "utf8"));
  const chapterSummaryMap = {};
  for (const summary of chapterSummary) {
    chapterSummaryMap[summary.n] = summary.t;
  }

  const totalVerses = verses.length;
  let processedVerses = 0;

  for (const verse of verses) {
    const bookNum = Number(verse.b);
    const chapterNum = Number(verse.c);
    const verseNum = Number(verse.v);

    const bookInfo = chapterInfoMap[bookNum] || {};
    const bookSummary = chapterSummaryMap[bookNum] || "";

    const verseDir = path.join(outputDir, `${bookNum}`, `${chapterNum}`);
    ensureDir(verseDir);

    const verseFile = path.join(verseDir, `${verseNum}.json`);

    if (!fs.existsSync(verseFile)) {
      const enrichedVerse = {
        verse: verse.t,
        book: String(bookNum),
        chapter: String(chapterNum),
        verseNumber: String(verseNum),
        bookNameMalayalam: bookInfo.bm || "",
        bookNameEnglish: bookInfo.be || "",
        writerMalayalam: bookInfo.w || "",
        writerEnglish: bookInfo.we || "",
        dateInEnglish: bookInfo.de || "",
        dateInMalayalam: bookInfo.d || "",
        categoryInEnglish: bookInfo.cae || "",
        categoryInMalayalam: bookInfo.ca || "",
        bookSummary: bookSummary
      };

      fs.writeFileSync(verseFile, JSON.stringify(enrichedVerse, null, 2), "utf8");
    }

    processedVerses++;
    printProgress(processedVerses, totalVerses);
  }

  console.log("\n✅ All verses processed, enriched, and saved!");
}

main().catch(err => {
  console.error("❌ Error:", err);
});
