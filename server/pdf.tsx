import { readFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { Lease, premisesAddress } from '../shared/Lease';
import type { LeaseInput } from '../shared/types';
import { cities } from '../shared/cities';

const css = await readFile(new URL('../shared/lease.css', import.meta.url), 'utf8');
const files = new Set(Object.values(cities).flatMap((city) => city.exhibits.flatMap((e) => ('file' in e ? [e.file] : []))));
const assets = new Map(
  await Promise.all([...files].map(async (name) => [name, await readFile(new URL(`../assets/${name}`, import.meta.url))] as const)),
);

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function renderLease(input: LeaseInput): Promise<Uint8Array> {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${renderToStaticMarkup(
    <Lease input={input} />,
  )}</body></html>`;
  const footer = `<div style="font-family:Georgia,serif;font-size:8pt;color:#444;width:100%;padding:0 0.8in;display:flex;justify-content:space-between">
    <span>Residential Lease Agreement, ${escapeHtml(premisesAddress(input))}</span>
    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    return await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: { top: '0.75in', right: '0.8in', bottom: '0.9in', left: '0.8in' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: footer,
    });
  } finally {
    await browser.close();
  }
}

export async function leasePacket(input: LeaseInput): Promise<Uint8Array> {
  const packet = await PDFDocument.load(await renderLease(input));
  for (const exhibit of cities[input.city].exhibits) {
    if (!('file' in exhibit)) continue;
    const pages = await PDFDocument.load(assets.get(exhibit.file)!);
    for (const page of await packet.copyPages(pages, pages.getPageIndices())) packet.addPage(page);
  }
  packet.setTitle(`Residential Lease Agreement, ${premisesAddress(input)}`);
  return packet.save();
}
