import { Expr, ExprType, Ident } from "./ast.ts";


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


export function evaluate(expr: Expr, context: Context = {}): Value {
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
        case ExprType.Var: {
            const value = context[expr.name]
            if (value == undefined) {
                throw new Error("Runtime eval error: variable `" + expr.name + "` not found")
            }
            return value
        }
        case ExprType.LiteralInt: {
            return { type: ValueType.Int, value: expr.value }
        }
        case ExprType.LiteralBool: {
            return { type: ValueType.Bool, value: expr.value }
        }
    }
}
