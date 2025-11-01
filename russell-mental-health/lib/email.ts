// Email notification utilities
// TODO: Configure SendGrid API key in .env.local: SENDGRID_API_KEY=xxx

/**
 * Send email notification for failed charge
 * Currently logs to console - configure SendGrid to enable actual emails
 */
export async function sendFailedChargeNotification(params: {
  patientEmail: string
  patientName: string
  therapistEmail: string
  therapistName: string
  amount: number
  errorMessage: string
  patientId: string
}) {
  const { patientEmail, patientName, therapistEmail, therapistName, amount, errorMessage, patientId } = params

  // TODO: Replace console.log with actual SendGrid email sending
  // For now, log to console so failed charges are tracked in server logs

  console.log('=== FAILED CHARGE NOTIFICATION ===')
  console.log('Patient:', patientName, patientEmail)
  console.log('Therapist:', therapistName, therapistEmail)
  console.log('Amount:', `$${amount.toFixed(2)}`)
  console.log('Error:', errorMessage)
  console.log('Patient ID:', patientId)
  console.log('===================================')

  // When SendGrid is configured, replace above with:
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  // Email to therapist
  await sgMail.send({
    to: therapistEmail,
    from: 'noreply@russellmentalhealth.com', // Configure verified sender
    subject: `Failed Charge: ${patientName} - $${amount.toFixed(2)}`,
    text: `
      A charge attempt has failed for patient ${patientName}.

      Amount: $${amount.toFixed(2)}
      Error: ${errorMessage}

      Action needed:
      1. Contact patient to update payment method
      2. Retry charge once payment method is updated

      View patient details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patients/${patientId}
    `,
    html: `
      <h2>Failed Charge Notification</h2>
      <p>A charge attempt has failed for patient <strong>${patientName}</strong>.</p>
      <ul>
        <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
        <li><strong>Error:</strong> ${errorMessage}</li>
      </ul>
      <h3>Action Needed:</h3>
      <ol>
        <li>Contact patient to update payment method</li>
        <li>Retry charge once payment method is updated</li>
      </ol>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patients/${patientId}">View Patient Details</a></p>
    `,
  })

  // Email to patient
  await sgMail.send({
    to: patientEmail,
    from: 'noreply@russellmentalhealth.com',
    subject: 'Payment Method Update Required',
    text: `
      Hello ${patientName},

      We attempted to charge your card on file for $${amount.toFixed(2)}, but the payment failed.

      Error: ${errorMessage}

      Please update your payment method as soon as possible to avoid service interruptions.

      You can update your payment method here: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/forms/payment-information

      If you have questions, please contact ${therapistName} at ${therapistEmail}.

      Thank you,
      Russell Mental Health
    `,
    html: `
      <p>Hello ${patientName},</p>
      <p>We attempted to charge your card on file for <strong>$${amount.toFixed(2)}</strong>, but the payment failed.</p>
      <p><strong>Error:</strong> ${errorMessage}</p>
      <p>Please update your payment method as soon as possible to avoid service interruptions.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/forms/payment-information">Update Payment Method</a></p>
      <p>If you have questions, please contact ${therapistName} at <a href="mailto:${therapistEmail}">${therapistEmail}</a>.</p>
      <p>Thank you,<br>Russell Mental Health</p>
    `,
  })
  */

  return {
    success: true,
    message: 'Failed charge logged to console. Configure SendGrid to enable email notifications.',
  }
}

/**
 * Setup instructions for SendGrid:
 *
 * 1. Sign up for SendGrid account: https://sendgrid.com/
 * 2. Create API key with "Mail Send" permission
 * 3. Add to .env.local:
 *    SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
 *    NEXT_PUBLIC_APP_URL=http://localhost:3000 (or production URL)
 * 4. Verify sender email in SendGrid dashboard
 * 5. Install SendGrid package: npm install @sendgrid/mail
 * 6. Uncomment the SendGrid code in this file
 * 7. Update sender email to your verified address
 */
