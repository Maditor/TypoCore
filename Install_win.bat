@echo off
echo ========================================
echo   TypoCore Panel V1.3.1 - Installer
echo ========================================
echo.
echo Close Photoshop (if it is open).
echo.
PAUSE

setlocal EnableDelayedExpansion

REM Kích hoạt PlayerDebugMode cho CS6 trở lên (hỗ trợ CC 2018+)
for /l %%x in (6, 1, 12) do (
    reg query HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x 2>nul
    if !errorlevel! equ 0 (
        reg add HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.%%x /t REG_SZ /v PlayerDebugMode /d 1 /f
    )
)

REM Đặt đường dẫn cài đặt theo chuẩn Adobe CEP
set TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\com.typocore.panel

REM Xoá cài đặt cũ nếu có
if exist "%TARGET_DIR%" rmdir "%TARGET_DIR%" /S /Q

REM Tạo thư mục đích
md "%TARGET_DIR%"

echo Installing core files...

REM Copy các file gốc
if exist .debug copy /Y .debug "%TARGET_DIR%\"

REM Copy các thư mục con
if exist app xcopy app "%TARGET_DIR%\app\" /E /Y /I
if exist lib xcopy lib "%TARGET_DIR%\lib\" /E /Y /I
if exist CSXS xcopy CSXS "%TARGET_DIR%\CSXS\" /E /Y /I
if exist icons xcopy icons "%TARGET_DIR%\icons\" /E /Y /I

echo.
echo ========================================
echo   Installation completed!
echo   Open Photoshop and go to:
echo   [Window] ^> [Extensions] ^> [TypoCore]
echo ========================================
echo.
PAUSE