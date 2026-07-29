import fs from 'node:fs/promises';

import { PDFParse } from 'pdf-parse';

export interface ExtractedPdfPage {
  page: number;
  text: string;
}

export interface ExtractedPdfContent {
  pages: ExtractedPdfPage[];
}

export const extractPdfContent = async (filePath: string): Promise<ExtractedPdfContent> => {
  const data = await fs.readFile(filePath);
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();

    return {
      pages: result.pages.map((page) => ({
        page: page.num,
        text: normalizeText(page.text),
      })),
    };
  } finally {
    await parser.destroy();
  }
};

const normalizeText = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
