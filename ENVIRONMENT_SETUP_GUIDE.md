# 🔧 Environment Setup Guide

This guide will help you set up your environment variables to fix the `AuthSessionMissingError`.

## 📋 Required Environment Variables

You need to create a `.env.local` file in your project root with your Supabase credentials.

### Step 1: Create .env.local file

Create a file called `.env.local` in your `wafarle-app` directory with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one if you don't have one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Example .env.local file

```bash
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNTIxOTk3NCwiZXhwIjoxOTMwNzk1OTc0fQ.example-key-here
```

## 🚀 Testing Your Setup

After creating the `.env.local` file:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The `AuthSessionMissingError` should now be resolved.

3. Check the browser console - you should no longer see auth session errors.

## 🛠️ What We Fixed

1. **Better Error Handling**: Updated Supabase client configuration with proper auth options
2. **Auth Utilities**: Created helper functions to safely handle auth operations
3. **Session Management**: Improved session persistence and automatic refresh
4. **Error Recovery**: Components now gracefully handle missing sessions

## 🔍 Troubleshooting

### Still getting AuthSessionMissingError?

1. **Check Environment Variables**: Make sure your `.env.local` file is in the correct location and has the right values
2. **Restart Server**: Always restart your development server after changing environment variables
3. **Check Supabase Project**: Ensure your Supabase project is active and accessible
4. **Clear Browser Cache**: Clear your browser's local storage and cache

### Invalid Supabase URL or Key?

1. Double-check the values in your Supabase dashboard
2. Make sure there are no extra spaces or quotes around the values
3. Ensure the URL starts with `https://` and ends with `.supabase.co`

## 📝 Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is automatically ignored by Git
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Changes to environment variables require a server restart

## 🎯 Next Steps

Once your environment is set up correctly:

1. Test the authentication flow (login/register)
2. Verify that protected pages work correctly
3. Check that user sessions persist across page refreshes
