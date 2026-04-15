import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const passwordPolicyHint =
  '8+ chars with uppercase, lowercase, number and special character.'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { validateInvite, acceptInvite, verifyInviteOtp, resendInviteOtp } = useAuth()

  const [invite, setInvite] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('loading')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const data = await validateInvite(token)
        setInvite(data.invite)
        setStep('password')
      } catch (err) {
        setError(err.response?.data?.message || 'Invite validation failed')
        setStep('error')
      }
    }

    loadInvite()
  }, [token, validateInvite])

  const submitPassword = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!password || !confirmPassword) {
      setError('Please fill password and confirmation')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const data = await acceptInvite(token, password)
      setInfo(data.devOtp ? `Dev OTP: ${data.devOtp}` : 'OTP sent to your email')
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to set password')
    } finally {
      setLoading(false)
    }
  }

  const submitOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!otp) {
      setError('Enter OTP')
      return
    }

    setLoading(true)
    try {
      await verifyInviteOtp(token, otp)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const onResendOtp = async () => {
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const data = await resendInviteOtp(token)
      setInfo(data.devOtp ? `Dev OTP: ${data.devOtp}` : 'OTP resent to your email')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'loading') {
    return <div className="min-h-screen grid place-items-center text-gray-600">Validating invite...</div>
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invite Error</h1>
          <p className="mt-3 text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to PropVault</h1>

        <div className="mt-4 p-3 rounded-lg bg-gray-50 text-sm text-gray-700">
          <p><span className="font-medium">Name:</span> {invite?.name}</p>
          <p><span className="font-medium">Email:</span> {invite?.email}</p>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {info && <p className="mt-4 text-sm text-green-600">{info}</p>}

        {step === 'password' && (
          <form onSubmit={submitPassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={passwordPolicyHint}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Submitting...' : 'Set Password'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={submitOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field"
                placeholder="6-digit OTP"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Verifying...' : 'Verify OTP and Login'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onResendOtp}
              className="w-full py-2 text-sm text-primary-700 hover:text-primary-800"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
