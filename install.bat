@echo off
echo ===================================
echo FleetFlow - Instalacao Completa
echo ===================================

echo.
echo 1. Removendo instalacoes anteriores...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 2. Limpando cache do npm...
call npm cache clean --force

echo.
echo 3. Instalando dependencias principais...
call npm install react@18.2.0 react-dom@18.2.0

echo.
echo 4. Instalando bibliotecas de UI...
call npm install @radix-ui/react-toast@1.1.5 @radix-ui/react-avatar@1.0.4 @radix-ui/react-separator@1.0.3 @radix-ui/react-select@2.0.0 @radix-ui/react-switch@1.0.3 @radix-ui/react-dropdown-menu@2.0.6 @radix-ui/react-dialog@1.0.5 @radix-ui/react-slot@1.0.2 @radix-ui/react-label@2.0.2

echo.
echo 5. Instalando utilitarios...
call npm install class-variance-authority@0.7.0 clsx@2.1.0 tailwind-merge@2.2.1 lucide-react@0.312.0

echo.
echo 6. Instalando outras dependencias...
call npm install @hookform/resolvers@3.3.4 @tanstack/react-query@5.17.19 react-hook-form@7.49.3 react-router-dom@6.21.3 zod@3.22.4 date-fns@3.3.1 @supabase/supabase-js@2.39.3

echo.
echo 7. Instalando dependencias de desenvolvimento...
call npm install -D tailwindcss@3.4.1 postcss@8.4.33 autoprefixer@10.4.17 @tailwindcss/forms@0.5.7 tailwindcss-animate@1.0.7 @vitejs/plugin-react@4.2.1 vite@5.0.12

echo.
echo 8. Criando estrutura de pastas...
mkdir src\components\ui
mkdir src\components\layout
mkdir src\components\shared
mkdir src\components\forms
mkdir src\pages\auth
mkdir src\pages\dashboard
mkdir src\pages\vehicles
mkdir src\routes
mkdir src\hooks
mkdir src\services
mkdir src\contexts
mkdir src\lib
mkdir src\utils
mkdir src\styles

echo.
echo ===================================
echo Instalacao concluida com sucesso!
echo Execute: npm run dev
echo ===================================
pause