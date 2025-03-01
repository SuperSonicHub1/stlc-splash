import { Expr, ExprType, Type, TypeType } from "./ast.ts";

export function solveTypes(expr: Expr, context: Record<string, Type> = {}): Type {
    switch (expr.type) {
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
    }
}