/**
 * HTML Email Templates
 * Each template is a complete, professionally styled HTML email structure.
 * The AI will use these as base structures and fill in the user's content.
 */

export const emailTemplates = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple with subtle spacing',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:48px 40px;">
              <h1 style="margin:0 0 24px;font-size:28px;font-weight:bold;color:#1a1a1a;">{{header}}</h1>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#4a4a4a;">{{content}}</p>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0;">
              <p style="margin:0;font-size:14px;color:#888888;">{{footer}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'bold-header',
    name: 'Bold Header',
    description: 'Strong colored header with clean body',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#1e3a5f;padding:32px 40px;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#ffffff;">{{header}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#333333;">{{content}}</p>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0;">
              <p style="margin:0;font-size:14px;color:#888888;">{{footer}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Multi-section layout with image placeholders',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#0077b6;padding:24px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">{{header}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <div style="background:#f8f8f8;border-radius:6px;padding:24px;margin:0 0 24px;text-align:center;">
                <p style="margin:0;color:#666;font-size:14px;">[Image Placeholder]</p>
              </div>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#333333;">{{content}}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#888888;">{{footer}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated with accent borders and serif fonts',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family='Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e4df;border-radius:4px;">
          <tr>
            <td style="border-bottom:3px solid #c9a227;padding:40px 40px 32px;">
              <h1 style="margin:0;font-size:26px;font-weight:normal;color:#2c2c2c;font-family:'Georgia',serif;">{{header}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;font-size:17px;line-height:1.8;color:#3c3c3c;">{{content}}</p>
              <hr style="border:none;border-top:1px solid #e8e4df;margin:32px 0;">
              <p style="margin:0;font-size:13px;color:#999999;font-family:Arial,sans-serif;">{{footer}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional with sidebar accent',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;">
          <tr>
            <td width="8" style="background:#2c5282;"></td>
            <td style="padding:40px 40px 40px 32px;">
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:bold;color:#2c5282;">{{header}}</h1>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4a5568;">{{content}}</p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">
              <p style="margin:0;font-size:13px;color:#a0aec0;">{{footer}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold colors with playful structure',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#6b21a8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#6b21a8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#6b21a8,#9333ea);padding:40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:bold;color:#ffffff;">{{header}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#2d2d2d;">{{content}}</p>
              <hr style="border:none;border-top:2px solid #9333ea;margin:32px 0;">
              <p style="margin:0;font-size:14px;color:#888888;">{{footer}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];
