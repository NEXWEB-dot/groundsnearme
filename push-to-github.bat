@echo off
echo ===================================================
echo Pushing GroundsNearMe to GitHub...
echo Target: https://github.com/NEXWEB-dot/groundsnearme.git
echo ===================================================
cd /d "%~dp0"
"D:\Git\cmd\git.exe" push origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] GroundsNearMe pushed successfully!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo [NOTE] If connection times out, please turn on your
    echo VPN / WARP and run this script again.
    echo ===================================================
)
pause
