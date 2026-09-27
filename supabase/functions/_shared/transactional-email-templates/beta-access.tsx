/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BetaAccessProps {
  code?: string
  expiresAt?: string
  name?: string
  appUrl?: string
}

const main = {
  backgroundColor: '#071513',
  fontFamily: "Inter, -apple-system, 'Segoe UI', Arial, sans-serif",
  padding: '40px 0',
}

const container = {
  backgroundColor: '#0e2421',
  border: '1px solid #1a3c37',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '520px',
  margin: '0 auto',
}

const logoText = { color: '#2dd4bf', fontSize: '22px', fontWeight: 700, margin: '0 0 24px', letterSpacing: '-0.5px' }
const h1 = { color: '#ffffff', fontSize: '20px', margin: '0 0 12px', fontWeight: 700 }
const text = { color: '#a7f3d0', fontSize: '14px', lineHeight: '22px', margin: '0 0 14px' }
const codeBox = {
  backgroundColor: '#081c19',
  border: '1px dashed #14b8a6',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '18px 0',
}
const codeText = {
  color: '#2dd4bf',
  fontSize: '26px',
  letterSpacing: '6px',
  fontWeight: 700,
  fontFamily: 'monospace',
  margin: 0,
}
const button = {
  backgroundColor: '#0d9488',
  color: '#ffffff',
  borderRadius: '10px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}
const small = { color: '#4a6b66', fontSize: '12px', lineHeight: '18px', margin: '24px 0 0', textAlign: 'center' as const }

export const BetaAccessEmail = ({
  code = 'RAIDXXXX',
  expiresAt = '',
  name = '',
  appUrl = 'https://beta.raidfi.site',
}: BetaAccessProps) => (
  <Html>
    <Head />
    <Preview>Your RaidFi beta access code is here</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={logoText}>RaidFi</Text>
        <Heading style={h1}>You're in the RaidFi beta</Heading>
        <Text style={text}>
          {name ? `Hey ${name}, ` : 'Hey, '}your beta access request was approved. Use the code below
          when you sign in to unlock the contributor dashboard.
        </Text>
        <Section style={codeBox}>
          <Text style={codeText}>{code}</Text>
        </Section>
        {expiresAt ? (
          <Text style={text}>
            This code expires on <strong>{expiresAt}</strong>. If it lapses, you can request access again.
          </Text>
        ) : null}
        <Section style={{ margin: '20px 0 0' }}>
          <Link href={`${appUrl}/signup?code=${encodeURIComponent(code)}`} style={button}>
            Redeem your code
          </Link>
        </Section>
        <Text style={small}>
          If you didn't request beta access to RaidFi, you can ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BetaAccessEmail,
  displayName: 'Beta access approved',
  subject: 'Your RaidFi beta access code',
  previewData: {
    code: 'RAID7K2Q',
    expiresAt: 'August 30, 2026',
    name: 'Alex',
    appUrl: 'https://beta.raidfi.site',
  },
} satisfies TemplateEntry
