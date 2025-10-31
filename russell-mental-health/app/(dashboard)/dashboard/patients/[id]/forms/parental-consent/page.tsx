// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import ParentalConsentForm from './ParentalConsentForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ParentalConsentPage({ params }: PageProps) {
  const { id } = await params
  return <ParentalConsentForm patientId={id} />
}
