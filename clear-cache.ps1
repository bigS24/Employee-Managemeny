Write-Host "🧹 Clearing ALL caches and rebuilding..." -ForegroundColor Cyan

# 1. Remove dist folders
Write-Host "`n1️⃣ Removing dist folders..." -ForegroundColor Yellow
Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\dist-electron" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Remove Electron cache
Write-Host "`n2️⃣ Clearing Electron cache..." -ForegroundColor Yellow
Remove-Item -Path "$env:APPDATA\electron" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\electron" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Remove application data
Write-Host "`n3️⃣ Clearing application data..." -ForegroundColor Yellow
Remove-Item -Path "$env:APPDATA\employee-management-system" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Clear npm cache
Write-Host "`n4️⃣ Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# 5. Rebuild everything
Write-Host "`n5️⃣ Rebuilding backend..." -ForegroundColor Yellow
npm run build:electron

Write-Host "`n6️⃣ Rebuilding frontend..." -ForegroundColor Yellow
npm run build

Write-Host "`n✅ Cache cleared and rebuild complete!" -ForegroundColor Green
Write-Host "`n▶️  Now run: npm start" -ForegroundColor Cyan
