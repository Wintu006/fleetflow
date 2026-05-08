import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Loader2 } from 'lucide-react'

export function LoginForm({ onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-fleet-500 focus:ring-fleet-500"
            disabled={loading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-400 animate-fadeIn">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-gray-300">
            Senha
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-fleet-500 focus:ring-fleet-500"
            disabled={loading}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-400 animate-fadeIn">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Botão */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-fleet-500 to-fleet-600 hover:from-fleet-600 hover:to-fleet-700 text-white font-medium shadow-lg shadow-fleet-500/25 transition-all duration-300"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}