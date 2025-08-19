import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback values if environment variables are not set
if (!supabaseUrl) {
  supabaseUrl = 'https://tpvnaizaiyyajuxfwqqa.supabase.co'
  console.warn('⚠️ Using fallback Supabase URL - consider setting NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdm5haXphaXl5YWp1eGZ3cXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTM2NjEsImV4cCI6MjA3MTAyOTY2MX0.uDjXJiv2NOSrcyNwvkJUi-V61AhScXvLHdIv5fpKaEY'
  console.warn('⚠️ Using fallback Supabase key - consider setting NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Log environment variable status for debugging
console.log('🔧 Supabase Config Check:')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

// Create Supabase client with enhanced error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically handle auth state changes
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session in URL (for OAuth callbacks)
    detectSessionInUrl: true,
    // Add flow type for better session handling
    flowType: 'pkce'
  },
  // Add global error handling
  global: {
    headers: {
      'X-Client-Info': 'wafarle-app'
    }
  }
})

// Test the connection with better error handling
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    if (error.message.includes('Auth session missing')) {
      console.log('ℹ️ No active auth session - this is normal for new users')
    } else {
      console.warn('⚠️ Supabase auth session check failed:', error.message)
    }
  } else {
    console.log('✅ Supabase client initialized successfully')
  }
}).catch(err => {
  if (err.message.includes('Auth session missing')) {
    console.log('ℹ️ No active auth session - this is normal for new users')
  } else {
    console.warn('⚠️ Supabase initialization warning:', err.message)
  }
})
