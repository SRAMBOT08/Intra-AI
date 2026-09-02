'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceInterviewRoom } from '@/components/VoiceInterviewRoom';

export default function CandidateLiveInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <VoiceInterviewRoom
      interviewId={id}
      candidateName="Alex Johnson"
      jobTitle="Senior Distributed Systems Engineer"
      initialAgentId="technical"
      onInterviewComplete={() => {
        setTimeout(() => {
          router.push(`/recruiter/interviews/${id}/report`);
        }, 4000);
      }}
    />
  );
}
