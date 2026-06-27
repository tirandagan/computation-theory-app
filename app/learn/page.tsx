import { LearnWorkspace } from '@/components/learn-workspace'

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { topic } = await searchParams
  return <LearnWorkspace initialTopic={topic} />
}
