// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import MentalHealthHistoryForm from './MentalHealthHistoryForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MentalHealthHistoryPage({ params }: PageProps) {
  const { id } = await params
  return <MentalHealthHistoryForm patientId={id} />
}
