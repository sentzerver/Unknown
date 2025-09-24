import { Hono } from "hono";
import type { Env } from './core-utils';
import { CurriculumDesignEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { CurriculumParseRequest, CurriculumDesign, Strand, SubStrand, LearningOutcome } from "@shared/types";
// Helper to convert various Google Drive URLs to a direct text export URL
const getExportUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const match = path.match(/\/document\/d\/([a-zA-Z0-9_-]+)/) || path.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const id = match[1];
      if (path.includes('/document/')) {
        return `https://docs.google.com/document/d/${id}/export?format=txt`;
      }
      if (path.includes('/spreadsheets/')) {
        return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
};
// Basic parser for plain text content from curriculum designs
const parseTextContent = (text: string): Strand[] => {
  const lines = text.split('\n').map(line => line.trim().replace(/\r/g, '')).filter(line => line.length > 0);
  const strands: Strand[] = [];
  let currentStrand: Strand | null = null;
  let currentSubStrand: SubStrand | null = null;
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('strand:')) {
      const name = line.substring('strand:'.length).trim();
      currentStrand = { id: `strand-${strands.length + 1}`, name, subStrands: [] };
      strands.push(currentStrand);
      currentSubStrand = null;
    } else if (lowerLine.startsWith('sub-strand:') && currentStrand) {
      const name = line.substring('sub-strand:'.length).trim();
      currentSubStrand = { id: `sub-${currentStrand.id}-${currentStrand.subStrands.length + 1}`, name, learningOutcomes: [] };
      currentStrand.subStrands.push(currentSubStrand);
    } else if (currentSubStrand) {
      const outcome: LearningOutcome = {
        id: `lo-${currentSubStrand.id}-${currentSubStrand.learningOutcomes.length + 1}`,
        outcome: line,
      };
      currentSubStrand.learningOutcomes.push(outcome);
    }
  });
  if (strands.length === 0 && lines.length > 0) {
    const defaultStrand: Strand = { id: 'strand-1', name: 'General Topics', subStrands: [] };
    lines.forEach((line, index) => {
      defaultStrand.subStrands.push({
        id: `sub-1-${index + 1}`,
        name: line,
        learningOutcomes: [{ id: `lo-1-${index + 1}-1`, outcome: `Understand ${line}` }]
      });
    });
    strands.push(defaultStrand);
  }
  return strands;
};
// Scrapes text from Google Docs HTML view
const scrapeGoogleDocHTML = (html: string): string => {
  // This is a very basic scraper. It looks for the main content div and extracts text.
  // It might need to be adjusted if Google changes its HTML structure.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (!bodyMatch) return '';
  // Remove script and style tags
  let text = bodyMatch[1].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Replace block-level tags with newlines
  text = text.replace(/<(div|p|h[1-6]|li|br)[^>]*>/gi, '\n');
  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Clean up whitespace
  return text.split('\n').map(line => line.trim()).filter(line => line).join('\n');
};
// Fetches content from Google Drive, with a fallback to scraping HTML
async function fetchGoogleDriveContent(url: string): Promise<string> {
  const exportUrl = getExportUrl(url);
  // 1. Try the direct export method first
  if (exportUrl) {
    try {
      const response = await fetch(exportUrl, { headers: { 'User-Agent': 'Cloudflare-Worker' }, redirect: 'follow' });
      if (response.ok) {
        const textContent = await response.text();
        if (textContent.trim()) {
          return textContent;
        }
      }
    } catch (e) {
      console.warn("Export URL fetch failed, trying scrape fallback.", e);
    }
  }
  // 2. Fallback to fetching the HTML and scraping
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) {
      throw new Error(`Failed to fetch content. Status: ${response.status}. Ensure the document is public.`);
    }
    const htmlContent = await response.text();
    const scrapedText = scrapeGoogleDocHTML(htmlContent);
    if (!scrapedText.trim()) {
      throw new Error('The document appears to be empty or could not be scraped.');
    }
    return scrapedText;
  } catch (error) {
    console.error("Scraping fallback failed:", error);
    throw new Error("Could not retrieve content from the provided link using any method.");
  }
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // ElimuPlan API Routes
  app.post('/api/parse-curriculum', async (c) => {
    const body = await c.req.json<CurriculumParseRequest>().catch(() => null);
    if (!body || !isStr(body.url) || !isStr(body.name)) {
      return bad(c, 'A valid URL and a name for the design are required.');
    }
    try {
      const textContent = await fetchGoogleDriveContent(body.url);
      const parsedStrands = parseTextContent(textContent);
      if (parsedStrands.length === 0) {
        return bad(c, 'Could not parse any curriculum structure from the document.');
      }
      const newDesign: CurriculumDesign = {
        id: crypto.randomUUID(),
        name: body.name,
        sourceUrl: body.url,
        createdAt: Date.now(),
        strands: parsedStrands,
      };
      await CurriculumDesignEntity.create(c.env, newDesign);
      return ok(c, newDesign);
    } catch (error) {
      console.error('Error in /api/parse-curriculum:', error);
      const errorMessage = error instanceof Error ? error.message : 'An internal error occurred.';
      return c.json({ success: false, error: `Parsing failed: ${errorMessage}` }, 500);
    }
  });
  app.get('/api/curriculums', async (c) => {
    const { items } = await CurriculumDesignEntity.list(c.env);
    // Sort by most recently created
    items.sort((a, b) => b.createdAt - a.createdAt);
    return ok(c, items);
  });
  app.delete('/api/curriculums/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await CurriculumDesignEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Curriculum design not found');
    return ok(c, { id, deleted: true });
  });
}