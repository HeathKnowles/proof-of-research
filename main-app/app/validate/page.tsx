'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Metadata = {
  title?: string;
  description?: string;
  license?: string;
  tags?: string[];
  [key: string]: any;
};

type Bounty = {
  bountyId: number;
  studyId: number;
  funder: string;
  deadline: number; // unix timestamp
  amount: string; // formatted human-readable
  validator: string;
  status: number;
  metadata: Metadata;
};

// Dummy data for testing UI
const dummyBounties: Bounty[] = [
  {
    bountyId: 1,
    studyId: 101,
    funder: '0xFunderAddress1',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days from now
    amount: '0.5',
    validator: '0xValidatorAddress1',
    status: 0,
    metadata: {
      title: 'Decentralized AI Research',
      description: 'A study on decentralized AI applications.',
      license: 'MIT',
      tags: ['AI', 'Blockchain'],
    },
  },
  {
    bountyId: 2,
    studyId: 102,
    funder: '0xFunderAddress2',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
    amount: '1.2',
    validator: '0xValidatorAddress2',
    status: 0,
    metadata: {
      title: 'Blockchain for Science',
      description: 'Using blockchain to fund scientific research.',
      license: 'Apache-2.0',
      tags: ['Science', 'DeFi'],
    },
  },
];

export default function ValidatePage() {
  const [bounties, setBounties] = useState<Bounty[]>(dummyBounties);
  const [selected, setSelected] = useState<Bounty | null>(null);
  const [reportUri, setReportUri] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dummy submit handler
  async function handleSubmitValidation() {
    if (!selected) {
      alert('Please select a bounty.');
      return;
    }
    if (!reportUri || reportUri.length < 8) {
      alert('Please enter a valid report URI.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert(`Validation submitted for bounty #${selected.bountyId} with report URI: ${reportUri}`);
      setBounties((prev) => prev.filter((b) => b.bountyId !== selected.bountyId));
      setDialogOpen(false);
      setSelected(null);
      setReportUri('');
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Validate Studies with Open Bounties (Dummy Data)</h1>
      {loading && <p className="text-gray-500 mb-4">Submitting validation...</p>}
      {!loading && bounties.length === 0 && (
        <p className="mb-4 text-gray-600">No open bounties available at the moment.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bounties.map((bounty) => (
          <Card key={bounty.bountyId}>
            <CardHeader>
              <CardTitle>{bounty.metadata.title || `Study #${bounty.studyId}`}</CardTitle>
              <p className="text-sm text-gray-500">Reward: {bounty.amount} ETH</p>
              <p className="text-xs text-gray-400">
                Deadline: {new Date(bounty.deadline * 1000).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {bounty.metadata.description && (
                <p className="text-xs italic">{bounty.metadata.description}</p>
              )}
              <Dialog
                open={dialogOpen && selected?.bountyId === bounty.bountyId}
                onOpenChange={setDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelected(bounty);
                      setReportUri('');
                      setDialogOpen(true);
                    }}
                  >
                    Validate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Validation for Study #{bounty.studyId}</DialogTitle>
                  </DialogHeader>
                  <Input
                    placeholder="Enter IPFS report URI"
                    value={reportUri}
                    onChange={(e) => setReportUri(e.target.value)}
                    disabled={loading}
                  />
                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitValidation}
                      disabled={loading || !reportUri}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}