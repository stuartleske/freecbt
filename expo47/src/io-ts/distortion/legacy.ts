import * as T from "io-ts"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const VERSION = undefined

/**
 * old-style distortions. These are persisted in user data, so we must maintain decode support forever
 */
export const Legacy = T.intersection(
  [
    T.type({
      slug: ID,
      label: T.string,
      description: T.string,
    }),
    T.partial({
      v: T.undefined,
      emoji: T.union([T.string, T.array(T.string)]),
      selected: T.boolean,
    }),
  ],
  "Distortion.Legacy"
)
export type Legacy = T.TypeOf<typeof Legacy>

export const LegacyID = T.type({ slug: ID })
export type LegacyID = T.TypeOf<typeof LegacyID>
export const IDFromLegacyID: T.Type<ID, LegacyID> = LegacyID.pipe(
  new T.Type(
    "IDFromLegacyID",
    ID.is,
    (legacy: LegacyID, c) => T.success(legacy.slug),
    (slug) => ({ slug })
  )
)