import { pipe } from "fp-ts/lib/function"
import * as Distortion from "./distortion"

test("DistortionFromID", () => {
  expect(
    pipe("all-or-nothing", Distortion.DistortionFromID.decode)
  ).toMatchObject({ right: { slug: "all-or-nothing" } })
  expect(pipe("bogus", Distortion.DistortionFromID.decode)).toMatchObject({
    left: expect.anything(),
  })
})

test("DistortionFromAny", () => {
  expect(
    pipe("all-or-nothing", Distortion.DistortionFromAny.decode)
  ).toMatchObject({ right: { slug: "all-or-nothing" } })
  expect(pipe("bogus", Distortion.DistortionFromAny.decode)).toMatchObject({
    left: expect.anything(),
  })
  expect(
    pipe(Distortion.legacyDistortions()[0], Distortion.DistortionFromAny.decode)
  ).toMatchObject({ right: { slug: "all-or-nothing" } })
  expect(
    pipe(
      { ...Distortion.legacyDistortions()[0], slug: "bogus" },
      Distortion.DistortionFromAny.decode
    )
  ).toMatchObject({ left: expect.anything() })
  expect(
    pipe({ slug: "all-or-nothing" }, Distortion.DistortionFromAny.decode)
  ).toMatchObject({ left: expect.anything() })
})
