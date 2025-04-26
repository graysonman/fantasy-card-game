'use client';

import { login, signup } from './actions';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const signupSuccess = searchParams.get('signup') === 'success';

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 24 }}>
      {signupSuccess && (
        <div style={{ background: "#e6ffe6", color: "#006600", padding: 12, marginBottom: 16, borderRadius: 6 }}>
          Check your email to confirm your account.
        </div>
      )}
      <h2>Login</h2>
      <form className="flex flex-col gap-2" style={{ width: '100%' }}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button formAction={login} style={{ width: '100%' }}>Log in</button>
          <button formAction={signup} style={{ width: '100%' }}>Sign up</button>
        </div>
      </form>
    </div>
  );
}