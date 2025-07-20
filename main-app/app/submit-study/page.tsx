'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import ResearchSubmissionJson from '@/abi/ResearchSubmission.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RESEARCH_CONTRACT_ADDRESS } from '@/constants/contracts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  orcid: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{4}-\d{4}-\d{4}(?:\d{3}[Xx])?$/.test(val),
      'Must be a valid ORCID iD'
    ),
  license: z.string().min(3, 'Enter a license'),
  language: z.string().min(2, 'Enter a language'),
  tags: z.string().min(1, 'Enter at least one tag'),
  githubLink: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

type FormFields = keyof z.infer<typeof formSchema>;

const fields: {
  name: FormFields;
  label: string;
  isTextArea?: boolean;
}[] = [
  { label: 'Title', name: 'title' },
  { label: 'Description', name: 'description', isTextArea: true },
  { label: 'ORCID (optional)', name: 'orcid' },
  { label: 'License', name: 'license' },
  { label: 'Language', name: 'language' },
  { label: 'Tags (comma separated)', name: 'tags' },
  { label: 'GitHub Repo (optional)', name: 'githubLink' },
];

export default function SubmitStudyPage() {
  const { address } = useAccount();
  const router = useRouter();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [codeText, setCodeText] = useState<string>('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync, isPending, isError, error } = useWriteContract();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Upload PDF to Lighthouse
  const uploadPdfToLighthouse = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload PDF');
    const { cid } = await res.json();
    return cid;
  };

  // Upload metadata JSON as a file to Lighthouse
  const uploadMetadataToLighthouse = async (metadata: object): Promise<string> => {
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload metadata JSON');
    const { cid } = await res.json();
    return cid;
  };

  // AI scoring API call
  const getAiScore = async (metadata: any, code: string): Promise<number> => {
    const res = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata, code }),
    });

    if (!res.ok) throw new Error('AI readiness score fetch failed');
    const { score } = await res.json();
    return score;
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!pdfFile || !address) {
      alert('Missing required info or wallet not connected');
      return;
    }

    setIsSubmitting(true);
    setStatus('');

    try {
      setStatus('📤 Uploading PDF to Lighthouse...');
      const pdfCid = await uploadPdfToLighthouse(pdfFile);

      // Prepare metadata object
      const metadata = {
        title: data.title.trim(),
        description: data.description.trim(),
        orcid: data.orcid?.trim() || '',
        license: data.license.trim(),
        language: data.language.trim(),
        tags: data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        githubLink: data.githubLink?.trim() || '',
        author: address,
        date: new Date().toISOString(),
        pdfCid, // include PDF CID here for reference
      };

      setStatus('📤 Uploading metadata JSON to Lighthouse...');
      const metadataCid = await uploadMetadataToLighthouse(metadata);

      setStatus('🤖 Scoring AI readiness...');
      const aiScore = await getAiScore(metadata, codeText);

      setStatus('🔗 Waiting for wallet signature and chain confirmation...');
      await writeContractAsync({
        address: RESEARCH_CONTRACT_ADDRESS as `0x${string}`,
        abi: ResearchSubmissionJson.abi,
        functionName: 'submitStudy',
        args: [pdfCid, metadataCid, aiScore],
      });

      setStatus('✅ Submission complete! Redirecting...');
      setTimeout(() => router.push('/fund'), 1500);
    } catch (err: any) {
      setStatus('❌ Error: ' + (err?.message || error?.message || 'unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0d1117] dark:to-[#161b22]">
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-3xl"
      >
        <motion.div
          className="space-y-6 p-8 border border-zinc-200 dark:border-zinc-700 rounded-3xl shadow-2xl bg-white dark:bg-zinc-900"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-center text-zinc-800 dark:text-white">
              Submit Your Research 🧪
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>PDF File</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Optional Code Snippet (for validation)</Label>
              <Textarea
                rows={6}
                placeholder="Paste optional code here..."
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {fields.map((field) => (
              <div key={field.name}>
                <Label>{field.label}</Label>
                {field.isTextArea ? (
                  <Textarea
                    rows={4}
                    {...register(field.name)}
                    disabled={isSubmitting}
                  />
                ) : (
                  <Input {...register(field.name)} disabled={isSubmitting} />
                )}
                {errors[field.name] && (
                  <p className="text-red-500 text-sm">
                    {errors[field.name]?.message as string}
                  </p>
                )}
              </div>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={isSubmitting || isPending}
                className="w-full text-lg py-6 font-semibold"
              >
                {isSubmitting || isPending ? 'Submitting...' : '📤 Submit Study'}
              </Button>
            </motion.div>
            {status && (
              <p className="mt-2 text-center text-sm text-zinc-700 dark:text-zinc-300">
                {status}
              </p>
            )}
            {isError && (
              <p className="text-red-500 text-sm">
                Contract write error: {error?.message}
              </p>
            )}
          </CardContent>
        </motion.div>
      </motion.form>
    </div>
  );
}
