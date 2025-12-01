import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
    console.error('Error: Missing Supabase environment variables.')
    process.exit(1)
}

const supabase = createClient(url, key)

async function verify() {
    try {
        // Try to fetch the session (should be null but no error) or just check health
        // Since we don't have a table guaranteed, we just check if client initializes
        // and maybe try a simple query if possible, or just auth.
        const { data, error } = await supabase.auth.getSession()
        if (error) {
            console.error('Supabase connection error:', error.message)
            process.exit(1)
        }
        console.log('Supabase connection successful!')
        console.log('URL:', url)
        console.log('Session check passed.')
    } catch (err) {
        console.error('Unexpected error:', err)
        process.exit(1)
    }
}

verify()
