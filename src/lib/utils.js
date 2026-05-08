import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes CSS condicionalmente com suporte a Tailwind
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data ISO para exibição
 */
export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Gera um UUID v4
 */
export function generateUUID() {
  return crypto.randomUUID()
}

/**
 * Delay assíncrono
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
export function capitalizeWords(text) {
  return text.replace(/\b\w/g, char => char.toUpperCase())
}