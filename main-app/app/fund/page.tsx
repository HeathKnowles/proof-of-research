'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type StudyWithMetadata = {
  id: number;
  researcher: string;
  dataURI: string;
  metadataJSON: string;
  timestamp: number;
  status: number;
  funder: string;
  validator: string;
  reportURI: string;
  aiReadinessScore: number;
  metadataObj?: {
    title: string;
    description: string;
  };
};

const dummyStudies: StudyWithMetadata[] = [
  {
    id: 1,
    researcher: '0x1234...abcd',
    dataURI: 'QmExamplePdfCid1',
    metadataJSON: 'QmExampleMetadataCid1',
    timestamp: Date.now(),
    status: 0, // Submitted (not funded)
    funder: '0x0000000000000000000000000000000000000000',
    validator: '0x0000000000000000000000000000000000000000',
    reportURI: '',
    aiReadinessScore: 85,
    metadataObj: {
      title: 'Decentralized AI Research',
      description: 'A study on decentralized AI applications.',
    },
  },
  {
    id: 2,
    researcher: '0x5678...efgh',
    dataURI: 'QmExamplePdfCid2',
    metadataJSON: 'QmExampleMetadataCid2',
    timestamp: Date.now(),
    status: 1, // Funded
    funder: '0xabcde...12345',
    validator: '0x0000000000000000000000000000000000000000',
    reportURI: '',
    aiReadinessScore: 92,
    metadataObj: {
      title: 'Blockchain for Science',
      description: 'Using blockchain to fund scientific research.',
    },
  },
];

export default function FundPage() {
  const [filterFunded, setFilterFunded] = useState(false);
  const [fundAmounts, setFundAmounts] = useState<{ [studyId: number]: string }>({});

  // Filter studies by funding status
  const displayedStudies = dummyStudies.filter((s) =>
    filterFunded ? s.status !== 0 : s.status === 0,
  );

  // Dummy fund handler for demo
  function fundStudy(studyId: number) {
    alert(`Pretend funding study ${studyId} with amount: ${fundAmounts[studyId] || '0'}`);
    setFundAmounts((prev) => ({ ...prev, [studyId]: '' }));
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Fund Research (Dummy Data)</h1>

      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-4 py-2 rounded ${
            !filterFunded ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setFilterFunded(false)}
        >
          Open for Funding
        </button>
        <button
          className={`px-4 py-2 rounded ${
            filterFunded ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setFilterFunded(true)}
        >
          Funded
        </button>
      </div>

      {displayedStudies.length === 0 ? (
        <p className="text-center">📭 No studies to show.</p>
      ) : (
        displayedStudies.map((study) => {
          const isFunded = study.status !== 0;

          return (
            <div
              key={study.id}
              className={`border rounded p-4 mb-4 ${
                isFunded ? 'bg-gray-200 text-gray-600' : 'bg-white'
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">
                {study.metadataObj?.title || 'Untitled Research'}
              </h2>

              <p className="mb-1">
                <strong>Researcher:</strong> {study.researcher}
              </p>

              <p className="mb-1">
                <strong>AI Readiness Score:</strong>{' '}
                {study.aiReadinessScore ?? 'N/A'}
              </p>

              <p className="mb-2">
                <strong>Description:</strong>{' '}
                {study.metadataObj?.description || 'N/A'}
              </p>

              <p className="mb-2 break-words">
                <strong>Metadata JSON CID:</strong> {study.metadataJSON}
              </p>

              <p className="mb-2 break-words">
                <strong>PDF CID:</strong> {study.dataURI}
              </p>

              {study.dataURI && (
                <p className="mb-2">
                  <a
                    href={`https://ipfs.io/ipfs/${study.dataURI}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View PDF
                  </a>
                </p>
              )}

              {!isFunded && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Amount in ETH"
                    className="border rounded px-2 py-1 w-32"
                    value={fundAmounts[study.id] || ''}
                    onChange={(e) =>
                      setFundAmounts((prev) => ({
                        ...prev,
                        [study.id]: e.target.value,
                      }))
                    }
                  />
                  <Button onClick={() => fundStudy(study.id)}>Fund this study</Button>
                </div>
              )}

              {isFunded && (
                <p className="italic text-sm text-red-600 mt-2 font-semibold">
                  Funded by {study.funder} - Under Review
                </p>
              )}
            </div>
          );
        })
      )}
    </main>
  );
}
