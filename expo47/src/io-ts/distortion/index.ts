export { Distortion, ID, ord } from './distortion'
export { Legacy, LegacyID } from './legacy'
export { default as list } from './data'
export { bySlug, FromLegacy, Codec } from './codec'

import { Distortion } from './distortion'
import { Legacy } from './legacy'
import { FromLegacy } from './codec'
import list from './data'
import { sortBy } from 'lodash'

export function sortedList(): Distortion[] {
    return sortBy(list, (d) => d.label().toUpperCase())
}

export function legacyDistortions(): Legacy[] {
    return sortedList().map(FromLegacy.encode)
}
