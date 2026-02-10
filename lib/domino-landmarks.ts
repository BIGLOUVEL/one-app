export interface DominoLandmark {
  number: number
  heightCm: number
  heightLabel: string
  name: string
  icon: string
  description: string
}

// Progression géométrique ×1.5 depuis un domino de 5cm
// Source: "The ONE Thing" - Gary Keller
export const DOMINO_LANDMARKS: DominoLandmark[] = [
  { number: 1,  heightCm: 5,              heightLabel: "5 cm",         name: "Premier domino",   icon: "Dot",          description: "La pièce de départ" },
  { number: 6,  heightCm: 25,             heightLabel: "25 cm",        name: "Une règle",        icon: "Ruler",        description: "La taille d'une règle" },
  { number: 10, heightCm: 100,            heightLabel: "1 m",          name: "Un enfant",        icon: "Baby",         description: "La taille d'un enfant" },
  { number: 13, heightCm: 300,            heightLabel: "3 m",          name: "Un arbre",         icon: "TreePine",     description: "Aussi haut qu'un arbre" },
  { number: 18, heightCm: 5600,           heightLabel: "56 m",         name: "Tour de Pise",     icon: "Building",     description: "La Tour de Pise" },
  { number: 23, heightCm: 33000,          heightLabel: "330 m",        name: "Tour Eiffel",      icon: "Landmark",     description: "La Tour Eiffel" },
  { number: 27, heightCm: 240000,         heightLabel: "2.4 km",       name: "Une montagne",     icon: "Mountain",     description: "Une montagne" },
  { number: 31, heightCm: 1180000,        heightLabel: "11.8 km",      name: "Mont Everest",     icon: "MountainSnow", description: "Plus haut que l'Everest" },
  { number: 35, heightCm: 8900000,        heightLabel: "89 km",        name: "Bord de l'espace", icon: "Rocket",       description: "La frontière de l'espace" },
  { number: 40, heightCm: 285000000,      heightLabel: "2 850 km",     name: "Diamètre Lune",    icon: "Moon",         description: "Le diamètre de la Lune" },
  { number: 57, heightCm: 38440000000,    heightLabel: "384 400 km",   name: "Terre → Lune",     icon: "Orbit",        description: "De la Terre à la Lune" },
]

export const DOMINO_GROWTH_FACTOR = 1.5

export function getDominoLandmarkProgress(completedDominos: number) {
  const reached = DOMINO_LANDMARKS.filter(l => completedDominos >= l.number)
  const current = reached.length > 0 ? reached[reached.length - 1] : null
  const next = DOMINO_LANDMARKS.find(l => completedDominos < l.number) || null
  return { reached, current, next }
}
