// Server Component (default in App Router)
// Renders the client component, passing patientId from params

import PaymentInformationForm from './PaymentInformationForm'

interface PageProps {
  params: {
    id: string
  }
}

export default function PaymentInformationPage({ params }: PageProps) {
  return <PaymentInformationForm patientId={params.id} />
}
