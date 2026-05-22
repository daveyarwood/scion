import {
  ADJECTIVES,
  GERUNDS,
  NOUNS,
  PLURAL_NOUNS,
  VERBS,
} from './titleWords'

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

type Template = () => string

const TEMPLATES: Template[] = [
  // "the [noun]"
  () => `the ${pick(NOUNS)}`,
  // "[adjective] [noun]"
  () => `${pick(ADJECTIVES)} ${pick(NOUNS)}`,
  // "[adjective] [plural noun]"
  () => `${pick(ADJECTIVES)} ${pick(PLURAL_NOUNS)}`,
  // "[adjective]"
  () => pick(ADJECTIVES),
  // "[noun]"
  () => pick(NOUNS),
  // "[plural noun]"
  () => pick(PLURAL_NOUNS),
  // "[-ing verb]"
  () => pick(GERUNDS),
  // "[verb] the [noun]"
  () => `${pick(VERBS)} the ${pick(NOUNS)}`,
  // "[verb] the [adjective] [noun]"
  () => `${pick(VERBS)} the ${pick(ADJECTIVES)} ${pick(NOUNS)}`,
  // "the [adjective] [noun]"
  () => `the ${pick(ADJECTIVES)} ${pick(NOUNS)}`,
  // "[noun] and [noun]"
  () => `${pick(NOUNS)} and ${pick(NOUNS)}`,
  // "[adjective] [noun] and [noun]"
  () => `${pick(ADJECTIVES)} ${pick(NOUNS)} and ${pick(NOUNS)}`,
  // "[gerund] [plural noun]"
  () => `${pick(GERUNDS)} ${pick(PLURAL_NOUNS)}`,
  // "[noun] of [plural noun]"
  () => `${pick(NOUNS)} of ${pick(PLURAL_NOUNS)}`,
  // "the [noun] and the [noun]"
  () => `the ${pick(NOUNS)} and the ${pick(NOUNS)}`,
  // "[plural noun] of the [noun]"
  () => `${pick(PLURAL_NOUNS)} of the ${pick(NOUNS)}`,
]

/** Generate a random song title. */
export const generateTitle = (): string => pick(TEMPLATES)()
