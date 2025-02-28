export enum ExprType {
    Application,
    Abstraction,
    Let,
    Var,
    Ternary,
    LiteralInt,
    LiteralBool,
}
export type Expr =
    | { type: ExprType.Application, lambda: Expr, argument: Expr }
    | { type: ExprType.Abstraction, binding: Binding, body: Expr }
    | { type: ExprType.Let, binding: BindingUntyped, boundTo: Expr, boundIn: Expr }
    | { type: ExprType.Var, name: string }
    | { type: ExprType.Ternary, condition: Expr, positive: Expr, negative: Expr }
    | { type: ExprType.LiteralInt, value: number }
    | { type: ExprType.LiteralBool, value: boolean }


export enum TypeType {
    Int,
    Bool,
    Function,
}
export type Type =
    | { type: TypeType.Int }
    | { type: TypeType.Bool }
    | { type: TypeType.Function, argumentType: Type, returnType: Type }


export type Ident = string;
export type Binding = { name: Ident, type: Type }
export type BindingUntyped = { name: Ident, type: Type | null }

