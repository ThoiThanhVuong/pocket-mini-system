@echo off
setlocal
echo ==============================================
echo POCKET MINI SYSTEM - RESTORE DATABASE SCRIPT (WINDOWS)
echo ==============================================

if "%~1"=="" (
    echo [LOI] Ban phai truyen vao ten file backup de phuc hoi.
    echo Cú pháp: restore-db.bat backups\backup_filename.sql
    pause
    exit /b 1
)

set BACKUP_FILE=%~1

if not exist "%BACKUP_FILE%" (
    echo [LOI] Khong tim thay file sao luu "%BACKUP_FILE%".
    pause
    exit /b 1
)

set DB_CONTAINER_NAME=pocket-mini-db
set DB_USER=pocket-mini
set DB_NAME=pocket-mini

echo CANH BAO: Thao tac nay se xoa toan bo du lieu hien tai va phuc hoi tu file %BACKUP_FILE%.
set /p CONFIRM="Ban co chac chan muon tiep tuc? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Da huy bo thao tac phuc hoi.
    pause
    exit /b 0
)

echo Dang phuc hoi du lieu tu file %BACKUP_FILE% ...
type "%BACKUP_FILE%" | docker exec -i %DB_CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME%

if %errorlevel% equ 0 (
    echo Hoan thanh! Co so du lieu da duoc phuc hoi.
) else (
    echo [LOI] Co loi xay ra trong qua trinh phuc hoi.
)

pause
