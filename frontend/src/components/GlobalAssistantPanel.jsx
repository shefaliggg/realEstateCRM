import { useState } from 'react'
import { askGlobalAssistant } from '../api/aiApi'

export default function GlobalAssistantPanel({ open, onClose }) {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSend = async (e) => {
    e.preventDefault()
    const question = prompt.trim()
    if (!question || loading) return
    setPrompt('')
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setLoading(true)
    try {
      const { reply } = await askGlobalAssistant(question)
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, the assistant is unavailable right now.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 h-screen w-full max-w-sm bg-white border-l border-gray-200 flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 shrink-0">
          <div>
            <p className="text-sm font-bold text-gray-900">PropVault Assistant</p>
            <p className="text-[10px] text-amber-600 font-medium">Simulated AI response (Phase 1)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label="Close assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400">
              Ask anything about your projects, leads, deals, or campaigns. Responses are scoped to what you have access to.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === 'user' ? 'ml-auto bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-400">Thinking…</div>}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2 shrink-0">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the assistant…"
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary px-4">
            Send
          </button>
        </form>
      </aside>
    </>
  )
}
