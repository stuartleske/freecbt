import * as Distortion from "./distortion"

test("DistortionFromID", () => {
  expect(Distortion.DistortionFromID.decode("all-or-nothing")).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  expect(Distortion.DistortionFromID.decode("bogus")).toMatchObject({
    left: expect.anything(),
  })
})

test("Codec decodes legacy and id", () => {
  expect(Distortion.Codec.decode("all-or-nothing")).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  expect(Distortion.Codec.decode("bogus")).toMatchObject({
    left: expect.anything(),
  })
  const legacy = Distortion.legacyDistortions()[0]
  expect(Distortion.Codec.decode(legacy)).toMatchObject({
    right: { slug: "all-or-nothing" },
  })
  expect(Distortion.Codec.decode({ ...legacy, slug: "bogus" })).toMatchObject({
    left: expect.anything(),
  })
  // I'm not 100% sure of the old format, so allow decoding just the legacy slug
  expect(Distortion.Codec.decode({ slug: "all-or-nothing" })).toMatchObject({
    right: { slug: "all-or-nothing" },
  })

  expect(Distortion.Codec.encode(Distortion.list[0])).toEqual(
    Distortion.list[0].slug
  )

  // We'll always encode Distortions as ids, and the codec's type agrees
  const _: string = Distortion.Codec.encode(Distortion.list[0])
  // @ts-expect-error
  const __: Distortion.Legacy = Distortion.Codec.encode(Distortion.list[0])
})
