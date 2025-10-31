// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import HipaaAuthorizationForm from './HipaaAuthorizationForm'

interface PageProps {
  params: {
    id: string
  }
}

export default function HipaaAuthorizationPage({ params }: PageProps) {
  return <HipaaAuthorizationForm patientId={params.id} />
}
