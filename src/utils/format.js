export function formatMileage(km) {
  if (!km && km !== 0) return '0 km'
  return new Intl.NumberFormat('pt-BR').format(km) + ' km'
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}