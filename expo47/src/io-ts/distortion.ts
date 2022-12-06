import * as T from "io-ts"
import { Platform } from "react-native"
import i18n from "../i18n"
import { snakeCase, sortBy } from "lodash"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

const DataT = "Distortion"

export const Data = T.intersection(
  [
    T.type({
      type: T.literal(DataT),
      slug: ID,
      emoji: T.array(T.string),
    }),
    T.partial({
      labelKey: T.string,
      descriptionKey: T.string,
    }),
  ],
  DataT
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
export const DistortionFromLegacy = Legacy.pipe(
  new T.Type<Distortion, Legacy, Legacy>(
    "DistortionFromLegacy",
    DistortionFromData.is,
    (legacy, c) => DistortionFromID.validate(legacy.slug, c),
    (dis) => ({
      slug: dis.slug,
      emoji: dis.emoji(),
      label: dis.label(),
      description: dis.description(),
    })
  )
)

export const DistortionFromAny = T.union([
  DistortionFromID,
  DistortionFromLegacy,
])

export function sortedList(): Distortion[] {
  return sortBy(list, (d) => d.label().toUpperCase())
}
export function legacyDistortions(): Legacy[] {
  return sortedList().map(DistortionFromLegacy.encode)
}

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
].map((d) => new Distortion({ ...d, type: DataT }))

const bySlug = Object.fromEntries(list.map((d) => [d.slug, d]))
