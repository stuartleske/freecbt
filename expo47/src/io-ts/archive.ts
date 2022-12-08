import * as T from "io-ts"
import * as Thought from "./thought"

const VERSION = "Archive-v1"

export const Archive = T.type(
  {
    v: T.literal(VERSION),
    thoughts: T.array(Thought.Persist),
  },
  "Archive"
)
export type Archive = T.TypeOf<typeof Archive>

export function create(thoughts: Thought.Persist[]): Archive {
  return { v: VERSION, thoughts }
}
