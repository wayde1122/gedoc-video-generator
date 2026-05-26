import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createCanvas, DOMMatrix, ImageData, Path2D} from '@napi-rs/canvas';
import {documentCourseSchema} from '../src/course-schema';
import {loadProjectEnv, readNumberEnv} from './lib/env';
import {assertInsideRoot, coursePath, docsDir, documentPagesDir, outDir, rootDir} from './lib/paths';

type PdfJs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

const execFileAsync = promisify(execFile);
loadProjectEnv();

const workDir = path.join(outDir, 'document-work');
const pageDurationSeconds = readNumberEnv('DOCUMENT_PAGE_SECONDS', 6);
const supportedExtensions = new Set(['.pdf', '.pptx']);

Object.assign(globalThis, {
  DOMMatrix: globalThis.DOMMatrix ?? DOMMatrix,
  ImageData: globalThis.ImageData ?? ImageData,
  Path2D: globalThis.Path2D ?? Path2D,
});

const findFirstDocument = async () => {
  await fs.mkdir(docsDir, {recursive: true});
  const entries = await fs.readdir(docsDir, {withFileTypes: true});
  const docs = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => supportedExtensions.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'en'));

  if (docs.length === 0) {
    throw new Error(`No PDF or PPTX found. Put a .pdf or .pptx file in: ${docsDir}`);
  }

  return path.join(docsDir, docs[0]);
};

const findLibreOffice = async () => {
  const candidates = [
    process.env.LIBREOFFICE_PATH,
    'soffice',
    'libreoffice',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, ['--version'], {windowsHide: true});
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
};

const convertPptxToPdf = async (pptxPath: string) => {
  const soffice = await findLibreOffice();
  if (!soffice) {
    throw new Error(
      [
        'PPTX conversion requires LibreOffice.',
        'Install LibreOffice and make sure `soffice` is available,',
        'or manually export the PPTX to PDF and put the PDF in input/docs.',
      ].join(' '),
    );
  }

  await fs.mkdir(workDir, {recursive: true});
  await execFileAsync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', workDir, pptxPath], {
    windowsHide: true,
    timeout: 120000,
  });

  const expectedPdf = path.join(workDir, `${path.parse(pptxPath).name}.pdf`);
  try {
    await fs.access(expectedPdf);
    return expectedPdf;
  } catch {
    const pdfs = (await fs.readdir(workDir))
      .filter((name) => path.extname(name).toLowerCase() === '.pdf')
      .map((name) => path.join(workDir, name));
    if (pdfs.length > 0) {
      return pdfs[0];
    }
    throw new Error('LibreOffice finished but did not produce a PDF file.');
  }
};

const getPdfPath = async (documentPath: string) => {
  const ext = path.extname(documentPath).toLowerCase();
  if (ext === '.pdf') {
    return documentPath;
  }
  if (ext === '.pptx') {
    return convertPptxToPdf(documentPath);
  }
  throw new Error(`Unsupported document type: ${ext}`);
};

const loadPdfJs = async (): Promise<PdfJs> => {
  return import('pdfjs-dist/legacy/build/pdf.mjs');
};

const renderPdfPages = async (pdfPath: string) => {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await fs.readFile(pdfPath));
  const standardFontDataUrl = `${path.join(rootDir, 'node_modules', 'pdfjs-dist', 'standard_fonts')}${path.sep}`;
  const loadingTask = pdfjs.getDocument({data, disableWorker: true, standardFontDataUrl} as never);
  const pdf = await loadingTask.promise;
  const pageImages: string[] = [];

  await fs.rm(documentPagesDir, {recursive: true, force: true});
  await fs.mkdir(documentPagesDir, {recursive: true});

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const baseViewport = page.getViewport({scale: 1});
    const scale = Math.min(1920 / baseViewport.width, 1080 / baseViewport.height) * 2;
    const viewport = page.getViewport({scale});
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext('2d');

    await page.render({canvas, canvasContext: context, viewport} as never).promise;

    const imageName = `page-${String(pageNumber).padStart(3, '0')}.png`;
    const imagePath = path.join(documentPagesDir, imageName);
    await fs.writeFile(imagePath, canvas.toBuffer('image/png'));
    pageImages.push(`document-pages/${imageName}`);
  }

  await pdf.destroy();
  return pageImages;
};

const writeDocumentCourse = async (documentPath: string, pageImages: string[]) => {
  const title = path.parse(documentPath).name;
  const durationSeconds = pageImages.length * pageDurationSeconds;
  const course = documentCourseSchema.parse({
    title,
    subtitle: 'Document video',
    mode: 'document',
    durationSeconds,
    fps: 30,
    slides: pageImages.map((backgroundImage, index) => ({
      kind: 'document',
      start: index * pageDurationSeconds,
      end: (index + 1) * pageDurationSeconds,
      heading: `${title} - Page ${index + 1}`,
      caption: '',
      backgroundImage,
      sourcePage: index + 1,
    })),
  });

  await fs.writeFile(coursePath, `${JSON.stringify(course, null, 2)}\n`, 'utf8');
};

assertInsideRoot(docsDir);
assertInsideRoot(outDir);
assertInsideRoot(workDir);
assertInsideRoot(documentPagesDir);
assertInsideRoot(coursePath);

if (!Number.isFinite(pageDurationSeconds) || pageDurationSeconds <= 0) {
  throw new Error('DOCUMENT_PAGE_SECONDS must be a positive number.');
}

await fs.mkdir(outDir, {recursive: true});
await fs.rm(workDir, {recursive: true, force: true});
await fs.mkdir(workDir, {recursive: true});

const documentPath = await findFirstDocument();
const pdfPath = await getPdfPath(documentPath);
console.log(`Preparing document video from ${documentPath}`);

const pageImages = await renderPdfPages(pdfPath);
if (pageImages.length === 0) {
  throw new Error('The PDF did not contain any pages.');
}

await writeDocumentCourse(documentPath, pageImages);
console.log(`Rendered ${pageImages.length} page image(s) to ${documentPagesDir}`);
console.log(`course.json updated for document video (${pageDurationSeconds}s per page).`);
