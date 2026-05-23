import { historyAPI } from './api';

const STORAGE_KEY = 'previous_emails';
const MAX_EMAILS = 50;

export const getPreviousEmails = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const setPreviousEmails = (emails) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  } catch {
    // Storage full or unavailable
  }
};

export const fetchAndCachePreviousEmails = async () => {
  try {
    const response = await historyAPI.getAll(100, 0);
    const data = response.data?.data || [];

    // Collect all unique emails from to_list, cc, and bcc fields
    const emailSet = new Set();
    for (const item of data) {
      if (Array.isArray(item.to_list)) {
        for (const email of item.to_list) {
          if (email) emailSet.add(email.toLowerCase());
        }
      }
      if (Array.isArray(item.cc)) {
        for (const email of item.cc) {
          if (email) emailSet.add(email.toLowerCase());
        }
      }
      if (Array.isArray(item.bcc)) {
        for (const email of item.bcc) {
          if (email) emailSet.add(email.toLowerCase());
        }
      }
    }

    // Convert to array, preserving order (most recent first from API)
    const uniqueEmails = Array.from(emailSet).slice(0, MAX_EMAILS);
    setPreviousEmails(uniqueEmails);
    return uniqueEmails;
  } catch {
    // On error, return cached emails if available
    return getPreviousEmails();
  }
};

export const addEmailToPrevious = (email) => {
  const emails = getPreviousEmails();
  const lowerEmail = email.toLowerCase();
  const filtered = emails.filter(e => e.toLowerCase() !== lowerEmail);
  const updated = [email, ...filtered].slice(0, MAX_EMAILS);
  setPreviousEmails(updated);
};

export const addEmailsToPrevious = (newEmails) => {
  if (!newEmails || newEmails.length === 0) return;
  const emails = getPreviousEmails();
  const emailSet = new Set(emails.map(e => e.toLowerCase()));
  for (const email of newEmails) {
    emailSet.add(email.toLowerCase());
  }
  const updated = Array.from(emailSet).slice(0, MAX_EMAILS);
  // Put new emails at the front, maintaining most recent first
  const newEmailsLower = new Set(newEmails.map(e => e.toLowerCase()));
  const rest = updated.filter(e => !newEmailsLower.has(e.toLowerCase()));
  setPreviousEmails([...newEmails, ...rest].slice(0, MAX_EMAILS));
};