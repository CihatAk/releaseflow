// Simple validation utilities without external dependencies

export function validateRepo(input: { owner?: string; repo?: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.owner || input.owner.trim().length === 0) {
    errors.push('Owner is required');
  }
  
  if (!input.repo || input.repo.trim().length === 0) {
    errors.push('Repository is required');
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateChangelog(input: { owner?: string; repo?: string; days?: number; format?: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.owner || input.owner.trim().length === 0) {
    errors.push('Owner is required');
  }
  
  if (!input.repo || input.repo.trim().length === 0) {
    errors.push('Repository is required');
  }
  
  if (input.days && (input.days < 1 || input.days > 365)) {
    errors.push('Days must be between 1 and 365');
  }
  
  const validFormats = ['default', 'markdown', 'json', 'html'];
  if (input.format && !validFormats.includes(input.format)) {
    errors.push('Invalid format');
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateScheduledReport(input: { repo?: string; frequency?: string; day?: number; time?: string; email?: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.repo || input.repo.trim().length === 0) {
    errors.push('Repository is required');
  }
  
  const validFrequencies = ['weekly', 'monthly'];
  if (input.frequency && !validFrequencies.includes(input.frequency)) {
    errors.push('Invalid frequency');
  }
  
  if (input.day && (input.day < 1 || input.day > 31)) {
    errors.push('Day must be between 1 and 31');
  }
  
  if (input.time && !/^\d{2}:\d{2}$/.test(input.time)) {
    errors.push('Time must be in HH:MM format');
  }
  
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('Invalid email address');
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateWebhook(input: { name?: string; url?: string; type?: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!input.url || input.url.trim().length === 0) {
    errors.push('URL is required');
  } else if (!input.url.startsWith('http://') && !input.url.startsWith('https://')) {
    errors.push('Invalid URL format');
  }
  
  const validTypes = ['slack', 'discord', 'notion', 'webhook'];
  if (input.type && !validTypes.includes(input.type)) {
    errors.push('Invalid webhook type');
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateEmail(input: { provider?: string; to?: string; subject?: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const validProviders = ['sendgrid', 'mailgun', 'resend'];
  if (input.provider && !validProviders.includes(input.provider)) {
    errors.push('Invalid email provider');
  }
  
  if (!input.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) {
    errors.push('Invalid recipient email');
  }
  
  if (!input.subject || input.subject.trim().length === 0) {
    errors.push('Subject is required');
  }
  
  return { valid: errors.length === 0, errors };
}

// Sanitization utilities
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
}

export function sanitizeRepoName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .substring(0, 100);
}
