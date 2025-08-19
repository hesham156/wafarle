Write-Host "Fixing .env.local file..." -ForegroundColor Green

# Remove existing file
if (Test-Path .env.local) {
    Remove-Item .env.local -Force
    Write-Host "Removed existing .env.local file" -ForegroundColor Yellow
}

# Create new file with proper content
$envContent = @"
NEXT_PUBLIC_SUPABASE_URL=https://tpvnaizaiyyajuxfwqqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdm5haXphaXl5YWp1eGZ3cXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTM2NjEsImV4cCI6MjA3MTAyOTY2MX0.uDjXJiv2NOSrcyNwvkJUi-V61AhScXvLHdIv5fpKaEY
"@

$envContent | Out-File -FilePath .env.local -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host ".env.local file has been fixed!" -ForegroundColor Green
Write-Host "Please restart your development server." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
