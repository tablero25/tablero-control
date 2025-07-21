# build_and_copy.ps1
# 1. Mueve logo192.png y logoo.png a public si no están
$logo192Src = "frontend/src/logo192.png"
$logo192Dest = "frontend/public/logo192.png"
if (Test-Path $logo192Src) {
    Copy-Item $logo192Src $logo192Dest -Force
    Write-Host "logo192.png copiado a frontend/public/"
}

$logooSrc = "frontend/src/logoo.png"
$logooDest = "frontend/public/logoo.png"
if (Test-Path $logooSrc) {
    Copy-Item $logooSrc $logooDest -Force
    Write-Host "logoo.png copiado a frontend/public/"
}

# 2. Borra el build anterior del frontend
if (Test-Path "frontend/build") {
    Remove-Item "frontend/build" -Recurse -Force
    Write-Host "Build anterior de frontend eliminado."
}

# 3. Hace el build del frontend
cd frontend
npm run build
cd ..

# 4. Borra el build anterior en backend
if (Test-Path "backend/build") {
    Remove-Item "backend/build" -Recurse -Force
    Write-Host "Build anterior de backend eliminado."
}

# 5. Copia el nuevo build al backend
Copy-Item -Path "frontend/build" -Destination "backend/" -Recurse
Write-Host "Build copiado al backend correctamente."

# 6. Verifica que logo192.png y logoo.png estén en el build del backend
$logo192Backend = "backend/build/logo192.png"
$logooBackend = "backend/build/static/media/logoo" # Puede tener hash, así que buscamos por patrón

if (Test-Path $logo192Backend) {
    Write-Host "✅ logo192.png está presente en el build del backend."
} else {
    Write-Host "❌ logo192.png NO está en el build del backend. Revisa el proceso."
}

$logooFound = Get-ChildItem -Path "backend/build/static/media/" -Filter "logoo*.png" | Select-Object -First 1
if ($logooFound) {
    Write-Host "✅ logoo.png (con hash) está presente en el build del backend: $($logooFound.Name)"
} else {
    Write-Host "❌ logoo.png NO está en el build del backend. Revisa el proceso."
}

# 7. Commit y push automático del build del backend
cd backend
# Forzamos el add del build
& git add build -f
$commitMsg = "Auto: build actualizado $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
& git commit -m $commitMsg
& git push
cd ..
Write-Host "Commit y push realizados automáticamente." 