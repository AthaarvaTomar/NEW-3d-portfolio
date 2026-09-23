interface EmailTemplateProps {
  fullName: string;
  email: string;
  message: string;
}

export function renderEmailHtml({ fullName, email, message }: EmailTemplateProps): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #111; margin-top: 0;">New Portfolio Contact Message</h2>
      <p><strong>From:</strong> ${fullName} (&lt;${email}&gt;)</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <p style="font-size: 12px; color: #888; margin-bottom: 0;">Sent via portfolio contact form.</p>
    </div>
  `;
}

