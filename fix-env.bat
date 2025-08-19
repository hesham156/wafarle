@echo off
echo Fixing .env.local file...

echo NEXT_PUBLIC_SUPABASE_URL=https://tpvnaizaiyyajuxfwqqa.supabase.co > .env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdm5haXphaXl5YWp1eGZ3cXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTM2NjEsImV4cCI6MjA3MTAyOTY2MX0.uDjXJiv2NOSrcyNwvkJUi-V61AhScXvLHdIv5fpKaEY >> .env.local

echo.
echo .env.local file has been fixed!
echo Please restart your development server.
echo.
pause
