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
  backgroundColor: '#f7f9f9',
  fontFamily: "Inter, -apple-system, 'Segoe UI', Arial, sans-serif",
  padding: '32px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e9e9',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '520px',
  margin: '0 auto',
}

const h1 = { color: '#0f1a1a', fontSize: '20px', margin: '0 0 12px', fontWeight: 600 }
const text = { color: '#55605f', fontSize: '14px', lineHeight: '22px', margin: '0 0 14px' }
const codeBox = {
  backgroundColor: '#f0faf8',
  border: '1px dashed #14b8a6',
  borderRadius: '10px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '18px 0',
}
const codeText = {
  color: '#0f766e',
  fontSize: '26px',
  letterSpacing: '6px',
  fontWeight: 700,
  fontFamily: 'monospace',
  margin: 0,
}
const button = {
  backgroundColor: '#0f766e',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '11px 22px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}
const small = { color: '#8a9694', fontSize: '12px', lineHeight: '18px', margin: '18px 0 0' }

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
