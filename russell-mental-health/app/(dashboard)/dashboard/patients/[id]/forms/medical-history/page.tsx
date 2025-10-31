// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import MedicalHistoryForm from './MedicalHistoryForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MedicalHistoryPage({ params }: PageProps) {
  const { id } = await params
  return <MedicalHistoryForm patientId={id} />
}
