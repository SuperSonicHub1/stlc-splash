import { describe, it } from "@std/testing/bdd"
import { Expr, Type } from "./ast.ts"
import { Context, evaluate, Value } from "./eval.ts"
import { Language, OurModule } from "./grammar.ts"
import { inspectValue, inspectType } from "./inspect.ts"
import { expect } from "@std/expect/expect"
import { solveTypes } from "./type.ts"

type SolveTypes = (expr: Expr, context?: Record<string, Type>) => Type
type Evaluate = (expr: Expr, context?: Context) => Value

function replIteration(code: string, solveTypes: SolveTypes | null, Language: OurModule, evaluate: Evaluate): string {
    const parseResult = Language.Parse("Expr", code) as [Expr, string] | []
    if (parseResult.length === 0 || parseResult[1].trim().length > 0) {
        return "Syntax error" + (parseResult[1]?.length ?? 0 > 0 ? `: cannot match '...${parseResult[1]}'` : "")
    }
    const [ast] = parseResult
    let type: Type | null
    try {
        type = solveTypes?.(ast) ?? null
    } catch (e) {
        return "Type error: " + (e as Error).message
    }
    const value = evaluate(ast)

    return type != null ? `${inspectValue(value)} : ${inspectType(type)}` : `${inspectValue(value)}`
}

export async function repl(solveTypes: SolveTypes | null, Language: OurModule, evaluate: Evaluate) {
    while (true) {
        const code = prompt("> ")?.trim()
        if (code == null || code === "") break

        const result = replIteration(code, solveTypes, Language, evaluate)
        console.log(`> ${code}\n  = ${result}`)
    }

}

// describe("repl test", () => {
//     const repl_iter = (s: string) => replIteration(s, solveTypes, Language, evaluate)
//     // @impl
//     it("evaluates expressions", () => {
//         expect(repl_iter("2")).toBe("2 : int")
//         expect(repl_iter("add(1)(2)")).toBe("3 : int")
//         expect(repl_iter("true")).toBe("true : bool")
//     })
//     it("rejects syntax errors", () => {
//         expect(repl_iter("a;a;a;a;")).toMatch(/^Syntax error/)
//         expect(repl_iter("#,.>/?23r98 u23r98*&#* )&20 1e1o i;1")).toMatch(/^Syntax error/)
//         expect(repl_iter("")).toMatch(/^Syntax error/)
//     })
//     it("rejects type errors", () => {
//         expect(repl_iter("(x: int -> x)(true)")).toMatch(/^Type error/)
//     })
// })
