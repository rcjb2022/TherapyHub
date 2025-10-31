// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import MentalHealthHistoryForm from './MentalHealthHistoryForm'

interface PageProps {
  params: {
    id: string
  }
}

export default function MentalHealthHistoryPage({ params }: PageProps) {
  return <MentalHealthHistoryForm patientId={params.id} />
}
