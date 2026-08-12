import { useAuth } from '../context/AuthContext'

export default function TopBar({ onOpenSidebar, onOpenAssistant }) {
  const { user } = useAuth()

  return (
    <header className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center px-3 lg:px-4">
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm shrink-0"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <p className="flex-1 text-center text-sm font-semibold text-gray-700 truncate px-2">
        {user?.builderName || ''}
      </p>

      <button
        onClick={onOpenAssistant}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
        Ask AI
      </button>
    </header>
  )
}
