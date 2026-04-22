import { useMemo, useState } from 'react'

const EMAIL_SETTINGS_KEY = 'mk-email-settings-v1'

const DEFAULT_EMAIL_SETTINGS = {
  fromName: '',
  fromEmail: '',
  replyToEmail: '',
  provider: 'SMTP',
  smtpHost: '',
  smtpPort: '587',
  dailySendLimit: '1000',
  unsubscribeFooter: 'You are receiving this email because you subscribed to updates from us.',
}

function readSettings() {
  try {
    const raw = localStorage.getItem(EMAIL_SETTINGS_KEY)
    if (!raw) return DEFAULT_EMAIL_SETTINGS
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_EMAIL_SETTINGS,
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
    }
  } catch {
    return DEFAULT_EMAIL_SETTINGS
  }
}

function saveSettings(data) {
  localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(data))
}

export default function EmailSettingsPage() {
  const initial = useMemo(() => readSettings(), [])
  const [savedSnapshot, setSavedSnapshot] = useState(initial)
  const [form, setForm] = useState(initial)
  const [notice, setNotice] = useState('')

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedSnapshot)

  function onChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setNotice('')
  }

  function onSave() {
    saveSettings(form)
    setSavedSnapshot(form)
    setNotice('Email settings saved.')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure sender identity, provider details, and delivery controls.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-5">
        {notice && <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm px-3 py-2">{notice}</div>}

        <div className="grid md:grid-cols-2 gap-3">
          <input value={form.fromName} onChange={(e) => onChange('fromName', e.target.value)} placeholder="From name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={form.fromEmail} onChange={(e) => onChange('fromEmail', e.target.value)} placeholder="From email" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={form.replyToEmail} onChange={(e) => onChange('replyToEmail', e.target.value)} placeholder="Reply-to email" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />

          <select value={form.provider} onChange={(e) => onChange('provider', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="SMTP">SMTP</option>
            <option value="SendGrid">SendGrid</option>
            <option value="Mailgun">Mailgun</option>
            <option value="Amazon SES">Amazon SES</option>
          </select>

          <input value={form.smtpHost} onChange={(e) => onChange('smtpHost', e.target.value)} placeholder="SMTP host" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={form.smtpPort} onChange={(e) => onChange('smtpPort', e.target.value)} placeholder="SMTP port" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={form.dailySendLimit} onChange={(e) => onChange('dailySendLimit', e.target.value)} placeholder="Daily send limit" className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2" />

          <textarea
            value={form.unsubscribeFooter}
            onChange={(e) => onChange('unsubscribeFooter', e.target.value)}
            placeholder="Unsubscribe footer text"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[90px] md:col-span-2"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!isDirty}
            onClick={onSave}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Save Email Settings
          </button>
        </div>
      </div>
    </div>
  )
}
