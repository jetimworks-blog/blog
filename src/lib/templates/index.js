/**
 * Real HTML Email Templates
 * Each template has metadata, a screenshot preview, and an HTML file path.
 */

const SCREENSHOT_BASE = '/templates/screenshots';
const HTML_BASE = '/templates/html';

export const templates = [
  {
    id: '01-simple-text',
    name: 'Simple Text',
    description: 'Clean and simple text email',
    htmlFile: '01-simple-text.html',
    screenshot: `${SCREENSHOT_BASE}/01-simple-text.png`,
  },
  {
    id: '02-personal-thankyou',
    name: 'Personal Thank You',
    description: 'Warm thank you message',
    htmlFile: '02-personal-thankyou.html',
    screenshot: `${SCREENSHOT_BASE}/02-personal-thankyou.png`,
  },
  {
    id: '03-corporate-announcement',
    name: 'Corporate Announcement',
    description: 'Professional company announcement',
    htmlFile: '03-corporate-announcement.html',
    screenshot: `${SCREENSHOT_BASE}/03-corporate-announcement.png`,
  },
  {
    id: '04-promotional-sale',
    name: 'Promotional Sale',
    description: 'Sales and promotional email',
    htmlFile: '04-promotional-sale.html',
    screenshot: `${SCREENSHOT_BASE}/04-promotional-sale.png`,
  },
  {
    id: '05-invoice',
    name: 'Invoice',
    description: 'Billing and invoice email',
    htmlFile: '05-invoice.html',
    screenshot: `${SCREENSHOT_BASE}/05-invoice.png`,
  },
  {
    id: '06-proposal',
    name: 'Business Proposal',
    description: 'Professional business proposal',
    htmlFile: '06-proposal.html',
    screenshot: `${SCREENSHOT_BASE}/06-proposal.png`,
  },
  {
    id: '07-partnership-invitation',
    name: 'Partnership Invitation',
    description: 'Partnership and collaboration invite',
    htmlFile: '07-partnership-invitation.html',
    screenshot: `${SCREENSHOT_BASE}/07-partnership-invitation.png`,
  },
  {
    id: '08-newsletter',
    name: 'Newsletter',
    description: 'Newsletter layout',
    htmlFile: '08-newsletter.html',
    screenshot: `${SCREENSHOT_BASE}/08-newsletter.png`,
  },
  {
    id: '09-event-invitation',
    name: 'Event Invitation',
    description: 'Event and invitation email',
    htmlFile: '09-event-invitation.html',
    screenshot: `${SCREENSHOT_BASE}/09-event-invitation.png`,
  },
  {
    id: '10-security-alert',
    name: 'Security Alert',
    description: 'Security notification email',
    htmlFile: '10-security-alert.html',
    screenshot: `${SCREENSHOT_BASE}/10-security-alert.png`,
  },
  {
    id: '11-verification',
    name: 'Email Verification',
    description: 'Account verification email',
    htmlFile: '11-verification.html',
    screenshot: `${SCREENSHOT_BASE}/11-verification.png`,
  },
  {
    id: '12-shipping-notification',
    name: 'Shipping Notification',
    description: 'Shipping update email',
    htmlFile: '12-shipping-notification.html',
    screenshot: `${SCREENSHOT_BASE}/12-shipping-notification.png`,
  },
  {
    id: '13-appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Appointment scheduling email',
    htmlFile: '13-appointment-reminder.html',
    screenshot: `${SCREENSHOT_BASE}/13-appointment-reminder.png`,
  },
  {
    id: '14-feedback-request',
    name: 'Feedback Request',
    description: 'Customer feedback email',
    htmlFile: '14-feedback-request.html',
    screenshot: `${SCREENSHOT_BASE}/14-feedback-request.png`,
  },
  {
    id: '15-abandoned-cart',
    name: 'Abandoned Cart',
    description: 'Cart abandonment recovery',
    htmlFile: '15-abandoned-cart.html',
    screenshot: `${SCREENSHOT_BASE}/15-abandoned-cart.png`,
  },
  {
    id: '16-welcome',
    name: 'Welcome Email',
    description: 'New user welcome email',
    htmlFile: '16-welcome.html',
    screenshot: `${SCREENSHOT_BASE}/16-welcome.png`,
  },
];

// Cache for loaded HTML content
const htmlCache = {};

/**
 * Get the full HTML content for a template by ID.
 * Loads from filesystem on first access, then caches.
 */
export const getTemplateHtml = async (templateId) => {
  if (htmlCache[templateId]) {
    return htmlCache[templateId];
  }

  const template = templates.find((t) => t.id === templateId);
  if (!template) return null;

  const htmlPath = `${HTML_BASE}/${template.htmlFile}`;

  try {
    const response = await fetch(htmlPath);
    if (!response.ok) throw new Error(`Failed to load: ${htmlPath}`);
    const html = await response.text();
    htmlCache[templateId] = html;
    return html;
  } catch (error) {
    console.error(`Error loading template HTML for ${templateId}:`, error);
    return null;
  }
};

/**
 * Get template by ID (synchronous, returns template metadata without html).
 * Use getTemplateHtml() to load HTML content separately.
 */
export const getTemplateById = (id) => templates.find((t) => t.id === id);
