import { Mail, FileText, Eye, Send, Palette, Type, ListOrdered, LayoutTemplate } from 'lucide-react';

/**
 * Step configurations for the two email flows.
 *
 * Each step carries an `accent` (oklch color) and a lucide `icon`. The
 * GraphWorkflow + WorkflowNode use these to render the lego-brick track.
 *
 * Colors are intentionally varied along the spectrum so the bricks read as
 * distinct pieces — but each stays inside the same lightness/chroma range
 * to keep the palette cohesive on the dark background.
 */

export const yoloSteps = [
  {
    id: 'recipient',
    label: 'Recipient',
    icon: Mail,
    accent: 'oklch(0.78 0.13 200)', // cyan
  },
  {
    id: 'details',
    label: 'Details',
    icon: FileText,
    accent: 'oklch(0.72 0.17 290)', // violet
  },
  {
    id: 'template',
    label: 'Template',
    icon: LayoutTemplate,
    accent: 'oklch(0.75 0.15 180)', // teal
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: Eye,
    accent: 'oklch(0.74 0.16 145)', // green
  },
  {
    id: 'send',
    label: 'Send',
    icon: Send,
    accent: 'oklch(0.70 0.18 250)', // blue (existing accent)
  },
];

export const detailedSteps = [
  {
    id: 'basics',
    label: 'Basics',
    icon: Mail,
    accent: 'oklch(0.78 0.13 200)', // cyan
  },
  {
    id: 'tone',
    label: 'Tone & Style',
    icon: Palette,
    accent: 'oklch(0.76 0.17 340)', // pink
  },
  {
    id: 'content',
    label: 'Content',
    icon: ListOrdered,
    accent: 'oklch(0.82 0.14 80)', // amber
  },
  {
    id: 'template',
    label: 'Template',
    icon: LayoutTemplate,
    accent: 'oklch(0.75 0.15 180)', // teal
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: Eye,
    accent: 'oklch(0.74 0.16 145)', // green
  },
  {
    id: 'send',
    label: 'Send',
    icon: Send,
    accent: 'oklch(0.70 0.18 250)', // blue
  },
];
