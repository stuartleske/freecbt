import * as Distortion from "./distortion"
import * as Thought from "./thought"
import * as E from "fp-ts/lib/Either"
import { PathReporter } from "io-ts/lib/PathReporter"

test("thought from persist", () => {
  const thought: Thought.Thought = Thought.create({
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "chal",
    cognitiveDistortions: ["all-or-nothing"],
  })
  const persist: Thought.Persist = {
    ...thought,
    cognitiveDistortions: ["all-or-nothing"],
    createdAt: thought.createdAt.toISOString(),
    updatedAt: thought.updatedAt.toISOString(),
  }
  expect(Thought.Codec.encode(thought)).toEqual(persist)
  expect(Thought.Codec.decode(persist)).toEqual(E.right(thought))
  expect(Thought.Codec.decode(Thought.Codec.encode(thought))).toEqual(
    E.right(thought)
  )
  expect(
    Thought.Codec.decode({ ...persist, cognitiveDistortions: ["bogus"] })
  ).toEqual(E.left(expect.anything()))
  expect(Thought.Codec.decode({ ...persist, createdAt: "not a date" })).toEqual(
    E.left(expect.anything())
  )
  expect(Thought.Codec.decode({ ...persist, createdAt: 12345 })).toEqual(
    E.left(expect.anything())
  )
})

test("thought from legacy", () => {
  const thought: Thought.Thought = Thought.create({
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "chal",
    cognitiveDistortions: ["all-or-nothing"],
  })
  const legacy: Thought.Legacy = {
    uuid: thought.uuid,
    automaticThought: "auto",
    alternativeThought: "alt",
    challenge: "chal",
    cognitiveDistortions: [
      Distortion.DistortionFromLegacy.encode(
        Distortion.bySlug["all-or-nothing"]
      ) as Distortion.Legacy,
    ],
    createdAt: thought.createdAt.toISOString(),
    updatedAt: thought.updatedAt.toISOString(),
  }
  const minLegacy: Thought.Legacy = {
    ...legacy,
    cognitiveDistortions: [{ slug: "all-or-nothing" }],
  }
  expect("v" in legacy).toBeFalsy()
  expect("v" in minLegacy).toBeFalsy()
  expect(Thought.Codec.decode(minLegacy)).toEqual(E.right(thought))
  expect(Thought.Codec.decode(legacy)).toEqual(E.right(thought))
  expect(Thought.Codec.decode({ ...minLegacy, v: undefined })).toEqual(
    E.right(thought)
  )
  expect(Thought.Codec.decode({ ...legacy, v: undefined })).toEqual(
    E.right(thought)
  )

  // we can transform modern thoughts to the legacy format - DebugScreen uses this
  expect(Thought.DataFromLegacy.encode(thought)).toEqual(legacy)
  expect(Thought.DataFromLegacy.decode(minLegacy)).toEqual(E.right(thought))
  expect(Thought.DataFromLegacy.decode(legacy)).toEqual(E.right(thought))

  expect(Thought.DataFromLegacy.decode(minLegacy)).toEqual(
    Thought.Codec.decode(minLegacy)
  )
  expect(Thought.DataFromLegacy.decode(legacy)).toEqual(
    Thought.Codec.decode(legacy)
  )

  // The main codec always encodes Thoughts as Persist, the modern format -
  // despite knowing how to decode Legacy thoughts - and the types agree
  const _: Thought.Persist = Thought.Codec.encode(thought)
  // @ts-expect-error
  const __: Thought.Legacy = Thought.Codec.encode(thought)
})
