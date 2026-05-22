import {
  ADJECTIVES,
  GERUNDS,
  NOUNS,
  PLURAL_NOUNS,
  VERBS,
  COMMON_ADJECTIVES,
  COMMON_GERUNDS,
  COMMON_NOUNS,
  COMMON_PLURAL_NOUNS,
  COMMON_VERBS,
} from './titleWords'

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/**
 * Pick from either the eclectic or common pool.
 * Roughly 50/50 blend — tweak weights here to adjust the mix.
 */
const pickNoun = () => Math.random() < 0.5 ? pick(NOUNS) : pick(COMMON_NOUNS)
const pickPluralNoun = () => Math.random() < 0.5 ? pick(PLURAL_NOUNS) : pick(COMMON_PLURAL_NOUNS)
const pickAdj = () => Math.random() < 0.5 ? pick(ADJECTIVES) : pick(COMMON_ADJECTIVES)
const pickVerb = () => Math.random() < 0.5 ? pick(VERBS) : pick(COMMON_VERBS)
const pickGerund = () => Math.random() < 0.5 ? pick(GERUNDS) : pick(COMMON_GERUNDS)

type Template = () => string

const TEMPLATES: Template[] = [
  // "the [noun]"
  () => `the ${pickNoun()}`,
  // "[adjective] [noun]"
  () => `${pickAdj()} ${pickNoun()}`,
  // "[adjective] [plural noun]"
  () => `${pickAdj()} ${pickPluralNoun()}`,
  // "[adjective]"
  () => pickAdj(),
  // "[noun]"
  () => pickNoun(),
  // "[plural noun]"
  () => pickPluralNoun(),
  // "[-ing verb]"
  () => pickGerund(),
  // "[verb] the [noun]"
  () => `${pickVerb()} the ${pickNoun()}`,
  // "[verb] the [adjective] [noun]"
  () => `${pickVerb()} the ${pickAdj()} ${pickNoun()}`,
  // "the [adjective] [noun]"
  () => `the ${pickAdj()} ${pickNoun()}`,
  // "[noun] and [noun]"
  () => `${pickNoun()} and ${pickNoun()}`,

  // "[gerund] [plural noun]"
  () => `${pickGerund()} ${pickPluralNoun()}`,
  // "[noun] of [plural noun]"
  () => `${pickNoun()} of ${pickPluralNoun()}`,
  // "the [noun] and the [noun]"
  () => `the ${pickNoun()} and the ${pickNoun()}`,
  // "[plural noun] of the [noun]"
  () => `${pickPluralNoun()} of the ${pickNoun()}`,
]

/** Generate a random song title. */
export const generateTitle = (): string => pick(TEMPLATES)()
