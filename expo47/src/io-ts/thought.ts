import * as T from "io-ts"
import { setFromArray, DateFromISOString } from "io-ts-types"
import * as Distortion from "./distortion"
import { Ord as StringOrd } from "fp-ts/lib/string"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const VERSION = {
  LEGACY: 0,
  CURRENT: 1,
}

export const Data = T.type(
  {
    v: T.literal(VERSION.CURRENT),
    automaticThought: T.string,
    alternativeThought: T.string,
    cognitiveDistortions: setFromArray(Distortion.ID, StringOrd),
    challenge: T.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    uuid: ID,
  },
  "Thought"
)
export type Data = T.TypeOf<typeof Data>

/**
 * old-style thoughts. These are persisted in user data, so we must maintain decode support forever
 */
export const Legacy = T.type(
  {
    automaticThought: T.string,
    alternativeThought: T.string,
    cognitiveDistortions: T.array(
      T.union([Distortion.ID, T.type({ slug: Distortion.ID })])
    ),
    challenge: T.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    uuid: ID,
  },
  "Thought.Legacy"
)
export type Legacy = T.TypeOf<typeof Legacy>
