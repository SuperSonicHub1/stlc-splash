import { Expr, ExprType } from "./ast.ts";

export type Value = number | boolean | ((v: Value) => Value)

export function evaluate(expr: Expr, context: Record<string, Value> = CORE_CONTEXT): Value {
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
            return arg => evaluate(body, { ...context, [binding.name]: arg })
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

const typename = (v: Value) => ({ number: "int", boolean: "bool", object: "fn" } as Record<string, string>)[typeof v]
const expectInt = (v: Value) => (typeof v === "number") ? v : (() => { throw new Error("Runtime eval error: expected type int found " + typename(v)) })()
const expectBool = (v: Value) => (typeof v === "boolean") ? v : (() => { throw new Error("Runtime eval error: expected type bool found " + typename(v)) })()

export const CORE_CONTEXT: Record<string, Value> = {
    odd: n => expectInt(n) % 2 === 1,
    even: n => expectInt(n) % 2 === 0,
    neg: n => -expectInt(n),

    add: a => b => expectInt(a) + expectInt(b),
    sub: a => b => expectInt(a) - expectInt(b),
    mul: a => b => expectInt(a) * expectInt(b),

    eq: a => b => expectInt(a) === expectInt(b),
    greater: a => b => expectInt(a) > expectInt(b),
    less: a => b => expectInt(a) < expectInt(b),

    not: x => !expectBool(x),
    and: a => b => expectBool(a) && expectBool(b),
    nand: a => b => !(expectBool(a) && expectBool(b)),
    or: a => b => expectBool(a) || expectBool(b),
    nor: a => b => !(expectBool(a) || expectBool(b)),
    xor: a => b => expectBool(a) !== expectBool(b),
    xnor: a => b => expectBool(a) === expectBool(b),
} as const