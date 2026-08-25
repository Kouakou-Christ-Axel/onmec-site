/**
 * Formate un entier avec un espace tous les trois chiffres (« 1 840 »), à la française.
 * N'utilise pas `toLocaleString("fr-FR")` : sur workerd, l'ICU peut être réduit et fait
 * silencieusement retomber le formatage sur des virgules (« 1,840 »).
 */
export function formatCount(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
