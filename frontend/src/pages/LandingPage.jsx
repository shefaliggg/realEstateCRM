import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDefaultProduct } from '../config/products'

const PROBLEMS = [
  {
    title: 'Leads live in five places',
    body: 'A spreadsheet for site visits, a notebook for walk-ins, a WhatsApp thread for the rest. Nothing talks to anything else.',
    icon: <path d="M4 5h16M4 12h16M4 19h10" />,
  },
  {
    title: 'Inventory goes stale',
    body: 'Sales quotes a unit that was booked yesterday. By the time the spreadsheet is updated, the customer has walked.',
    icon: <path d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4" />,
  },
  {
    title: 'Partners are a black box',
    body: 'Channel partners email in leads and chase payouts on the phone, because they have no visibility into either.',
    icon: <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm-6 8a4 4 0 018 0" />,
  },
]

const FACTS = [
  { value: '3', label: 'modules on one shared database', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
  { value: '1', label: 'login for the whole deal lifecycle', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { value: 'Live', label: 'inventory, always in sync', icon: 'M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4' },
  { value: '0', label: 'spreadsheets required', icon: 'M4 5h16M4 12h16M4 19h10' },
]

const MODULES = [
  {
    id: 'crm',
    code: 'CR',
    name: 'CRM',
    tagline: 'The pipeline, kept honest',
    description:
      'Every lead, site visit, and booking lives against real inventory, so the pipeline always reflects what is actually left to sell.',
    features: [
      'Lead capture, ownership & scoring',
      'Visual deal pipeline with deal-level detail',
      'Site visit scheduling on a shared calendar',
      'Inventory down to the floor and unit',
      'Post-sales: bookings, payments, documents, referrals',
    ],
    panel: (
      <div className="grid grid-cols-3 gap-3">
        {[
          { stage: 'New', color: 'bg-gray-100 text-gray-600', deals: ['R. Mehta · 2BHK', 'S. Iyer · 3BHK'] },
          { stage: 'Site Visit', color: 'bg-primary-50 text-primary-700', deals: ['A. Khan · Tower B'] },
          { stage: 'Booked', color: 'bg-green-50 text-green-700', deals: ['P. Rao · 1BHK', 'D. Shah · 2BHK'] },
        ].map((col) => (
          <div key={col.stage} className="bg-gray-50 rounded-lg p-2.5">
            <p className={`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 inline-block ${col.color}`}>
              {col.stage}
            </p>
            <div className="mt-2 space-y-1.5">
              {col.deals.map((d) => (
                <div key={d} className="bg-white rounded-md border border-gray-100 px-2 py-1.5 text-[11px] text-gray-700 shadow-sm">
                  {d}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'marketing',
    code: 'MK',
    name: 'Marketing',
    tagline: 'Demand, on the record',
    description:
      'Run campaigns and generate leads, then see exactly which channel paid off — without leaving the platform your sales team lives in.',
    features: [
      'Campaign workspace: email, landing pages & analytics',
      'Lead generation via Google Maps & bulk import',
      'Automated lead nurture sequences',
      'Source-level attribution & performance reports',
    ],
    panel: (
      <div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Sent', value: '4,120' },
            { label: 'Opened', value: '2,340' },
            { label: 'Replied', value: '318' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">{s.label}</p>
              <p className="text-base font-bold text-gray-900 tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 h-16 bg-gray-50 rounded-lg p-3">
          {[30, 55, 40, 70, 50, 85, 60].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-primary-500/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'partner',
    code: 'CP',
    name: 'Channel Partner',
    tagline: 'Your brokers, in the ledger',
    description:
      'Give channel partners a portal of their own — their leads, their payouts, their performance — without handing over your CRM.',
    features: [
      'Dedicated partner portal, separate from your team view',
      'Partner-sourced lead intake tied to the pipeline',
      'Automated payout tracking & statements',
      'Partner profiles & per-partner reports',
    ],
    panel: (
      <div className="space-y-2">
        {[
          { name: 'Horizon Realty', leads: 24, payout: '₹1.8L due' },
          { name: 'Skyline Associates', leads: 11, payout: 'Paid' },
          { name: 'Metro Brokers', leads: 33, payout: '₹3.2L due' },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-gray-900">{p.name}</p>
              <p className="text-[11px] text-gray-500">{p.leads} leads sourced</p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                p.payout === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-primary-50 text-primary-700'
              }`}
            >
              {p.payout}
            </span>
          </div>
        ))}
      </div>
    ),
  },
]

const FEATURES = [
  { label: 'Lead Management', desc: 'Capture, own, and score every lead in one queue.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Deal Pipeline', desc: 'Visual stages from qualification to possession.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Site Visit Scheduling', desc: 'A shared calendar your whole team books against.', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Inventory Management', desc: 'Every tower, floor, and unit — booked or available.', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1' },
  { label: 'Marketing Campaigns', desc: 'Email sequences and landing pages, source-attributed.', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'Channel Partner Portal', desc: 'A separate workspace for brokers and their payouts.', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm-6 8a4 4 0 018 0' },
  { label: 'Post-Sales & Payments', desc: 'Bookings, payment schedules, documents, referrals.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { label: 'Reports & Dashboards', desc: 'Sales, marketing, and performance — always current.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

const SOLUTIONS = [
  {
    role: 'Sales Teams',
    body: 'Work one pipeline instead of chasing five. Every lead, site visit, and booking is tied to inventory that is actually available.',
    link: { to: '/login', label: 'Open the CRM' },
  },
  {
    role: 'Marketing Teams',
    body: 'Launch campaigns and nurture sequences that hand off cleanly to sales, with attribution that survives the handoff.',
    link: { to: '/login', label: 'Open Marketing' },
  },
  {
    role: 'Channel Partners',
    body: 'A portal built for brokers: submit leads, track status, and see payouts — without waiting on a phone call.',
    link: { to: '/login', label: 'Open Partner Portal' },
  },
]

function Icon({ path, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  )
}

function Logo({ box = 'w-9 h-9', icon = 'w-5 h-5' }) {
  return (
    <div className={`${box} bg-primary-600 rounded-xl flex items-center justify-center shadow-sm shadow-primary-900/20`}>
      <svg className={`${icon} text-white`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
      </svg>
    </div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const [activeModule, setActiveModule] = useState(MODULES[0].id)

  if (user) {
    return <Navigate to={getDefaultProduct(user.role).homePath} replace />
  }

  const active = MODULES.find((m) => m.id === activeModule)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-bold text-gray-900">PropVault</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#modules" className="hover:text-primary-600 transition">Modules</a>
            <a href="#features" className="hover:text-primary-600 transition">Features</a>
            <a href="#solutions" className="hover:text-primary-600 transition">Solutions</a>
          </nav>
          <Link to="/login" className="btn-primary text-sm px-4 py-2">
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-50">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, #ffedd5, transparent)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary-600 mb-6">
            Real estate operating system
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-gray-900 max-w-3xl mx-auto text-balance">
            Every lead. Every deal. One system.
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            PropVault unifies CRM, marketing, and channel-partner operations into one
            platform — from the first site visit to the final possession letter.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
              Sign in to your workspace
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#modules"
              className="text-sm font-semibold text-gray-700 border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition rounded-lg px-6 py-3"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero product preview */}
        <div className="relative max-w-5xl mx-auto px-6 pb-20">
          <div className="card p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[
                { icon: '🏗️', label: 'Projects', val: '12', color: 'bg-blue-50 text-blue-600' },
                { icon: '📦', label: 'Total Units', val: '860', color: 'bg-green-50 text-green-600' },
                { icon: '👥', label: 'Total Leads', val: '1,204', color: 'bg-orange-50 text-orange-600' },
                { icon: '🤝', label: 'Active Deals', val: '96', color: 'bg-primary-50 text-primary-600' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl border border-gray-100 p-3.5 text-left">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm mb-2 ${s.color}`}>{s.icon}</div>
                  <p className="text-xl font-bold text-gray-900 tabular-nums">{s.val}</p>
                  <p className="text-[11px] font-medium text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { stage: 'New', color: 'bg-gray-100 text-gray-600', deals: ['R. Mehta · 2BHK', 'S. Iyer · 3BHK'] },
                  { stage: 'Site Visit', color: 'bg-primary-50 text-primary-700', deals: ['A. Khan · Tower B'] },
                  { stage: 'Booked', color: 'bg-green-50 text-green-700', deals: ['P. Rao · 1BHK'] },
                ].map((col) => (
                  <div key={col.stage} className="text-left">
                    <p className={`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 inline-block ${col.color}`}>
                      {col.stage}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {col.deals.map((d) => (
                        <div key={d} className="bg-white rounded-md border border-gray-100 px-2 py-1.5 text-[11px] text-gray-700 shadow-sm">
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-600 mb-3">The problem</p>
            <h2 className="text-3xl font-bold text-gray-900">Real estate software wasn&apos;t built for real estate teams</h2>
            <p className="mt-3 text-gray-500">
              Manual, fragmented, reactive — the tools don&apos;t talk to each other, so nobody has the full picture.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {p.icon}
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution bridge + facts */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary-600 mb-3">The fix</p>
          <h2 className="text-3xl font-bold text-gray-900">PropVault brings it together</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            One platform to sell, market, and manage partners — all reading from the
            same leads, deals, and inventory.
          </p>
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {FACTS.map((f) => (
              <div key={f.label} className="card p-4 text-left">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                  <Icon path={f.icon} className="w-4.5 h-4.5 text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{f.value}</p>
                <p className="mt-1 text-xs text-gray-500 leading-snug">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules — tabbed */}
      <section id="modules" className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-600 mb-3">One platform</p>
            <h2 className="text-3xl font-bold text-gray-900">Three modules, one shared data core</h2>
          </div>

          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {MODULES.map((m) => (
              <button
                key={m.id}
                id={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`scroll-mt-24 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition border ${
                  activeModule === m.id
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <span className="font-mono text-[10px] opacity-70">{m.code}</span>
                {m.name}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{active.name}</h3>
              <p className="text-sm font-semibold text-primary-600 mt-1">{active.tagline}</p>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{active.description}</p>
              <ul className="mt-6 space-y-2.5">
                {active.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary-600" fill="none" viewBox="0 0 16 16">
                      <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
              </div>
              {active.panel}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-600 mb-3">Everything included</p>
            <h2 className="text-3xl font-bold text-gray-900">One system, every function</h2>
            <p className="mt-3 text-gray-500">
              No add-ons to buy, no separate tools to stitch together.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="card p-5">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                  <Icon path={f.icon} className="w-4.5 h-4.5 text-primary-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{f.label}</h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions by role */}
      <section id="solutions" className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-600 mb-3">Built for every seat</p>
            <h2 className="text-3xl font-bold text-gray-900">Whichever side of the deal you're on</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {SOLUTIONS.map((s) => (
              <div key={s.role} className="card p-6 flex flex-col">
                <h3 className="text-gray-900 font-semibold">{s.role}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1">{s.body}</p>
                <Link to={s.link.to} className="mt-5 text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5">
                  {s.link.label}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white max-w-xl mx-auto">
            Bring every module into one system.
          </h2>
          <p className="mt-3 text-primary-100 max-w-md mx-auto">
            Sign in with your invited account to pick up where your team left off.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm mt-8 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition"
          >
            Sign in to your workspace
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2">
              <Logo box="w-7 h-7" icon="w-4 h-4" />
              <span className="text-sm font-semibold text-gray-900">PropVault</span>
            </div>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              The system of record for how real estate teams sell.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Product</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#crm" className="hover:text-primary-600 transition">CRM</a></li>
              <li><a href="#marketing" className="hover:text-primary-600 transition">Marketing</a></li>
              <li><a href="#partner" className="hover:text-primary-600 transition">Channel Partner</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Features</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Lead & deal pipeline</li>
              <li>Site visit scheduling</li>
              <li>Campaign management</li>
              <li>Partner payouts</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Account</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/login" className="hover:text-primary-600 transition">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-gray-400">
            CRM · Marketing · Channel Partner — one system.
          </div>
        </div>
      </footer>
    </div>
  )
}
