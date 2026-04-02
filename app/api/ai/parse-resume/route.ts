import { NextRequest, NextResponse } from 'next/server';
import { parseResumeText } from '@/lib/resume/resume-parser';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function isAllowedFile(file: File): boolean {
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith('.pdf') || name.endsWith('.docx');
}

function getFileType(file: File): 'pdf' | 'docx' | null {
  if (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  ) {
    return 'pdf';
  }
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  ) {
    return 'docx';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Text extraction
// ---------------------------------------------------------------------------

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const pdf = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
    if (typeof pdf !== 'function') {
      throw new Error(`pdf-parse loaded as ${typeof pdf}, keys: ${Object.keys(pdfParse).join(',')}`);
    }
    const data = await pdf(buffer);
    return data.text;
  } catch (err) {
    console.error('PDF extraction inner error:', err);
    throw err;
  }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const extract = mammoth.extractRawText || (mammoth as any).default?.extractRawText;
  const result = await extract({ buffer });
  return result.value;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'A file is required. Please upload a PDF or DOCX resume.' },
        { status: 400 },
      );
    }

    // Validate file type
    if (!isAllowedFile(file)) {
      return NextResponse.json(
        {
          error:
            'Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).',
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`,
        },
        { status: 400 },
      );
    }

    const fileType = getFileType(file);
    if (!fileType) {
      return NextResponse.json(
        { error: 'Could not determine file type. Please upload a PDF or DOCX file.' },
        { status: 400 },
      );
    }

    // Extract text
    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText: string;

    try {
      rawText =
        fileType === 'pdf'
          ? await extractTextFromPdf(buffer)
          : await extractTextFromDocx(buffer);
    } catch (extractionError: unknown) {
      const errMsg = extractionError instanceof Error ? extractionError.message : String(extractionError);
      const errStack = extractionError instanceof Error ? extractionError.stack : '';
      console.error('Text extraction failed:', errMsg);
      console.error('Stack:', errStack);
      return NextResponse.json(
        {
          error:
            'Failed to extract text from the uploaded file. The file may be corrupted, password-protected, or contain only scanned images.',
        },
        { status: 500 },
      );
    }

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        {
          error:
            'No readable text found in the file. If this is a scanned document, please use a text-based PDF or DOCX instead.',
        },
        { status: 400 },
      );
    }

    // Parse the extracted text into structured resume data
    const parsed = parseResumeText(rawText);

    // Log first 10 lines for debugging name extraction
    const firstLines = rawText.split(/\r?\n/).slice(0, 10);
    console.log('=== Resume first 10 lines ===');
    firstLines.forEach((l, i) => console.log(`  [${i}] "${l}"`));
    console.log('=== Parsed name:', parsed.personal?.name, '===');

    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error('Resume parse error:', error);
    return NextResponse.json(
      {
        error:
          'An unexpected error occurred while parsing the resume. Please try again.',
      },
      { status: 500 },
    );
  }
}
