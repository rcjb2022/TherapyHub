// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import MedicalHistoryForm from './MedicalHistoryForm'

interface PageProps {
  params: {
    id: string
  }
}

export default function MedicalHistoryPage({ params }: PageProps) {
  return <MedicalHistoryForm patientId={params.id} />
}
