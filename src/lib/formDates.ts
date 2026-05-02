/** Expiry date is valid through end of the chosen calendar day (local). */
export function isFormExpired(isoDate?: string): boolean {
  if (!isoDate) return false
  const end = new Date(`${isoDate}T23:59:59.999`)
  return Number.isNaN(end.getTime()) ? false : Date.now() > end.getTime()
}
