// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import PaymentInformationForm from './PaymentInformationForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PaymentInformationPage({ params }: PageProps) {
  const { id } = await params
  return <PaymentInformationForm patientId={id} />
}
