import React, { useState } from 'react'
import { BarChart3, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { authApi } from '../api/client'

export default function Login({ onLogin }) {
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.login(form.username, form.password)
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('user',  JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-primary to-secondary shadow-lg mb-4">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-base-content">Raqamli Bozor</h1>
          <p className="text-base-content/50 text-sm mt-1">Dashboard panelga kirish</p>
        </div>

        {/* Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Username */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Foydalanuvchi nomi</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered focus:input-primary"
                  placeholder="username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Parol</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input input-bordered focus:input-primary w-full pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40
                               hover:text-base-content transition-colors"
                    onClick={() => setShowPw(v => !v)}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-error py-2 text-sm">
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full gap-2 mt-1"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Kirish...</>
                  : <><LogIn size={16} /> Kirish</>
                }
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-base-content/30 mt-6">
          © {new Date().getFullYear()} Raqamli Bozor — Andijon viloyati
        </p>
      </div>
    </div>
  )
}
