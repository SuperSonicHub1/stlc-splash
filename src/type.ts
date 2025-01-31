import { Expr, ExprType, Type, TypeType } from "./ast.ts";
import { CORE_TYPES } from "./core.ts";

export function typeName(type: Type, mayNeedParen = false): string {
    switch (type.type) {
        case TypeType.Int: return "int"
        case TypeType.Bool: return "bool"
        case TypeType.Function: {
            const base = `${typeName(type.argumentType, true)} -> ${typeName(type.returnType)}`
            return mayNeedParen ? `(${base})` : base
        }
    }
}

export function solveTypes(expr: Expr, context: Record<string, Type> = CORE_TYPES): Type {
    switch (expr.type) {
        case ExprType.Application: {
            const argumentType = solveTypes(expr.argument, context)
            const lambdaType = solveTypes(expr.lambda, context)
            if (lambdaType.type !== TypeType.Function) {
                throw new Error(`solveTypes: cannot call value of type ${typeName(lambdaType)}`)
            }
            if (!typesMatch(lambdaType.argumentType, argumentType)) {
                throw new Error(`solveTypes: lambda argument type mismatched: expected type ${typeName(lambdaType.argumentType)}, found ${typeName(argumentType)}`)
            }
            return lambdaType.returnType
        }
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
        case ExprType.Let: {
            const boundToType = solveTypes(expr.boundTo, context)
            if (expr.binding.type !== null && !typesMatch(boundToType, expr.binding.type)) {
                throw new Error(`solveTypes: let binding variable type mismatched: expected type ${expr.binding.type}, found ${typeName(boundToType)}`)
            }
            return solveTypes(expr.boundIn, {
                ...context,
                [expr.binding.name]: boundToType
            })
        }
        case ExprType.Var: {
            if (expr.name in context) {
                return context[expr.name]
            } else {
                throw new Error(`solveTypes: variable '${expr.name}' not found`)
            }
        }
        case ExprType.Ternary: {
            const conditionType = solveTypes(expr.condition, context)
            const positiveType = solveTypes(expr.positive, context)
            const negativeType = solveTypes(expr.negative, context)
            if (!typesMatch(conditionType, { type: TypeType.Bool })) {
                throw new Error(`solveTypes: ternary condition must be of type bool, found ${typeName(conditionType)}`)
            }
            if (!typesMatch(positiveType, negativeType)) {
                throw new Error(`solveTypes: branches of ternary must have the same type, found ${typeName(positiveType)} and ${typeName(negativeType)}`)
            }
            return positiveType // or `negativeType`, doesn't matter since they equal
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
        case TypeType.Function: {
            if (b.type !== TypeType.Function) {
                return false
            }
            return typesMatch(a.argumentType, b.argumentType)
                && typesMatch(a.returnType, b.returnType)
        }
    }
}