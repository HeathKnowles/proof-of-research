'use client'

import { Abi } from 'viem'
import ResearchSubmissionABIJson from '@/abi/ResearchSubmission.json'
import { RESEARCH_CONTRACT_ADDRESS } from '@/constants/contracts'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { FileTextIcon } from 'lucide-react'

const statusMap = ['Submitted', 'Funded', 'Under Review', 'Validated']

export default function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const studyId = Number(id)
  const [parsedMetadata, setParsedMetadata] = useState<any>(null)
  const ResearchSubmissionABI = ResearchSubmissionABIJson.abi as Abi

  const { data, isLoading } = useReadContract({
    abi: ResearchSubmissionABI,
    address: RESEARCH_CONTRACT_ADDRESS,
    functionName: 'getStudy',
    args: [studyId],
  })

  const [
    _id,
    researcher,
    dataURI,
    metadataJSON,
    _timestamp,
    status,
    funder,
    validator,
    reportURI,
    aiReadinessScore
  ] = (data as any[]) || []

  useEffect(() => {
    if (metadataJSON && typeof metadataJSON === 'string') {
      try {
        const parsed = JSON.parse(metadataJSON)
        setParsedMetadata(parsed)
      } catch (err) {
        console.error('Failed to parse metadata:', err)
      }
    }
  }, [metadataJSON])

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="w-full h-32 mb-4" />
        <Skeleton className="w-full h-8 mb-2" />
        <Skeleton className="w-full h-8" />
      </div>
    )
  }

  if (!data || !parsedMetadata) {
    return <p className="text-center mt-20 text-muted">Research not found or invalid metadata.</p>
  }

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{parsedMetadata.title}</h1>
            <Badge variant="outline">{statusMap[status]}</Badge>
          </div>

          <p className="text-gray-600">{parsedMetadata.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Language:</span>{' '}
              {parsedMetadata.language}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">License:</span>{' '}
              {parsedMetadata.license}
            </div>
            {parsedMetadata.tags && (
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">Tags:</span>{' '}
                {parsedMetadata.tags}
              </div>
            )}
            {parsedMetadata.orcid && (
              <div>
                <span className="font-medium text-muted-foreground">ORCID:</span>{' '}
                {parsedMetadata.orcid}
              </div>
            )}
            {parsedMetadata.githubLink && (
              <div>
                <span className="font-medium text-muted-foreground">GitHub:</span>{' '}
                <a
                  href={parsedMetadata.githubLink}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  Repo Link
                </a>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">AI Readiness Score:</span>{' '}
              {aiReadinessScore}/100
            </div>
          </div>

          <div className="pt-4">
            <a
              href={`https://ipfs.io/ipfs/${dataURI}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              rel="noopener noreferrer"
            >
              <FileTextIcon className="mr-2 w-4 h-4" />
              View PDF
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
