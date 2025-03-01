export enum ExprType {
    LiteralInt,
    LiteralBool,
}
export type Expr =
    | { type: ExprType.LiteralInt, value: number }
    | { type: ExprType.LiteralBool, value: boolean }

export enum TypeType {
    Int,
    Bool,
}
export type Type =
    | { type: TypeType.Int }
    | { type: TypeType.Bool }
