import { inspectType } from "../../inspect.ts"
import { Expr, ExprType, Type, TypeType } from "./ast.ts"

export function solveTypes(expr: Expr, context: Record<string, Type> = {}): Type {
    switch (expr.type) {
        /// @impl
        case ExprType.Application: {
            const argumentType = solveTypes(expr.argument, context)
            const lambdaType = solveTypes(expr.lambda, context)
            if (lambdaType.type !== TypeType.Function) {
                throw new Error(`solveTypes: cannot call value of type ${inspectType(lambdaType)}`)
            }
            if (!typesMatch(lambdaType.argumentType, argumentType)) {
                throw new Error(`solveTypes: lambda argument type mismatched: expected type ${inspectType(lambdaType.argumentType)}, found ${inspectType(argumentType)}`)
            }
            return lambdaType.returnType
        }
        /// @impl
        case ExprType.Abstraction: {
            return {
                type: TypeType.Function,
                argumentType: expr.binding.type,
                returnType: solveTypes(expr.body, {
                    ...context,
                    [expr.binding.name]: expr.binding.type,
                })
            }
        }
        case ExprType.Var: {
            if (expr.name in context) {
                return context[expr.name]
            } else {
                throw new Error(`solveTypes: variable '${expr.name}' not found`)
            }
        }
        case ExprType.LiteralInt:
            return { type: TypeType.Int }
        case ExprType.LiteralBool:
            return { type: TypeType.Bool }
    }
}

function typesMatch(a: Type, b: Type): boolean {
    switch (a.type) {
        case TypeType.Int:
            return b.type === TypeType.Int
        case TypeType.Bool:
            return b.type === TypeType.Bool
        /// @impl
        case TypeType.Function: {
            if (b.type !== TypeType.Function) {
                return false
            }
            return typesMatch(a.argumentType, b.argumentType)
                && typesMatch(a.returnType, b.returnType)
        }
    }
}