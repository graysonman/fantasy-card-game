// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // your browser client

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null); setMsg(null);

    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin) + '/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setLoading(false);
    if (error) setErr(error.message);
    else setMsg('Check your email for a password reset link.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
    <div className="justify-center items-center max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border-gray-700">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold">Forgot password</h2>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded border"
        />
        <button disabled={loading} className="w-full px-4 py-2 rounded bg-blue-600 text-white">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        {msg && <p className="text-green-600">{msg}</p>}
        {err && <p className="text-red-600">{err}</p>}
      </form>
    </div>
    </div>
  );
}
