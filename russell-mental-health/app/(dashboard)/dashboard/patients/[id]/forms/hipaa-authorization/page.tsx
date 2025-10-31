// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import HipaaAuthorizationForm from './HipaaAuthorizationForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function HipaaAuthorizationPage({ params }: PageProps) {
  const { id } = await params
  return <HipaaAuthorizationForm patientId={id} />
}
