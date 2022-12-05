import * as T from 'io-ts'

export const ID = T.string
export type ID = T.TypeOf<typeof ID>

export const Data = T.intersection([T.type({
    slug: T.string,
    emoji: T.array(T.string),
}), T.partial({
    labelKey: T.string,
    descriptionKey: T.string,
})], 'Distortion')
export type Data = T.TypeOf<typeof Data>

/**
 * old-style distortions. These are persisted in user data, so we must maintain decode support forever
 */
export const Legacy = T.intersection([T.type({
    slug: ID,
    label: T.string,
    description: T.string,
}), T.partial({
    emoji: T.union([T.string, T.array(T.string)]),
    selected: T.boolean,
})], 'Distortion.Legacy')
export type Legacy = T.TypeOf<typeof Legacy>