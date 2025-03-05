export enum ExprType {
    Application,
    Abstraction,
    Var,
    LiteralInt,
    LiteralBool,
}
export type Expr =
    | { type: ExprType.Application, lambda: Expr, argument: Expr }
    | { type: ExprType.Abstraction, binding: Binding, body: Expr }
    | { type: ExprType.Var, name: Ident }
    | { type: ExprType.LiteralInt, value: number }
    | { type: ExprType.LiteralBool, value: boolean }

export type Ident = string;
export type Binding = { name: Ident }
