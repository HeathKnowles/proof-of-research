'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { create } from '@storacha/client';
import { useRouter } from 'next/navigation';
import ResearchSubmissionJson from '@/abi/ResearchSubmission.json';

export default function SubmitStudyPage() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [githubLink, setGithubLink] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [license, setLicense] = useState('');
  const [tags, setTags] = useState('');
  const [orcid, setOrcid] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile || !walletClient || !address) {
      alert('Missing required info or wallet not connected');
      return;
    }

    try {
      setStatus('Uploading to Storacha...');
      const client = await create();

      const pdfCid = await client.uploadFile(pdfFile);
      const pdfUri = `ipfs://${pdfCid}`;

      const studyId = crypto.randomUUID();
      const metadata = {
        title,
        authors: [{ name: address, orcid }],
        description,
        studyId,
        language,
        license,
        tags: tags.split(',').map((t) => t.trim()),
        date: new Date().toISOString(),
        code: githubLink,
        data: pdfUri,
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataCid = await client.uploadFile(new File([metadataBlob], 'metadata.json'));
      const metadataUri = `ipfs://${metadataCid}`;

      setStatus('Submitting to contract...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_RESEARCH_SUBMISSION_ADDRESS!,
        ResearchSubmissionJson.abi,
        signer
      );

      const tx = await contract.submitStudy(pdfUri, metadataUri);
      await tx.wait();

      setStatus('✅ Study submitted!');
      router.push('/fund');
    } catch (err: any) {
      console.error(err);
      setStatus('❌ Submission failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Submit Your Research</h2>
      <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} required />
      <input type="text" placeholder="GitHub Repo URL" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} required />
      <input type="text" placeholder="Study Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Description (min 500 words)" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input type="text" placeholder="Language (e.g., Python)" value={language} onChange={(e) => setLanguage(e.target.value)} />
      <input type="text" placeholder="License (e.g., CC-BY-4.0)" value={license} onChange={(e) => setLicense(e.target.value)} />
      <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
      <input type="text" placeholder="ORCID ID" value={orcid} onChange={(e) => setOrcid(e.target.value)} />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Study
      </button>

      {status && <p className="text-sm mt-2">{status}</p>}
    </form>
  );
}
