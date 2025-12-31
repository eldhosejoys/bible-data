const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const abbrevsFilePath = path.join(__dirname, 'cross-references/abbrevs.json');
const inputFilePath = path.join(__dirname, 'cross-references/cross_references.txt');
const outputDir = path.join(__dirname, 'data/books-cross');

// A Set to store all unique unknown abbreviations we find
const unknownAbbrevs = new Set();

/**
 * Parses a verse reference string (e.g., "Gen.1.1") into its components.
 */
function parseVerse(verseString, abbrevsMap, lineNumber) {
    const match = verseString.match(/^(.+?)\.(\d+)\.(\d+)$/);
    if (!match) {
        console.warn(`[Line ${lineNumber}] Could not parse verse format: ${verseString}`);
        return null;
    }

    const [, bookAbbrev, chapter, verse] = match;
    const bookNum = abbrevsMap[bookAbbrev];

    if (!bookNum) {
        if (!unknownAbbrevs.has(bookAbbrev)) {
            console.warn(`[Line ${lineNumber}] Unknown book abbreviation found: '${bookAbbrev}'`);
            unknownAbbrevs.add(bookAbbrev);
        }
        return null;
    }

    return {
        book: bookAbbrev,
        bookNum: bookNum,
        chapter: parseInt(chapter, 10),
        verse: parseInt(verse, 10)
    };
}

/**
 * Parses a 'toVerse' string.
 * If it's a single verse, returns an array with one element.
 * If it's a range, returns an array with the start and end verses.
 */
function formatToVerse(toVerseString, abbrevsMap, lineNumber) {
    // If it's NOT a range, handle it as a single verse.
    if (!toVerseString.includes('-')) {
        const parsed = parseVerse(toVerseString, abbrevsMap, lineNumber);
        return parsed ? [`${parsed.bookNum}/${parsed.chapter}/${parsed.verse}`] : [];
    }

    // --- THIS IS THE MODIFIED LOGIC FOR HANDLING RANGES ---
    const [startVerseStr, endVerseStr] = toVerseString.split('-');
    const startVerse = parseVerse(startVerseStr, abbrevsMap, lineNumber);
    if (!startVerse) return [];

    let endVerse;
    // Handle ranges where the end is just a number (e.g., "Gen.1.1-5")
    if (endVerseStr.includes('.')) {
        endVerse = parseVerse(endVerseStr, abbrevsMap, lineNumber);
    } else {
        // Re-use the book and chapter from the start verse
        endVerse = { ...startVerse, verse: parseInt(endVerseStr, 10) };
    }

    if (!endVerse || isNaN(endVerse.verse)) {
        console.warn(`[Line ${lineNumber}] Could not parse range's end verse: ${toVerseString}`);
        return [];
    }

    const startVerseFormatted = `${startVerse.bookNum}/${startVerse.chapter}/${startVerse.verse}`;
    const endVerseFormatted = `${endVerse.bookNum}/${endVerse.chapter}/${endVerse.verse}`;

    // If start and end are identical (e.g., from a malformed range "Gen.1.1-1"), just return one.
    if (startVerseFormatted === endVerseFormatted) {
        return [startVerseFormatted];
    }

    // Return an array with only the start and end of the range.
    return [startVerseFormatted, endVerseFormatted];
}

// --- Main Execution ---
try {
    const abbrevsMap = JSON.parse(fs.readFileSync(abbrevsFilePath, 'utf8'));
    const fileContent = fs.readFileSync(inputFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');

    if (lines.length <= 1) {
        console.log('The file is empty or contains only a header.');
        return;
    }

    const groupedData = {};

    for (let i = 1; i < lines.length; i++) {
        const lineNumber = i + 1;
        const line = lines[i];
        const columns = line.split('\t');
        if (columns.length < 3) continue;

        const fromVerse = parseVerse(columns[0], abbrevsMap, lineNumber);
        if (!fromVerse) continue;

        const toVerses = formatToVerse(columns[1], abbrevsMap, lineNumber);
        if (toVerses.length === 0) continue;

        const crossRefObject = {
            // b: fromVerse.bookNum, // no need actually to reduce size since saved as file name
            c: fromVerse.chapter,
            v: fromVerse.verse,
            to: toVerses,
            lyk: parseInt(columns[2], 10)
        };

        if (!groupedData[fromVerse.bookNum]) {
            groupedData[fromVerse.bookNum] = [];
        }
        groupedData[fromVerse.bookNum].push(crossRefObject);
    }

    // --- Final Report and File Writing ---
    if (unknownAbbrevs.size > 0) {
        console.error("\n--- DEBUG SUMMARY ---");
        console.error("Conversion failed. Found unknown abbreviations:");
        console.error(Array.from(unknownAbbrevs).join(', '));
        console.error(`\nPlease add these to '${path.basename(abbrevsFilePath)}' and run again.`);
    } else {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        let filesWritten = 0;
        for (const bookNumber in groupedData) {
            const bookData = groupedData[bookNumber];
            const outputFilePath = path.join(outputDir, `${bookNumber}.json`);
            const jsonString = JSON.stringify(bookData, null, 2);
            fs.writeFileSync(outputFilePath, jsonString, 'utf8');
            filesWritten++;
        }

        console.log(`\nSuccess! Conversion complete.`);
        console.log(`${filesWritten} files were written to the '${outputDir}' directory.`);
    }
} catch (error) {
    console.error('An error occurred:', error);
}