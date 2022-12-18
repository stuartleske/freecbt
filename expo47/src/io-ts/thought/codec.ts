import { Persist, Legacy, VERSION } from "./persist"
import { Thought } from "./thought"
import * as T from "io-ts"
import { pipe } from "fp-ts/lib/function"
import * as Distortion from "../distortion"

const FromPersist = Persist.pipe(Thought)

// encoding legacy-thoughts is still useful for testing
export const FromLegacy = Legacy.pipe(
  new T.Type(
    "ThoughtFromLegacy",
    Thought.is,
    // the distortion codec understands the legacy format, no need to transform them here
    (leg: Legacy, c) => Thought.validate({ ...leg, v: VERSION }, c),
    (dis: Thought): Legacy => ({
      ...FromPersist.encode(dis),
      v: undefined,
      cognitiveDistortions: pipe(
        dis.cognitiveDistortions,
        Array.from,
        T.array(Distortion.FromLegacy).encode
      ),
    })
  )
)

export const Codec: typeof FromPersist = new T.Type(
  "Thought.Codec",
  FromPersist.is,
  T.union([FromPersist, FromLegacy]).validate,
  FromPersist.encode
)

// no codec for a one-way conversion
export function toMarkdown(t: Thought): string {
  return `\
created: ${t.createdAt.toISOString()},
updated: ${t.updatedAt.toISOString()},
id: ${t.uuid}

# Automatic Thought

${t.automaticThought ? escapeMarkdown(t.automaticThought) : "🤷‍"}

# Cognitive Distortions

${
  t.cognitiveDistortions
    ? Array.from(t.cognitiveDistortions)
        .map((d) => `- ${d.label()}`)
        .sort()
        .join("\n")
    : "🤷‍"
}

# Challenge

${t.challenge ? escapeMarkdown(t.challenge) : "🤷‍"}

# Alternative Thought

${t.alternativeThought ? escapeMarkdown(t.alternativeThought) : "🤷‍"}

---
`
}
function escapeMarkdown(s: string): string {
  return s.replace(/([#_=`])/g, "\\$1").replace(/:FreeCBT:/g, "\\:FreeCBT\\:")
}
