import * as T from "io-ts"
import { Platform } from "react-native"
import i18n from "../i18n"
import { snakeCase, sortBy } from "lodash"
import * as Ord from "fp-ts/lib/Ord"
import * as S from "fp-ts/lib/string"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const VERSION = {
  LEGACY: "Distortion-v0",
  CURRENT: "Distortion-v1",
}

export const Data = T.intersection(
  [
    T.type({
      v: T.literal(VERSION.CURRENT),
      slug: ID,
      emoji: T.array(T.string),
    }),
    T.partial({
      labelKey: T.string,
      descriptionKey: T.string,
    }),
  ],
  "Distortion"
)
export type Data = T.TypeOf<typeof Data>

export class Distortion {
  constructor(public data: Data) {}

  get slug(): string {
    return this.data.slug
  }
  get labelKey(): string {
    return this.data.labelKey ?? snakeCase(this.slug)
  }
  get descriptionKey(): string {
    return this.data.descriptionKey ?? `${snakeCase(this.slug)}_one_liner`
  }
  label(): string {
    return i18n.t(this.labelKey)
  }
  description(): string {
    return i18n.t(this.descriptionKey)
  }
  emoji(): string {
    const [first, fallback] = this.data.emoji
    if (fallback == null) {
      return first
    }
    // I'm not saying iOS is better, but wider support for emojis is reaaallll nice
    if (Platform.OS === "ios") {
      return first
    }

    // update your phones people
    if ((Platform.Version as number) <= 23) {
      return fallback
    }

    return first
  }
}

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

export const DistortionFromData = Data.pipe(
  new T.Type<Distortion, Data, Data>(
    "DistortionFromData",
    (val): val is Distortion => val instanceof Distortion,
    (data, c) => T.success(new Distortion(data)),
    (dis) => dis.data
  )
)
export const DistortionFromID = T.string.pipe(
  new T.Type<Distortion, ID, ID>(
    "DistortionFromID",
    DistortionFromData.is,
    (id, c) =>
      id in bySlug
        ? T.success(bySlug[id])
        : T.failure("no such distortion-id", c),
    (dis) => dis.slug
  )
)
// encoding legacy-distortions is still useful for testing
export const DistortionFromLegacy = Legacy.pipe(
  new T.Type(
    "DistortionFromLegacy",
    DistortionFromData.is,
    (legacy: Legacy, c) => DistortionFromID.validate(legacy.slug, c),
    (dis: Distortion) => ({
      slug: dis.slug,
      emoji: dis.emoji(),
      label: dis.label(),
      description: dis.description(),
    })
  )
)
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
export const DistortionFromLegacyID: T.Type<Distortion, LegacyID> =
  IDFromLegacyID.pipe(DistortionFromID)

// This produces a working decoder - it can decode both ID and Legacy.
// The type is wrong, though! It indicates we might encode a Legacy, even though we never actually do.
// export const Codec = T.union([DistortionFromID, DistortionFromLegacy])

export const Codec: typeof DistortionFromID = new T.Type(
  "Distortion",
  DistortionFromData.is,
  T.union([DistortionFromID, DistortionFromLegacyID]).validate,
  DistortionFromID.encode
)

export function sortedList(): Distortion[] {
  return sortBy(list, (d) => d.label().toUpperCase())
}
export function legacyDistortions(): Legacy[] {
  return sortedList().map(DistortionFromLegacy.encode)
}

export const ord = Ord.contramap<string, Distortion>((d) => d.slug)(S.Ord)

// hardcoded distortion data

export const list: Distortion[] = [
  {
    slug: "all-or-nothing",
    emoji: ["🌓"],
    labelKey: "all_or_nothing_thinking",
    descriptionKey: "all_or_nothing_thinking_one_liner",
  },
  {
    slug: "overgeneralization",
    emoji: ["👯‍"],
    labelKey: "over_generalization",
  },
  {
    slug: "mind-reading",
    emoji: ["🧠", "💭"],
  },
  {
    slug: "fortune-telling",
    emoji: ["🔮"],
  },
  {
    slug: "magnification-of-the-negative",
    emoji: ["👎"],
  },
  {
    slug: "minimization-of-the-positive",
    emoji: ["👍"],
  },
  {
    slug: "catastrophizing",
    emoji: ["🤯", "💥"],
  },
  {
    slug: "emotional-reasoning",
    emoji: ["🎭"],
  },
  {
    slug: "should-statements",
    emoji: ["✨"],
  },
  {
    slug: "labeling",
    emoji: ["🏷", "🍙"],
  },
  {
    slug: "self-blaming",
    emoji: ["👁", "🚷"],
  },
  {
    slug: "other-blaming",
    emoji: ["🧛‍", "👺"],
  },
].map((d) => new Distortion({ ...d, v: VERSION.CURRENT }))

export const bySlug = Object.fromEntries(list.map((d) => [d.slug, d]))
