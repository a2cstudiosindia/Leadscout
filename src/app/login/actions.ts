'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: { session }, error } = await supabase.auth.signUp(data)

    if (error) {
        // Check if error is due to user already existing
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            // Attempt to log them in instead
            const { error: loginError } = await supabase.auth.signInWithPassword(data)

            if (loginError) {
                redirect('/login?error=' + encodeURIComponent('Account exists but login failed. Please try logging in.'))
            }

            // Successfully logged in existing user
            revalidatePath('/', 'layout')
            redirect('/dashboard')
        }

        redirect('/login?error=' + error.message)
    }

    if (!session) {
        // Email confirmation enabled, or manual approval required
        redirect('/login?message=Check your email to confirm your account')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
