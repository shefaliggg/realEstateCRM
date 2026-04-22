import { useMemo, useState } from 'react'

const EMAIL_TEMPLATES_KEY = 'mk-email-templates-v1'

function wrapAsHtmlDocument(content) {
  const trimmed = String(content || '').trim()
  if (!trimmed) return ''
  if (/<!doctype html>|<html[\s>]/i.test(trimmed)) return trimmed
  return `<!doctype html><html><body style="margin:0;padding:24px;font-family:Arial,sans-serif;background:#f3f4f6;">${trimmed}</body></html>`
}

function textToHtmlBody(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

function normalizeTemplate(template) {
  const htmlFromBody = `<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;line-height:1.6;color:#374151;">${textToHtmlBody(template.body || '')}</div>`

  return {
    id: template.id,
    name: template.name || 'Untitled Template',
    category: template.category || 'General',
    subject: template.subject || '',
    preheader: template.preheader || '',
    htmlContent: wrapAsHtmlDocument(template.htmlContent || htmlFromBody),
    createdBy: template.createdBy || 'User',
    updatedAt: template.updatedAt || new Date().toISOString(),
  }
}

const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: 'tpl-lead-intro',
    name: 'Lead Intro - Clean Card',
    category: 'Lead Generation',
    subject: 'Welcome to {{company_name}}',
    preheader: 'Let us help you find the right property fit.',
    htmlContent: `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#eef2ff;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbeafe;">
            <tr>
              <td style="background:#1d4ed8;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;">{{company_name}}</td>
            </tr>
            <tr>
              <td style="padding:24px;color:#374151;line-height:1.7;font-size:15px;">
                <p style="margin-top:0;">Hi {{name}},</p>
                <p>Thanks for your interest in <strong>{{project_name}}</strong>. We can share curated options based on your budget and preferences.</p>
                <p>Reply to this email and we will schedule a quick consultation.</p>
                <a href="#" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">Book Consultation</a>
                <p style="margin-bottom:0;margin-top:20px;">Regards,<br/>{{company_name}} Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    createdBy: 'System',
    updatedAt: '2026-04-23T00:00:00.000Z',
  },
  {
    id: 'tpl-site-visit',
    name: 'Site Visit - Image Banner',
    category: 'Site Visit',
    subject: 'Book your site visit this week',
    preheader: 'Limited slots available for guided walkthroughs.',
    htmlContent: `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#fff7ed;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #fed7aa;">
            <tr>
              <td style="height:180px;background:linear-gradient(120deg,#fb923c,#f97316);padding:24px;color:#ffffff;vertical-align:bottom;">
                <h1 style="margin:0;font-size:28px;">Site Visit Invite</h1>
                <p style="margin:8px 0 0 0;font-size:14px;opacity:0.95;">{{project_name}}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;color:#374151;line-height:1.7;font-size:15px;">
                <p style="margin-top:0;">Hi {{name}},</p>
                <p>We would love to host you for a guided site visit this week.</p>
                <ul style="padding-left:20px;margin:12px 0;">
                  <li>Friday 11:00 AM</li>
                  <li>Saturday 4:00 PM</li>
                </ul>
                <p>Reply with your preferred slot and we will confirm immediately.</p>
                <a href="#" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">Confirm Slot</a>
                <p style="margin-bottom:0;margin-top:20px;">Regards,<br/>{{company_name}} Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    createdBy: 'System',
    updatedAt: '2026-04-23T00:00:00.000Z',
  },
  {
    id: 'tpl-reengagement',
    name: 'Re-engagement - Offer Blocks',
    category: 'Re-engagement',
    subject: 'A quick update you may not want to miss',
    preheader: 'Latest inventory and offer details inside.',
    htmlContent: `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f0fdfa;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;border:1px solid #99f6e4;">
            <tr>
              <td style="padding:24px;color:#134e4a;">
                <h2 style="margin:0 0 10px 0;font-size:24px;">New Offers for {{project_name}}</h2>
                <p style="margin:0;font-size:14px;color:#0f766e;">Fresh inventory updates curated for you.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:10px;padding:14px;">
                      <strong style="display:block;color:#0e7490;margin-bottom:6px;">Why Revisit Now?</strong>
                      <span style="color:#334155;font-size:14px;line-height:1.6;">Improved payment plans, updated prices, and new units available this week.</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0 0;color:#334155;line-height:1.7;font-size:15px;">Hi {{name}}, reply to this email and we will send a personalized shortlist in under 24 hours.</p>
                <a href="#" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;margin-top:14px;">Get Updated Shortlist</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    createdBy: 'System',
    updatedAt: '2026-04-23T00:00:00.000Z',
  },
]

function readTemplates() {
  try {
    const raw = localStorage.getItem(EMAIL_TEMPLATES_KEY)
    if (!raw) return DEFAULT_EMAIL_TEMPLATES.map(normalizeTemplate)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_EMAIL_TEMPLATES.map(normalizeTemplate)
    return parsed.map(normalizeTemplate)
  } catch {
    return DEFAULT_EMAIL_TEMPLATES.map(normalizeTemplate)
  }
}

function saveTemplates(templates) {
  localStorage.setItem(EMAIL_TEMPLATES_KEY, JSON.stringify(templates))
}

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString()
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function EmailTemplatesPage() {
  const templates = useMemo(() => readTemplates(), [])
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? null)
  const selectedTemplate = templates.find((template) => template.id === selectedId) ?? null

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Email Studio</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Templates</h1>
            <p className="text-sm text-gray-500 mt-1">Template gallery view.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedId(template.id)}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden text-left transition ${selectedId === template.id ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="aspect-[4/3] bg-gray-100 border-b border-gray-200">
                <iframe
                  title={`Template Preview ${template.name}`}
                  srcDoc={wrapAsHtmlDocument(template.htmlContent)}
                  className="w-full h-full pointer-events-none"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{template.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{template.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{template.subject}</p>
                <p className="text-[11px] text-gray-400 mt-2">Updated: {formatDate(template.updatedAt)}</p>
              </div>
            </button>
          ))}
        </div>

        {selectedTemplate && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Selected Template Preview</h2>
            <iframe
              title="Selected Email Template Preview"
              srcDoc={wrapAsHtmlDocument(selectedTemplate.htmlContent)}
              className="w-full h-[680px] border border-gray-200 rounded-lg bg-white"
            />
          </div>
        )}
      </div>
    </div>
  )
}
