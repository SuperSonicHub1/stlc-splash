export enum ExprType {
    LiteralInt,
    LiteralBool,
}
export type Expr =
    | { type: ExprType.LiteralInt, value: number }
    | { type: ExprType.LiteralBool, value: boolean }
