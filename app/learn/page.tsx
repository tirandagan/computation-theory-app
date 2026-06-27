import { LearnWorkspace } from '@/components/learn-workspace'
import { ProgressProvider } from '@/lib/progress'

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { topic } = await searchParams
  return (
    <ProgressProvider>
      <LearnWorkspace initialTopic={topic} />
    </ProgressProvider>
  )
}
