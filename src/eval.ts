import { Expr, ExprType } from "./ast.ts";
import { CORE_VALUES } from "./core.ts";
import { inspectExpr } from "./inspect.ts";
import { InspectOutput } from "./notebook.ts";

export type Value = number | boolean | ((v: Value) => Value)

export function evaluate(expr: Expr, context: Record<string, Value> = CORE_VALUES): Value {
    switch (expr.type) {
        case ExprType.Application: {
            const lambda = evaluate(expr.lambda, context)
            const argument = evaluate(expr.argument, context)
            if (!(lambda instanceof Function)) {
                throw new Error("Runtime eval error: cannot call type " + typeof lambda)
            }
            return lambda(argument)
        }
        case ExprType.Abstraction: {
            const binding = expr.binding
            const body = expr.body
            const result = (arg: Value) => evaluate(body, { ...context, [binding.name]: arg })
            result.toString = () => `(${binding.name} -> ${inspectExpr(body, InspectOutput.Plain)})`
            return result
        }
        case ExprType.Let: {
            const boundValue = evaluate(expr.boundTo, context)
            return evaluate(expr.boundIn, { ...context, [expr.binding.name]: boundValue })
        }
        case ExprType.Var: {
            const value = context[expr.name]
            if (value == undefined) {
                throw new Error("Runtime eval error: variable `" + expr.name + "` not found")
            }
            return value
        }
        case ExprType.Ternary: {
            const condition = evaluate(expr.condition, context)
            if (typeof condition !== "boolean") {
                throw new Error("Runtime eval error: type " + (typeof condition) + " cannot be used as a condition")
            }
            return evaluate(condition ? expr.positive : expr.negative, context)
        }
        case ExprType.LiteralInt: {
            return expr.value
        }
        case ExprType.LiteralBool: {
            return expr.value
        }
    }
}
