@echo off
chcp 65001 >nul
echo ===================================
echo CRIANDO COMPONENTES FLEETFLOW
echo ===================================

REM Criar diretórios
mkdir src\components\shared 2>nul
mkdir src\components\forms 2>nul
mkdir src\pages\vehicles 2>nul
mkdir src\utils 2>nul
mkdir src\hooks 2>nul

echo.
echo ✅ Pastas criadas!
echo.
echo Agora copie o código de cada arquivo manualmente
echo ou use um editor de texto para criar os arquivos .jsx

pause