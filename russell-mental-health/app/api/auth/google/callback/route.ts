/**
 * Google OAuth Callback Handler
 *
 * Handles the OAuth redirect from Google after user authorizes
 * Exchanges authorization code for access token + refresh token
 * Displays refresh token for admin to copy into .env.local
 */

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle user denial
    if (error) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Failed</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 600px;
                margin: 100px auto;
                padding: 20px;
                background: #fef2f2;
              }
              .error-box {
                background: white;
                border: 2px solid #ef4444;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
              }
              h1 { color: #dc2626; margin-bottom: 10px; }
              p { color: #666; margin-bottom: 20px; }
              a {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 6px;
              }
            </style>
          </head>
          <body>
            <div class="error-box">
              <h1>❌ Authorization Denied</h1>
              <p>You denied access to Google Calendar. TherapyHub needs calendar access to create appointments.</p>
              <a href="/admin/google-auth">Try Again</a>
            </div>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Check for authorization code
    if (!code) {
      throw new Error('No authorization code received from Google')
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.refresh_token) {
      throw new Error('No refresh token received. Try revoking access and authorizing again.')
    }

    // Display refresh token for admin to copy
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 700px;
              margin: 50px auto;
              padding: 20px;
              background: #f0fdf4;
            }
            .success-box {
              background: white;
              border: 2px solid #10b981;
              border-radius: 8px;
              padding: 30px;
            }
            h1 {
              color: #059669;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .instruction {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }
            .token-box {
              background: #1e293b;
              color: #10b981;
              padding: 15px;
              border-radius: 6px;
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 13px;
              word-break: break-all;
              margin: 15px 0;
              position: relative;
            }
            .copy-btn {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              margin-top: 10px;
            }
            .copy-btn:hover { background: #2563eb; }
            .copy-btn:active { background: #1d4ed8; }
            .steps {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .steps ol {
              margin-left: 20px;
            }
            .steps li {
              margin: 10px 0;
              line-height: 1.6;
            }
            code {
              background: #1e293b;
              color: #10b981;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 13px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="success-box">
            <h1>
              <span style="font-size: 32px;">✅</span>
              Authorization Successful!
            </h1>
            <p style="color: #666; margin-bottom: 20px;">
              TherapyHub is now connected to Google Calendar
            </p>

            <div class="instruction">
              <strong>⚠️ IMPORTANT:</strong> Copy the refresh token below and add it to your <code>.env.local</code> file
            </div>

            <div class="token-box" id="token">${tokens.refresh_token}</div>
            <button class="copy-btn" onclick="copyToken()">📋 Copy Refresh Token</button>

            <div class="steps">
              <h3 style="margin-top: 0;">Next Steps:</h3>
              <ol>
                <li>Click "Copy Refresh Token" above</li>
                <li>Open <code>/russell-mental-health/.env.local</code></li>
                <li>Find the line: <code>GOOGLE_REFRESH_TOKEN=""</code></li>
                <li>Paste the token between the quotes: <code>GOOGLE_REFRESH_TOKEN="1//0g..."</code></li>
                <li>Save the file</li>
                <li>Restart your Next.js dev server (<code>npm run dev</code>)</li>
              </ol>
            </div>

            <div class="footer">
              <p>✅ You only need to do this once. The refresh token works indefinitely.</p>
              <p style="margin-top: 10px;">
                <a href="/dashboard/calendar" style="color: #3b82f6; text-decoration: none;">
                  → Go to Calendar
                </a>
              </p>
            </div>
          </div>

          <script>
            function copyToken() {
              const token = document.getElementById('token').textContent;
              navigator.clipboard.writeText(token).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = '✅ Copied!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                  btn.textContent = '📋 Copy Refresh Token';
                  btn.style.background = '#3b82f6';
                }, 2000);
              });
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 20px;
              background: #fef2f2;
            }
            .error-box {
              background: white;
              border: 2px solid #ef4444;
              border-radius: 8px;
              padding: 30px;
            }
            h1 { color: #dc2626; margin-bottom: 10px; }
            .error-details {
              background: #1e293b;
              color: #ef4444;
              padding: 15px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 13px;
              margin: 15px 0;
            }
            a {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="error-box">
            <h1>❌ Authorization Error</h1>
            <p>Something went wrong during the authorization process.</p>
            <div class="error-details">${error instanceof Error ? error.message : 'Unknown error'}</div>
            <a href="/admin/google-auth">Try Again</a>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}
