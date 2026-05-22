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
const pickNoun = () => (Math.random() < 0.5 ? pick(NOUNS) : pick(COMMON_NOUNS))
const pickPluralNoun = () => (Math.random() < 0.5 ? pick(PLURAL_NOUNS) : pick(COMMON_PLURAL_NOUNS))
const pickAdj = () => (Math.random() < 0.5 ? pick(ADJECTIVES) : pick(COMMON_ADJECTIVES))
const pickVerb = () => (Math.random() < 0.5 ? pick(VERBS) : pick(COMMON_VERBS))
const pickGerund = () => (Math.random() < 0.5 ? pick(GERUNDS) : pick(COMMON_GERUNDS))

const pickNumber = () => pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 17, 33, 100])

type Template = () => string

/** Short templates safe to use inside recursive slots. */
const SHORT_TEMPLATES: Template[] = [
  () => pickNoun(),
  () => pickVerb(),
  () => pickGerund(),
  () => pickAdj(),
  () => `the ${pickNoun()}`,
  () => `${pickNoun()} and ${pickNoun()}`,
  () => `${pickPluralNoun()} and ${pickPluralNoun()}`,
  () => `${pickVerb()} and ${pickVerb()}`,
  () => `${pickAdj()} ${pickNoun()}`,
  () => `${pickAdj()} ${pickPluralNoun()}`,
  () => `the ${pickAdj()} ${pickNoun()}`,
]

/** Exclamation templates. */
const EXCLAMATION_TEMPLATES: Template[] = [() => `${pickNoun()}!`, () => `${pickVerb()}!`]

const short = () => (Math.random() < 0.15 ? pick(EXCLAMATION_TEMPLATES)() : pick(SHORT_TEMPLATES)())

/** Long (non-recursive) templates. */
const LONG_TEMPLATES: Template[] = [
  () => `${pickAdj()} ${pickPluralNoun()}`,
  () => `${pickVerb()} the ${pickNoun()}`,
  () => `${pickVerb()} the ${pickAdj()} ${pickNoun()}`,
  () => `the ${pickAdj()} ${pickNoun()}`,
  () => `${pickNoun()} and ${pickNoun()}`,
  () => `${pickPluralNoun()} and ${pickPluralNoun()}`,
  () => `${pickGerund()} ${pickPluralNoun()}`,
  () => `${pickNoun()} of ${pickPluralNoun()}`,
  () => `the ${pickNoun()} and the ${pickNoun()}`,
  () => `${pickPluralNoun()} of the ${pickNoun()}`,
  () => `${pickVerb()} and ${pickVerb()}`,
  () => `${pickVerb()}, ${pickVerb()}, ${pickVerb()}`,
  () => `${pickAdj()} ${pickNoun()}, ${pickAdj()} ${pickNoun()}`,
  () => `${pickNumber()} ${pickPluralNoun()}`,
  () => `this ${pickNoun()}`,
  () => `that ${pickNoun()}`,
  () => `${pickNoun()} vs. ${pickNoun()}`,
  () => `so ${pickAdj()}`,
  () => `my ${pickNoun()}`,
]

/** Recursive templates using slashes and parentheses. */
const RECURSIVE_TEMPLATES: Template[] = [
  () => `${short()} / ${short()}`,
  () => `${short()} (${short()})`,
  () => `(${short()}) ${short()}`,
  () => `${short()} (pt. 1)`,
]

/**
 * Generate a random song title.
 * Weighted across tiers: short ~55%, long ~30%, recursive ~10%, exclamation ~5%
 */
export const generateTitle = (): string => {
  const r = Math.random()
  if (r < 0.55) return pick(SHORT_TEMPLATES)()
  if (r < 0.85) return pick(LONG_TEMPLATES)()
  if (r < 0.95) return pick(RECURSIVE_TEMPLATES)()
  return pick(EXCLAMATION_TEMPLATES)()
}
