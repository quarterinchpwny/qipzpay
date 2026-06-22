import axios from "axios";
import { PDFParse } from "pdf-parse";

interface Item {
  itemName: string;
  price: number | null;
}

interface CurrentCategory {
  name: string;
  items: Item[];
}

export async function checkPdfExists(url: string): Promise<boolean> {
  try {
    await axios.head(url);
    return true;
  } catch {
    return false;
  }
}

export async function parsePDF(url: string): Promise<CurrentCategory[]> {
  function mergeLines(lines: string[]): string[] {
    const merged: string[] = [];
    const standalonePrice = /^(\d+(\.\d+)?|n\/a\w*)$/i;
    const fragmentLine = (line: string) =>
      !standalonePrice.test(line) &&
      !line.match(/(\d+(\.\d+)?|n\/a\w*)$/i) &&
      (line.startsWith("(") || /^[a-z]/.test(line) || /^\w+\)/.test(line));

    const isNoiseRaw = (line: string) =>
      line.startsWith("Page") ||
      line.startsWith("--") ||
      line.includes("COMMODITY SPECIFICATION") ||
      line.includes("RETAIL PRICE PER") ||
      line.includes("UNIT (P/UNIT)") ||
      line === "PREVAILING" ||
      line.includes("Department of Agriculture") ||
      line.includes("DAILY PRICE INDEX") ||
      line.includes("National Capital Region") ||
      line.includes("Prevailing Retail Price") ||
      line.match(/^\(.*\)$/) !== null;

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];
      if (!current) continue;
      const line = current.trim();
      if (!line) continue;

      if (isNoiseRaw(line)) continue;

      // merge consecutive ALL-CAPS lines (e.g. "OTHER LIVESTOCK MEAT" + "PRODUCTS")
      // but only if next line is also ALL-CAPS with no digits AND no items follow immediately
      if (line === line.toUpperCase() && !line.match(/\d/)) {
        let mergedLine = line;
        const next = lines[i + 1]?.trim() ?? "";
        if (
          next &&
          next === next.toUpperCase() &&
          !next.match(/\d/) &&
          !isNoiseRaw(next)
        ) {
          mergedLine += " " + next;
          i++;
        }
        merged.push(mergedLine);
        continue;
      }

      // merge comma-ending lines
      if (line.endsWith(",")) {
        const next = lines[i + 1];
        const after = lines[i + 2];

        if (!next) {
          merged.push(line);
          continue;
        }

        const nextTrimmed = next.trim();
        const afterTrimmed = after?.trim() ?? "";

        if (afterTrimmed && standalonePrice.test(afterTrimmed)) {
          merged.push(`${line.slice(0, -1)} ${nextTrimmed} ${afterTrimmed}`);
          i += 2;
        } else {
          merged.push(`${line.slice(0, -1)} ${nextTrimmed}`);
          i += 1;
        }
        continue;
      }

      // merge lines where continuation is a fragment (e.g. "diameter/bunch hd)" or "Brand)")
      if (fragmentLine(lines[i + 1]?.trim() ?? "")) {
        const next = lines[i + 1];
        const after = lines[i + 2];
        if (!next) {
          merged.push(line);
          continue;
        }
        const nextTrimmed = next.trim();
        const afterTrimmed = after?.trim() ?? "";

        if (afterTrimmed && standalonePrice.test(afterTrimmed)) {
          merged.push(`${line} ${nextTrimmed} ${afterTrimmed}`);
          i += 2;
        } else {
          merged.push(`${line} ${nextTrimmed}`);
          i += 1;
        }
        continue;
      }
      if (/^\w+\)/.test(lines[i + 1]?.trim() ?? "")) {
        const next = lines[i + 1];
        if (!next) {
          merged.push(line);
          continue;
        }
        merged.push(`${line} ${next.trim()}`);
        i += 1;
        continue;
      }
      merged.push(line);
    }

    return merged;
  }

  const isNoise = (line: string) =>
    line.includes("Department of Agriculture") ||
    line.includes("DAILY PRICE INDEX") ||
    line.includes("National Capital Region") ||
    line.includes("Prevailing Retail Price") ||
    line.match(/^\(.*\)$/) !== null ||
    line.includes("Page") ||
    line.includes("COMMODITY SPECIFICATION") ||
    line.includes("RETAIL PRICE PER") ||
    line.includes("UNIT (P/UNIT)") ||
    line.includes("PREVAILING") ||
    line.startsWith("--") ||
    line.startsWith("Note") ||
    line.startsWith("This is") ||
    line.startsWith("a)") ||
    line.startsWith("b)") ||
    line.startsWith("c)") ||
    line.startsWith("d)") ||
    line.startsWith("-") ||
    /^\d+\./.test(line); // numbered list items like "1. Agora Public Market"

  const parser = new PDFParse({ url });
  const parsedText = await parser.getText();
  const rawLines = parsedText.text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const lines = mergeLines(rawLines);

  let currentCategory: CurrentCategory | null = null;
  const results: CurrentCategory[] = [];
  const priceRegex = /(\d+(\.\d+)?|n\/a\w*)$/i;

  for (const line of lines) {
    if (isNoise(line)) continue;

    if (line === line.toUpperCase() && !priceRegex.test(line)) {
      currentCategory = { name: line, items: [] };
      results.push(currentCategory);
      continue;
    }

    const match = line.match(priceRegex);
    if (!match) continue;

    const priceRaw = match[0];
    const price = priceRaw.toLowerCase().startsWith("n/a")
      ? null
      : parseFloat(priceRaw);

    const commodityPart = line.replace(priceRegex, "").trim();

    currentCategory?.items.push({ itemName: commodityPart, price });
  }

  return results.filter((r) => r.items.length > 0);
}
