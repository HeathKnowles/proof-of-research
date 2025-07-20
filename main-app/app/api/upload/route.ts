import { NextRequest, NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!process.env.LIGHTHOUSE_API_KEY) {
      return NextResponse.json({ error: 'LIGHTHOUSE_API_KEY is not set' }, { status: 500 });
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create temp directory and file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-'));
    const tempFilePath = path.join(tempDir, file.name);

    // Write buffer to file
    await fs.writeFile(tempFilePath, buffer);

    // Upload file via lighthouse SDK (passing file path, not buffer)
    const response = await lighthouse.upload(tempFilePath, process.env.LIGHTHOUSE_API_KEY);

    // Cleanup temp files
    await fs.unlink(tempFilePath);
    await fs.rmdir(tempDir);

    // Check response structure
    if (!response || !response.data || !response.data.Hash) {
      return NextResponse.json({ error: 'Invalid upload response from Lighthouse' }, { status: 500 });
    }

    const cid = response.data.Hash;

    return NextResponse.json({
      cid,
      url: `ipfs://${cid}`,
      gatewayUrl: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
