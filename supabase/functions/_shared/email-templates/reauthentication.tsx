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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your RaidFi verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://raidfi.lovable.app/logo.png" width="40" height="40" alt="RaidFi" style={logo} />
        <Heading style={h1}>Verify your identity</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <div style={codeContainer}>
          <Text style={codeText}>{token}</Text>
        </div>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#071513', fontFamily: "'Inter', Arial, sans-serif" }
const container = { backgroundColor: '#0e2421', border: '1px solid #1a3c37', borderRadius: '16px', padding: '32px 28px', maxWidth: '520px', margin: '40px auto' }
const logo = { borderRadius: '50%', marginBottom: '20px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  margin: '0 0 16px',
}
const text = {
  fontSize: '14px',
  color: '#a7f3d0',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeContainer = {
  backgroundColor: '#081c19',
  border: '1px dashed #14b8a6',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '18px 0',
}
const codeText = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  letterSpacing: '4px',
  color: '#2dd4bf',
  fontFamily: 'monospace',
  margin: 0,
}
const footer = { fontSize: '12px', color: '#4a6b66', margin: '32px 0 0' }
