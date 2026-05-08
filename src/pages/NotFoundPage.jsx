import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-400">
          Página não encontrada
        </h2>
        <p className="mt-2 text-gray-500">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button
          onClick={() => navigate('/dashboard')}
          className="mt-6"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  )
}