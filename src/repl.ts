import { Expr, Type } from "./ast.ts";
import { Context, evaluate, Value } from "./eval.ts";
import { OurModule } from "./grammar.ts";
import { inspectValue, inspectType } from "./inspect.ts";

type SolveTypes = (expr: Expr, context?: Record<string, Type>) => Type
type Evaluate = (expr: Expr, context?: Context) => Value

function replIteration(code: string, solveTypes: SolveTypes, Language: OurModule, evaluate: Evaluate): string {
    const parseResult = Language.Parse("Expr", code) as [Expr, string] | []
    if (parseResult.length === 0 || parseResult[1].trim().length > 0) {
        return "Syntax error" + (parseResult[1]?.length ?? 0 > 0 ? `: cannot match '...${parseResult[1]}'` : "")
    }
    const [ast] = parseResult
    let type: Type
    try {
        type = solveTypes(ast)
    } catch (e) {
        return "Type error: " + (e as Error).message
    }
    const value = evaluate(ast)

    return `${inspectValue(value)} : ${inspectType(type)}`
}

export async function repl(solveTypes: SolveTypes, Language: OurModule, evaluate: Evaluate) {
    while (true) {
        const code = prompt("> ")?.trim()
        if (code == null || code === "") break

        const result = replIteration(code, solveTypes, Language, evaluate)

        await Deno.jupyter.broadcast("display_data", {
            data: { "text/plain": `> ${code}\n  = ${result}` },
            metadata: {},
            transient: { display_id: "progress" }
        })
    }

}