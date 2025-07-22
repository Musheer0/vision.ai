// Array of gradient combinations
export const gradientCombinations = [
  "from-rose-500 to-indigo-700",
  "from-emerald-500 to-blue-700",
  "from-violet-500 to-amber-700",
  "from-cyan-500 to-pink-700",
  "from-fuchsia-500 to-yellow-700",
  "from-purple-500 to-green-700",
  "from-blue-500 to-red-700",
  "from-teal-500 to-purple-700",
]

/**
 * Returns a random gradient combination from the predefined list
 */
export function getRandomGradient(): string {
  const randomIndex = Math.floor(Math.random() * gradientCombinations.length)
  return gradientCombinations[randomIndex]
}
