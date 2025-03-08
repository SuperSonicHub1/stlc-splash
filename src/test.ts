import { describe, it } from "@std/testing/bdd"
import { Language } from "./grammar.ts"
import { Expr, Type } from "./ast.ts"
import { evaluate } from "./eval.ts"
import { expect } from "@std/expect"
import { solveTypes } from "./type.ts"

describe("integration test of parse-eval", () => {
    const parse = (code: string) => Language.Parse("Expr", code) as [Expr, string] | []
    const parse_eval = (code: string) => {
        const parsed = parse(code)
        return parsed.length === 2 ? evaluate(parsed[0]) : null
    }
    it("can do basic arithmetic and logic evaluation", () => {
        const nums = [1, 2, 3, 4, 5, 6, 7, 43, 134, -123, -2, 3]
        for (const a of nums) {
            expect(parse_eval(`odd(${a})`)).toStrictEqual(parse_eval(`${a % 2 === 1}`))
            expect(parse_eval(`even(${a})`)).toStrictEqual(parse_eval(`${a % 2 === 0}`))
            expect(parse_eval(`neg(${a})`)).toStrictEqual(parse_eval(`${-a}`))
            for (const b of nums) {
                expect(parse_eval(`add(${a})(${b})`)).toStrictEqual(parse_eval(`${a + b}`))
                expect(parse_eval(`sub(${a})(${b})`)).toStrictEqual(parse_eval(`${a - b}`))
                expect(parse_eval(`mul(${a})(${b})`)).toStrictEqual(parse_eval(`${a * b}`))
                expect(parse_eval(`eq(${a})(${b})`)).toStrictEqual(parse_eval(`${a === b}`))
                expect(parse_eval(`greater(${a})(${b})`)).toStrictEqual(parse_eval(`${a > b}`))
                expect(parse_eval(`less(${a})(${b})`)).toStrictEqual(parse_eval(`${a < b}`))
            }
        }
        const bools = [false, true]
        for (const a of bools) {
            expect(parse_eval(`not(${a})`)).toStrictEqual(parse_eval(`${!a}`))
            for (const b of bools) {
                expect(parse_eval(`and(${a})(${b})`)).toStrictEqual(parse_eval(`${a && b}`))
                expect(parse_eval(`nand(${a})(${b})`)).toStrictEqual(parse_eval(`${!(a && b)}`))
                expect(parse_eval(`or(${a})(${b})`)).toStrictEqual(parse_eval(`${a || b}`))
                expect(parse_eval(`nor(${a})(${b})`)).toStrictEqual(parse_eval(`${!(a || b)}`))
                expect(parse_eval(`xor(${a})(${b})`)).toStrictEqual(parse_eval(`${a !== b}`))
                expect(parse_eval(`xnor(${a})(${b})`)).toStrictEqual(parse_eval(`${a === b}`))
            }
        }
    })
    it("can call lambdas", () => {
        [1, 3, 4, -53, 42, 0].forEach(x => {
            expect(parse_eval(`(x: int -> mul(x)(x))(${x})`)).toStrictEqual(parse_eval(`${x ** 2}`))
        })
    })
    // @impl
    it("fails when non-function value is called", () => {
        expect(() => parse_eval("1(1)")).toThrow()
        expect(() => parse_eval("392(1)")).toThrow()
        expect(() => parse_eval("true(1)")).toThrow()
        expect(() => parse_eval("false(1)")).toThrow()
    })
    it("correctly processes ternaries", () => {
        const bools = [false, true]
        for (const a of bools) {
            expect(parse_eval(`if ${a} then 1 else 2`)).toStrictEqual(parse_eval(a ? "1" : "2"))
        }
    })
    it("fails when non-boolean conditions are passed to ternaries", () => {
        const not_bools = ["1", "a: int -> 2"]
        for (const a of not_bools) {
            expect(() => parse_eval(`if ${a} then 1 else 2`)).toThrow()
        }
    })
    // @impl
    it("fails when variable is undefined", () => {
        expect(() => parse_eval("x:int -> x")).not.toThrow()
        expect(() => parse_eval("x")).toThrow()
    })
    // @impl
    it("can do let", () => {
        expect(parse_eval("let x = 3 in x")).toStrictEqual(parse_eval("3"))
        expect(parse_eval("let x = mul(4)(3) in add(x)(1)")).toStrictEqual(parse_eval("13"))
    })
})

describe("integration test of parse-typecheck", () => {
    const parse = (code: string) => Language.Parse("Expr", code) as [Expr, string] | []
    const type = (code: string) => (Language.Parse("Ty", code) as [Type, string] | [])[0] ?? (() => { throw new Error() })()
    const parse_typecheck = (code: string) => {
        const parsed = parse(code)
        return parsed.length === 2 ? solveTypes(parsed[0]) : null
    }
    // @impl
    it("can solve types of simple expressions", () => {
        expect(parse_typecheck("1234")).toStrictEqual(type("int"))
        expect(parse_typecheck("true")).toStrictEqual(type("bool"))
        expect(parse_typecheck("odd")).toStrictEqual(type("fn[int, bool]"))
        expect(parse_typecheck("x: int -> true")).toStrictEqual(type("fn[int, bool]"))
        expect(parse_typecheck("x: int -> x")).toStrictEqual(type("fn[int, int]"))
        expect(() => parse_typecheck("x: int -> y")).toThrow()
    })
    it("can solve types of calling abstractions", () => {
        expect(parse_typecheck("odd(0)")).toStrictEqual(type("bool"))
        expect(parse_typecheck("not(true)")).toStrictEqual(type("bool"))
        expect(() => parse_typecheck("odd(true)")).toThrow()
        expect(parse_typecheck("(x: int -> odd(x))(1)")).toStrictEqual(type("bool"))
        expect(() => parse_typecheck("(x: int -> odd(x))(false)")).toThrow()
        expect(() => parse_typecheck("0(0)")).toThrow()
    })
    it("can solve types of let expressions", () => {
        expect(parse_typecheck("let x = 1 in x")).toStrictEqual(type("int"))
        expect(parse_typecheck("let x: int = 1 in x")).toStrictEqual(type("int"))
        expect(() => parse_typecheck("let x: bool = 1 in x")).toThrow()
        expect(parse_typecheck("let x = odd in x(1)")).toStrictEqual(type("bool"))
    })
    it("can solve types of ternary expressions", () => {
        expect(parse_typecheck("if odd(1) then 1 else 2")).toStrictEqual(type("int"))
        expect(() => parse_typecheck("if true then (x: int -> 2) else 2")).toThrow()
        expect(() => parse_typecheck("if true then (x: int -> 2) else (x: bool -> 2)")).toThrow()
        expect(() => parse_typecheck("if true then (x: int -> 2) else (x: int -> true)")).toThrow()
        expect(() => parse_typecheck("if 3 then 1 else 2")).toThrow()
    })
})
