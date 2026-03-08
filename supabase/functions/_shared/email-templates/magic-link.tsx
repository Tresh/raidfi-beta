/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for RaidFi</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://raidfi.lovable.app/logo.png" width="40" height="40" alt="RaidFi" style={logo} />
        <Heading style={h1}>Your verification code</Heading>
        <Text style={text}>
          Use the code below to sign in to RaidFi. It will expire shortly.
        </Text>
        {token && (
          <div style={codeContainer}>
            <Text style={codeText}>{token}</Text>
          </div>
        )}
        <Text style={footer}>
          If you didn't request this code, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const logo = { borderRadius: '50%', marginBottom: '24px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 16px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const codeContainer = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}
const codeText = {
  fontSize: '32px',
  fontWeight: 'bold' as const,
  letterSpacing: '6px',
  color: '#000000',
  margin: '0',
  fontFamily: "'Inter', monospace",
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
