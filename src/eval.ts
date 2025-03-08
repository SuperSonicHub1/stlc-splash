import { Expr, ExprType, Ident } from "./ast.ts"
import { CORE_VALUES } from "./core.ts"


export enum ValueType {
    Int,
    Bool,
    Function,
    FunctionNative,
}
export type Value =
    | { type: ValueType.Int, value: number }
    | { type: ValueType.Bool, value: boolean }
    | { type: ValueType.Function, body: Expr, binding: Ident, context: Context }
    | { type: ValueType.FunctionNative, eval: (v: Value) => Value, name: string }

export type Context = Record<Ident, Value>


export function evaluate(expr: Expr, context: Context = CORE_VALUES()): Value {
    switch (expr.type) {
        case ExprType.Application: {
            const lambda = evaluate(expr.lambda, context)
            const argument = evaluate(expr.argument, context)
            if (lambda.type === ValueType.Function) {
                return evaluate(lambda.body, { ...lambda.context, [lambda.binding]: argument })
            }
            if (lambda.type === ValueType.FunctionNative) {
                return lambda.eval(argument)
            }
            throw new Error("Runtime eval error: cannot call type " + ValueType[lambda.type])
        }
        case ExprType.Abstraction: {
            const binding = expr.binding.name
            const body = expr.body
            return {
                type: ValueType.Function,
                binding,
                body,
                context,
            }
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
            if (condition.type !== ValueType.Bool) {
                throw new Error("Runtime eval error: type " + (ValueType[condition.type]) + " cannot be used as a condition")
            }
            return evaluate(condition.value ? expr.positive : expr.negative, context)
        }
        case ExprType.LiteralInt: {
            return { type: ValueType.Int, value: expr.value }
        }
        case ExprType.LiteralBool: {
            return { type: ValueType.Bool, value: expr.value }
        }
    }
}
