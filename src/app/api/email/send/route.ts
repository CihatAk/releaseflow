import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, to, subject, html, text, config } = body;

    if (!provider || !to || !subject) {
      return NextResponse.json(
        { error: "provider, to, and subject are required" },
        { status: 400 }
      );
    }

    let response;
    
    switch (provider) {
      case "sendgrid":
        response = await sendViaSendGrid(to, subject, html, text, config);
        break;
      case "mailgun":
        response = await sendViaMailgun(to, subject, html, text, config);
        break;
      case "resend":
        response = await sendViaResend(to, subject, html, text, config);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, provider, response });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

async function sendViaSendGrid(to: string, subject: string, html: string, text: string, config: any) {
  const apiKey = config?.apiKey || process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    throw new Error("SendGrid API key is required");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: config?.from || "noreply@releaseflow.dev" },
      subject,
      content: [
        { type: "text/html", value: html },
        { type: "text/plain", value: text },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  return { messageId: response.headers.get("X-Message-Id") };
}

async function sendViaMailgun(to: string, subject: string, html: string, text: string, config: any) {
  const apiKey = config?.apiKey || process.env.MAILGUN_API_KEY;
  const domain = config?.domain || process.env.MAILGUN_DOMAIN;
  
  if (!apiKey || !domain) {
    throw new Error("Mailgun API key and domain are required");
  }

  const formData = new FormData();
  formData.append("from", config?.from || `noreply@${domain}`);
  formData.append("to", to);
  formData.append("subject", subject);
  formData.append("html", html);
  formData.append("text", text);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mailgun error: ${error}`);
  }

  const data = await response.json();
  return { messageId: data.id };
}

async function sendViaResend(to: string, subject: string, html: string, text: string, config: any) {
  const apiKey = config?.apiKey || process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error("Resend API key is required");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config?.from || "noreply@releaseflow.dev",
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  const data = await response.json();
  return { messageId: data.id };
}

export async function GET() {
  return NextResponse.json({
    providers: [
      {
        id: "sendgrid",
        name: "SendGrid",
        envVars: ["SENDGRID_API_KEY"],
        documentation: "https://docs.sendgrid.com/api-reference/mail-send/mail-send",
      },
      {
        id: "mailgun",
        name: "Mailgun",
        envVars: ["MAILGUN_API_KEY", "MAILGUN_DOMAIN"],
        documentation: "https://documentation.mailgun.com/en/latest/api.html",
      },
      {
        id: "resend",
        name: "Resend",
        envVars: ["RESEND_API_KEY"],
        documentation: "https://resend.com/docs/api-reference/emails/send-email",
      },
    ],
  });
}
