# Bible Data

Collection of bible data that can be used for development purposes.

## 📁 Project Structure

```
bible-data/
├── bible/                      # Source Bible JSON files
├── headings/                   # Bible headings data
├── cross-references/           # Cross-reference source files
├── data/                       # Generated output files
│   ├── api/                    # API-ready verse files
│   ├── splitted-headings/      # Split heading files
│   └── books-cross/            # Cross-reference files by book
├── bible-splitter.js           # Splits Bible into individual verse files
├── split-headings.js           # Splits headings into book files
├── convert-cross-references.js # Converts cross-references to JSON
├── bible-chapter-info.json     # Chapter metadata
└── bible-chapter-summary.json  # Chapter summaries
```

---

## 🛠️ Utility Scripts

### 1. Bible Splitter (`bible-splitter.js`)

Splits a complete Bible JSON file into individual verse files, enriched with metadata.

**Source:** Bible database files are obtained from [VerseView Bible Database](http://verseview.info/vv/bible-database/)

**Input:**
- `bible/{language}-bible.json` - Complete Bible verses (e.g., `malayalam-bible.json`, `tamil-bible.json`)
- `bible-chapter-info.json` - Book and chapter metadata
- `bible-chapter-summary.json` - Book summaries

**Output:**
- `data/api/{language}-bible/{book}/{chapter}/{verse}.json` - Individual verse files
- `data/api/{language}-bible/{book}/summary.json` - Book summary files

**Usage:**
```bash
# Interactive mode - prompts to select from available languages
node bible-splitter.js

# Direct mode - specify language as argument
node bible-splitter.js malayalam
node bible-splitter.js tamil
node bible-splitter.js english
```

**Interactive Mode Example:**
```
📚 Available Bible Languages:

  1. english
  2. malayalam
  3. tamil

Select a language (enter number): 2

🌐 Language: malayalam
📂 Input: bible/malayalam-bible.json
📂 Output: data/api/malayalam-bible/
```

**Output Format (verse file):**
```json
{
  "verse": "ആദിയിൽ ദൈവം ആകാശവും ഭൂമിയും സൃഷ്ടിച്ചു.",
  "book": "1",
  "chapterCount": "50",
  "chapter": "1",
  "verseCountInBook": "1533",
  "verseCountInChapter": "31",
  "verseNumber": "1",
  "bookNameMalayalam": "ഉല്‍‍പത്തി",
  "bookNameEnglish": "Genesis",
  "writerMalayalam": "മോശെ",
  "writerEnglish": "Moses",
  "dateInEnglish": "B.C. 1450-1410 (assumption)",
  "dateInMalayalam": "ബി.സി. 1450-1410 (അനുമാനം)",
  "categoryInEnglish": "Law",
  "categoryInMalayalam": "നിയമം"
}
```

---

### 2. Split Headings (`split-headings.js`)

Splits a combined Bible headings file into 66 individual book files.

**Input:**
- `headings/bibleheadings.json` - Combined headings for all books

**Output:**
- `data/splitted-headings/{1-66}.json` - Individual heading files per book

**Usage:**
```bash
node split-headings.js
```

---

### 3. Convert Cross-References (`convert-cross-references.js`)

Converts a tab-separated cross-references file into JSON format, organized by book.

**Source:** Cross-reference data is obtained from [OpenBible.info Labs](https://www.openbible.info/labs/cross-references/)

**Input:**
- `cross-references/cross_references.txt` - Tab-separated cross-reference data
- `cross-references/abbrevs.json` - Book abbreviation mappings

**Output:**
- `data/books-cross/{1-66}.json` - Cross-reference files per book

**Usage:**
```bash
node convert-cross-references.js
```

**Output Format:**
```json
[
  {
    "c": 1,           // Chapter number
    "v": 1,           // Verse number
    "to": ["19/90/2"], // Cross-reference targets (book/chapter/verse)
    "lyk": 58          // Likelihood/strength score
  }
]
```

**Note:** If unknown book abbreviations are found, the script will report them. Add missing abbreviations to `cross-references/abbrevs.json` and run again.

---

## 🚀 Getting Started

1. Clone the repository
2. Ensure Node.js is installed
3. Run any of the utility scripts:

```bash
# Split Bible into verse files
node bible-splitter.js

# Split headings into book files
node split-headings.js

# Convert cross-references
node convert-cross-references.js
```

---

## 📝 License

This data is provided for development purposes.