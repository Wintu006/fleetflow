# 🚀 FleetFlow - Fleet Management System

Sistema moderno de gerenciamento de frota veicular construído com React, Supabase e TailwindCSS.

![FleetFlow Dashboard](public/og-image.png)

## ✨ Funcionalidades

- 🔐 Autenticação completa (login/registro)
- 📊 Dashboard com métricas em tempo real
- 🚗 CRUD completo de veículos
- 🎨 Tema dark/light
- 📱 Design responsivo
- 🔒 Rotas protegidas
- ⚡ Performance otimizada com lazy loading
- 🎯 Type-safe com Zod validation

## 🛠️ Stack Tecnológica

- **Frontend:** React 18 + Vite
- **Estilização:** TailwindCSS + shadcn/ui
- **Roteamento:** React Router 6
- **Backend:** Supabase
- **Gerenciamento de Estado:** React Context + TanStack Query
- **Formulários:** React Hook Form + Zod
- **Ícones:** Lucide React

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fleetflow.git

# Instale as dependências
cd fleetflow
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Execute as migrações no Supabase

# Inicie o servidor de desenvolvimento
npm run dev