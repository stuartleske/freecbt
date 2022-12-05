import * as Data from './distortion'
import * as T from 'io-ts'
import * as TT from 'io-ts-types'
import * as E from 'fp-ts/lib/Either'
import { PathReporter as Reporter } from 'io-ts/lib/PathReporter'
import { pipe } from 'fp-ts/lib/function'

test('encode', () => {
    // encode/decode work as expected
    expect(TT.DateFromNumber.decode(12345)).toEqual(E.right(new Date(12345)))
    expect(TT.DateFromNumber.decode("12345")).toMatchObject({ _tag: 'Left' })
    expect(TT.DateFromNumber.encode(new Date(12345))).toEqual(12345)
    // mapOutput doesn't achieve what I thought it would. not bidirectional...
    expect(TT.mapOutput(TT.DateFromNumber, d => "" + d).encode(new Date(12345))).toEqual("12345")
    expect(TT.mapOutput(TT.DateFromNumber, d => "" + d).decode(12345)).toEqual(E.right(new Date(12345)))
    // pipe links two codecs together!
    expect(TT.NumberFromString.pipe(TT.DateFromNumber).encode(new Date(12345))).toEqual("12345")
    expect(TT.NumberFromString.pipe(TT.DateFromNumber).decode("12345")).toEqual(E.right(new Date(12345)))
    expect(Reporter.report(TT.NumberFromString.pipe(TT.DateFromNumber, "testpipe").decode(12345))).toEqual(["Invalid value 12345 supplied to : testpipe"])
    // wrong pipe order is a typecheck fail
    // expect(TT.DateFromNumber.pipe(TT.NumberFromString).decode("12345")).toEqual(E.right(new Date(12345)))

    // trying out pipe
    expect(pipe(1, E.right, E.map(n => n + 1))).toEqual(E.right(2))
    // trying out a class codec
    class C {
        constructor(public val: number) { }
    }
    // based on https://github.com/gcanti/io-ts-types/blob/master/src/DateFromNumber.ts
    const CFromNumber = new T.Type<C, number>(
        'CFromNumber',
        (value): value is C => value instanceof C,
        (input, c) => pipe(T.number.validate(input, c), E.map(n => new C(n))),
        output => output.val,
    )
    expect(CFromNumber.decode(3)).toEqual(E.right(new C(3)))
    expect(Reporter.report(CFromNumber.decode("3"))).toEqual(["Invalid value \"3\" supplied to : CFromNumber"])
    expect(CFromNumber.encode(new C(3))).toEqual(3)
})