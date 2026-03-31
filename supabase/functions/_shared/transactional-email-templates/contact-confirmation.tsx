import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Handball 7even"

interface ContactConfirmationProps {
  name?: string
}

const ContactConfirmationEmail = ({ name }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thanks for reaching out to {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <Heading style={logoText}>HANDBALL 7EVEN</Heading>
        </div>
        <div style={content}>
          <Heading style={h1}>
            {name ? `Thank you, ${name}!` : 'Thank you for reaching out!'}
          </Heading>
          <Text style={text}>
            We have received your message and will get back to you as soon as possible.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Best regards,<br />The {SITE_NAME} Team
          </Text>
        </div>
        <div style={footerBar}>
          <Text style={footerText}>© {new Date().getFullYear()} {SITE_NAME} · handball7seven.com</Text>
        </div>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'Thanks for contacting us — Handball 7even',
  displayName: 'Contact confirmation',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#000000', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#d4a24e', fontSize: '24px', margin: '0', letterSpacing: '4px', textTransform: 'uppercase' as const }
const content = { padding: '32px 24px' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 20px' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#888888', margin: '0' }
const footerBar = { backgroundColor: '#000000', padding: '16px', textAlign: 'center' as const }
const footerText = { color: '#888888', fontSize: '11px', margin: '0' }
