const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "/bible/malayalam-bible.json");
const chapterInfoFile = path.join(__dirname, "/bible-chapter-info.json");
const chapterSummaryFile = path.join(__dirname, "/bible-chapter-summary.json");
const outputDir = path.join(__dirname, "data/api/malayalam-bible");

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

  // Pre-calc verse counts
  const bookVerseCount = {};
  const chapterVerseCount = {};
  for (const v of verses) {
    const b = Number(v.b), c = Number(v.c);
    bookVerseCount[b] = (bookVerseCount[b] || 0) + 1;
    chapterVerseCount[`${b}-${c}`] = (chapterVerseCount[`${b}-${c}`] || 0) + 1;
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
        chapterCount: String(bookInfo.c || ""),
        chapter: String(chapterNum),
        verseCountInBook: String(bookVerseCount[bookNum] || ""),
        verseCountInChapter: String(chapterVerseCount[`${bookNum}-${chapterNum}`] || ""),
        verseNumber: String(verseNum),
        bookNameMalayalam: bookInfo.bm || "",
        bookNameEnglish: bookInfo.be || "",
        writerMalayalam: bookInfo.w || "",
        writerEnglish: bookInfo.we || "",
        dateInEnglish: bookInfo.de || "",
        dateInMalayalam: bookInfo.d || "",
        categoryInEnglish: bookInfo.cae || "",
        categoryInMalayalam: bookInfo.ca || ""
      };

      fs.writeFileSync(verseFile, JSON.stringify(enrichedVerse, null, 2), "utf8");
    }

    processedVerses++;
    printProgress(processedVerses, totalVerses);
  }

  console.log("\n📖 Writing summary.json files...");
  for (const info of chapterInfo) {
    const b = info.n;
    const summaryDir = path.join(outputDir, `${b}`);
    ensureDir(summaryDir);

    const summaryFile = path.join(summaryDir, "summary.json");
    const summaryObj = {
      summary: chapterSummaryMap[b] || "",
      book: String(b),
      chapterCount: String(info.c || ""),
      verseCountInBook: String(bookVerseCount[b] || ""),
      bookNameMalayalam: info.bm || "",
      bookNameEnglish: info.be || "",
      writerMalayalam: info.w || "",
      writerEnglish: info.we || "",
      dateInEnglish: info.de || "",
      dateInMalayalam: info.d || "",
      categoryInEnglish: info.cae || "",
      categoryInMalayalam: info.ca || ""
    };

    fs.writeFileSync(summaryFile, JSON.stringify(summaryObj, null, 2), "utf8");
  }

  console.log("✅ All verses and summaries processed!");
}

main().catch(err => console.error("❌ Error:", err));
