const fs = require('fs');
const path = require('path');

// Define paths
const inputFile = path.join(__dirname, 'headings', 'bibleheadings.json');
const outputDir = path.join(__dirname, 'data/splitted-headings');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
}

// Read the combined JSON file
console.log('Reading bibleheadings.json...');
const bibleHeadings = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// Split into individual files (1-66)
console.log('Splitting into individual JSON files...');
for (let bookNum = 1; bookNum <= 66; bookNum++) {
    const bookKey = String(bookNum);

    if (bibleHeadings[bookKey]) {
        const outputFile = path.join(outputDir, `${bookNum}.json`);
        const content = JSON.stringify(bibleHeadings[bookKey], null, 4);

        fs.writeFileSync(outputFile, content, 'utf-8');
        console.log(`Created ${bookNum}.json with ${bibleHeadings[bookKey].length} headings`);
    } else {
        console.warn(`Warning: No data found for book ${bookNum}`);
    }
}

console.log('\nDone! Created 66 individual JSON files in the headings folder.');
