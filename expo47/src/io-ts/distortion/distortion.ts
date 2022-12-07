import * as T from "io-ts"
import { Platform } from "react-native"
import i18n from "../../i18n"
import { snakeCase } from "lodash"
import * as Ord from "fp-ts/lib/Ord"
import * as S from "fp-ts/lib/string"

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const VERSION = "Distortion-v1"

export const Data = T.intersection(
  [
    T.type({
      v: T.literal(VERSION),
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

export const FromData = Data.pipe(
  new T.Type<Distortion, Data, Data>(
    "DistortionFromData",
    (val): val is Distortion => val instanceof Distortion,
    (data, c) => T.success(new Distortion(data)),
    (dis) => dis.data
  )
)

export const ord = Ord.contramap<string, Distortion>((d) => d.slug)(S.Ord)
