export const wrapTemplate = (content: string) => `
<div style="font-family: 'Playfair Display', serif; background-color: #000; color: #fff; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #D4AF37;">
  <h1 style="color: #D4AF37; font-weight: bold; font-size: 24px;">THE VAGINA ROOM</h1>
  <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; margin-top: 20px;">
    ${content}
  </div>
  <div style="margin-top: 40px; border-top: 1px solid #D4AF37; padding-top: 20px; font-size: 12px; color: #D4AF37;">
    Inner Circle Notification
  </div>
</div>
`;

export const getWelcomeTemplate = (firstName: string, memberId: string, affiliateLink: string) => `
<p>Greetings ${firstName},</p>
<p>Welcome to the Inner Circle. Your journey has begun.</p>
<p>Your Member ID: <strong>${memberId}</strong></p>
<p>Your Affiliate Link: <a href="${affiliateLink}" style="color: #D4AF37;">${affiliateLink}</a></p>
<p>Please complete your profile setup to fully activate your status.</p>
`;
