import { z } from 'zod'

// Schemas de validação com Zod
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa'),
})

export const vehicleSchema = z.object({
  plate: z
    .string()
    .min(1, 'Placa é obrigatória')
    .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Formato de placa inválido'),
  brand: z
    .string()
    .min(1, 'Marca é obrigatória')
    .min(2, 'Marca deve ter pelo menos 2 caracteres'),
  model: z
    .string()
    .min(1, 'Modelo é obrigatório')
    .min(2, 'Modelo deve ter pelo menos 2 caracteres'),
  year: z
    .number()
    .int()
    .min(1900, 'Ano muito antigo')
    .max(new Date().getFullYear() + 1, 'Ano futuro'),
  fuel_type: z.enum([
    'gasoline',
    'diesel',
    'flex',
    'electric',
    'hybrid',
  ]),
  mileage: z
    .number()
    .min(0, 'Quilometragem não pode ser negativa'),
  status: z.enum([
    'active',
    'maintenance',
    'inactive',
    'sold',
  ]).default('active'),
  color: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export const registrationSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
  fullName: z.string().min(3, 'Nome muito curto'),
  companyName: z.string().min(2, 'Nome da empresa muito curto'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})