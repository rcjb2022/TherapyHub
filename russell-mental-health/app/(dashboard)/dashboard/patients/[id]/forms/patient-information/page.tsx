// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import PatientInformationForm from './PatientInformationForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PatientInformationPage({ params }: PageProps) {
  const { id } = await params

  return <PatientInformationForm patientId={id} />
}
