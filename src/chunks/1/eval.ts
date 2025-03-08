import { Expr, ExprType } from "./ast.ts"


export enum ValueType {
    Int,
    Bool,
}
export type Value =
    | { type: ValueType.Int, value: number }
    | { type: ValueType.Bool, value: boolean }


export function evaluate(expr: Expr): Value {
    switch (expr.type) {
        case ExprType.LiteralInt: {
            return { type: ValueType.Int, value: expr.value }
        }
        case ExprType.LiteralBool: {
            return { type: ValueType.Bool, value: expr.value }
        }
    }
}
