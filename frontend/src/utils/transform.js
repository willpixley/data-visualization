const fs = require("fs");
const path = require("path");

export function transformData() {
// Input & output file paths
const INPUT_CSV = path.join(__dirname, "wide_stocks.csv");
const OUTPUT_CSV = path.join(__dirname, "long_stocks.csv");

// Read CSV file
const raw = fs.readFileSync(INPUT_CSV, "utf-8");
const lines = raw.split("\n").filter(l => l.trim() !== "");

// First line: header (dates + repeated columns)
const headerLine = lines[0].split(",");
const secondLine = lines[1].split(","); // second line has stock tickers

// Identify how many stocks there are by counting non-empty ticker names
const tickers = [];
for (let i = 1; i < secondLine.length; i += 5) { // 5 columns per stock
  if (secondLine[i].trim() !== "") {
    tickers.push(secondLine[i].trim());
  }
}

// Prepare long-format CSV header
const longHeader = ["Date", "Stock", "Open", "High", "Low", "Close", "Volume"];
const longRows = [longHeader.join(",")];

// Process each data row
for (let r = 2; r < lines.length; r++) { // skip first 2 rows
  const row = lines[r].split(",");
  const date = row[0];

  tickers.forEach((ticker, idx) => {
    const base = 1 + idx * 5; // first column after Date + 5 cols per stock
    const open = row[base + 3] || "";
    const high = row[base + 1] || "";
    const low = row[base + 2] || "";
    const close = row[base] || "";
    const volume = row[base + 4] || "";

    // Add to long rows
    longRows.push([date, ticker, open, high, low, close, volume].join(","));
  });
}

// Write output CSV
fs.writeFileSync(OUTPUT_CSV, longRows.join("\n"));
console.log(`Long-format CSV saved to ${OUTPUT_CSV}`);
}