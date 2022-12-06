import { pipe } from "fp-ts/lib/function"
import * as T from "io-ts"
import { setFromArray, DateFromISOString } from "io-ts-types"
import * as Distortion from "./distortion"
import { v4 as uuidv4 } from "uuid"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const VERSION = {
  LEGACY: "Thought-v0",
  CURRENT: "Thought-v1",
}

export const Data = T.type(
  {
    v: T.literal(VERSION.CURRENT),
    automaticThought: T.string,
    alternativeThought: T.string,
    cognitiveDistortions: setFromArray(Distortion.Codec, Distortion.ord),
    challenge: T.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    uuid: ID,
  },
  "Thought"
)
export type Data = T.TypeOf<typeof Data>
export type Thought = Data

// our json-formatted thought data, as persisted to disk
export const Persist = T.type(
  {
    v: T.literal(VERSION.CURRENT),
    automaticThought: T.string,
    alternativeThought: T.string,
    cognitiveDistortions: T.array(T.string),
    challenge: T.string,
    createdAt: T.string,
    updatedAt: T.string,
    uuid: T.string,
  },
  "Thought.Persist"
)
export type Persist = T.TypeOf<typeof Persist>

/**
 * old-style thoughts, as json
 * These were persisted in user data, so we must maintain decode support forever
 */
export const Legacy = T.intersection(
  [
    T.type({
      automaticThought: T.string,
      alternativeThought: T.string,
      cognitiveDistortions: T.array(Distortion.LegacyID),
      challenge: T.string,
      createdAt: T.string,
      updatedAt: T.string,
      uuid: T.string,
    }),
    T.partial({ v: T.undefined }),
  ],
  "Thought.Legacy"
)
export type Legacy = T.TypeOf<typeof Legacy>

const DataFromPersist = Persist.pipe(Data)
// encoding legacy-thoughts is still useful for testing
export const DataFromLegacy = Legacy.pipe(
  new T.Type(
    "ThoughtFromLegacy",
    Data.is,
    // the distortion codec understands the legacy format, no need to transform them here
    (leg: Legacy, c) => Data.validate({ ...leg, v: VERSION.CURRENT }, c),
    (dis: Data): Legacy => ({
      ...DataFromPersist.encode(dis),
      v: undefined,
      cognitiveDistortions: pipe(
        dis.cognitiveDistortions,
        Array.from,
        T.array(Distortion.DistortionFromLegacy).encode
      ),
    })
  )
)

export const Codec: typeof DataFromPersist = new T.Type(
  "Thought.Codec",
  DataFromPersist.is,
  T.union([DataFromPersist, DataFromLegacy]).validate,
  DataFromPersist.encode
)

export interface CreateArgs {
  automaticThought: string
  alternativeThought: string
  cognitiveDistortions: Iterable<Distortion.Distortion | string>
  challenge: string
}
export const THOUGHTS_KEY_PREFIX = `@Quirk:thoughts:`
export function getThoughtKey(info: string): string {
  return `${THOUGHTS_KEY_PREFIX}${info}`
}

export function create(args: CreateArgs): Data {
  const cognitiveDistortions = new Set(
    Array.from(args.cognitiveDistortions).map((name) => {
      const d = typeof name === "string" ? Distortion.bySlug[name] : name
      if (!d) {
        throw new Error(`no such distortion: ${name}`)
      }
      return d
    })
  )
  return {
    ...args,
    cognitiveDistortions,
    uuid: getThoughtKey(uuidv4()),
    createdAt: new Date(),
    updatedAt: new Date(),
    v: VERSION.CURRENT,
  }
}
