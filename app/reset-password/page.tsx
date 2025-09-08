// app/reset-password/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordFormComponent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get('token');
    if (!token) {
      setErr("No reset token found. Please request another password reset.");
    }
  }, [searchParams]);

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

    const token = searchParams?.get('token');
    if (!token) {
        setErr("No reset token found. Please request another password reset.");
        setLoading(false);
        return;
    }

    // This part is a bit of a workaround because Supabase JS client v2
    // doesn't have a direct method to sign in with a recovery token and then update password.
    // The user is already in a 'recovery' state from the link.
    // We just need to update the password.
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


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordFormComponent />
        </Suspense>
    )
}