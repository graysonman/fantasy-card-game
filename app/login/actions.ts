'use server'

import { createClient } from '@/utils/supabaseServer'

type AuthResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error('Login error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error during login:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  try {
    const { error } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('Signup error:', error.message)
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      message: 'Check your email to confirm your account.' 
    }
  } catch (error) {
    console.error('Unexpected error during signup:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred during signup' 
    }
  }
}