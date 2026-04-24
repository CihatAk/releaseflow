export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/data:/gi, "")
    .trim();
}

export function sanitizeHtml(html: string): string {
  const allowedTags = ["b", "i", "em", "strong", "code", "pre", "br", "p", "ul", "ol", "li", "a"];
  let result = html;
  
  for (const tag of allowedTags) {
    const regex = new RegExp(`<${tag}[^>]*>`, "gi");
    result = result.replace(regex, (match) => match);
  }
  
  const dangerous = /<script[\s>]|<\/script>|<iframe[\s>]|<\/iframe>|<object[\s>]|<\/object>|<embed[\s>]/gi;
  result = result.replace(dangerous, "");
  
  return result;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .slice(0, 255);
}

export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/`/g, "\\`")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}