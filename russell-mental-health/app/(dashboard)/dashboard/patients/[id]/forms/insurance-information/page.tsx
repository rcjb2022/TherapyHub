// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import InsuranceInformationForm from './InsuranceInformationForm'

interface PageProps {
  params: {
    id: string
  }
}

export default function InsuranceInformationPage({ params }: PageProps) {
  return <InsuranceInformationForm patientId={params.id} />
}
