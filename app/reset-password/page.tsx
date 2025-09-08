// app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The user is in the password recovery flow.
        // We don't need to do anything here as the form will handle the password update.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      setMsg('Your password has been updated successfully.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="justify-center items-center max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border-gray-700">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-semibold">Reset password</h2>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border"
          />
          <button disabled={loading} className="w-full px-4 py-2 rounded bg-blue-600 text-white">
            {loading ? 'Updating…' : 'Update password'}
          </button>
          {msg && <p className="text-green-600">{msg}</p>}
          {err && <p className="text-red-600">{err}</p>}
        </form>
      </div>
    </div>
  );
}
