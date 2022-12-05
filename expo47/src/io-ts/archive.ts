import * as T from 'io-ts'
import * as Thought from './thought'

const CURRENT_VERSION = 1

export const Data = T.type({
    v: T.literal(CURRENT_VERSION),
    thoughts: T.array(Thought.Data),
}, 'Archive')
export type Data = T.TypeOf<typeof Data>