@echo off
setlocal
echo ==============================================
echo POCKET MINI SYSTEM - BACKUP DATABASE SCRIPT (WINDOWS)
echo ==============================================

:: Cấu hình
set DB_CONTAINER_NAME=pocket-mini-db
set DB_USER=pocket-mini
set DB_NAME=pocket-mini

:: Tạo thư mục backups nếu chưa có
if not exist "backups" mkdir backups

:: Tạo timestamp theo định dạng YYYYMMDD_HHMMSS
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%mydate%_%mytime: =0%

set BACKUP_FILE=backups\backup_%TIMESTAMP%.sql

echo Dang tao ban sao luu vao %BACKUP_FILE% ...
docker exec -t %DB_CONTAINER_NAME% pg_dump -U %DB_USER% -d %DB_NAME% -c > %BACKUP_FILE%

if %errorlevel% equ 0 (
    echo Hoan thanh! Ban sao luu da duoc luu tai: %BACKUP_FILE%
) else (
    echo [LOI] Co loi xay ra trong qua trinh sao luu. Vui long kiem tra lai Docker dang chay khong.
)

pause
