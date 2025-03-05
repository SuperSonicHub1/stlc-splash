import { Runtime } from 'jsr:@kawcco/parsebox'
import { Binding, Expr, ExprType, Type, TypeType } from "./ast.ts";
import { OurModule } from "../../grammar.ts";

const { Const, Tuple, Union, Ident, Ref, Array, Optional } = Runtime

const Tokens = {
    Arrow: Const('->'),
    LParen: Const('('),
    RParen: Const(')'),
    LBracket: Const('['),
    RBracket: Const(']'),
    Int: Const('int'),
    Bool: Const('bool'),
    Fn: Const('fn'),
    Comma: Const(','),
    Colon: Const(':'),
    Let: Const('let'),
    In: Const('in'),
    Equals: Const('='),
    If: Const('if'),
    Then: Const('then'),
    Else: Const('else'),
    True: Const('true'),
    False: Const('false'),
}

export const Language = new OurModule({
    Expr: Tuple(
        [
            Ref<Expr>('ExprWithoutApplication'),
            Array(Tuple([
                Tokens.LParen,
                Ref<Expr>('Expr'),
                Tokens.RParen,
            ], ([, expr,]) => expr)),
        ],
        ([base, applicationArgs]) => {
            let expr = base
            for (const argument of applicationArgs) {
                expr = { type: ExprType.Application, lambda: expr, argument }
            }
            return expr
        }
    ),
    ExprWithoutApplication: Union(
        [
            Ref<Expr>('Abstraction'),
            Ref<Expr>('Int'),
            Ref<Expr>('Bool'),
            Ref<Expr>('Var'),
            Ref<Expr>('ExprParen'),
        ]
    ),
    ExprParen: Tuple(
        [
            Tokens.LParen,
            Ref<Expr>('Expr'),
            Tokens.RParen,
        ],
        ([, expr,]) => expr
    ),
    Ty: Union(
        [
            Tokens.Int,
            Tokens.Bool,
            Ref<Type>('TyFn'),
        ],
        raw => (
            raw == "int"
                ? { type: TypeType.Int }
                : raw == "bool"
                    ? { type: TypeType.Bool }
                    : raw
        ) satisfies Type,
    ),
    TyFn: Tuple(
        [
            Tokens.Fn,
            Tokens.LBracket,
            Ref<Type>('Ty'),
            Tokens.Comma,
            Ref<Type>('Ty'),
            Tokens.RBracket,
        ],
        ([, , argumentType, , returnType]) =>
            ({ type: TypeType.Function, argumentType, returnType } satisfies Type),
    ),
    Binding: Tuple(
        [
            Ident(),
            Tokens.Colon,
            Ref<Type>('Ty'),
        ],
        ([name, , type]) => ({ name, type } as Binding),
    ),
    Abstraction: Tuple(
        [
            Ref<Binding>('Binding'),
            Tokens.Arrow,
            Ref<Expr>('Expr')
        ],
        ([binding, , body]) => ({ type: ExprType.Abstraction, binding, body } satisfies Expr),
    ),
    Var: Tuple(
        [
            Ident(),
        ],
        ([name]) => ({ type: ExprType.Var, name } satisfies Expr),
    ),
    Digit: Union([
        Const("0"),
        Const("1"),
        Const("2"),
        Const("3"),
        Const("4"),
        Const("5"),
        Const("6"),
        Const("7"),
        Const("8"),
        Const("9"),
    ]),
    Int: Tuple(
        [
            Optional(Const("-")),
            Ref("Digit"),
            Array(Ref("Digit"))
        ],
        ([[minus], first_digit, digits]) => (
            {
                type: ExprType.LiteralInt,
                value: parseInt((minus ?? "") + first_digit + digits.join(""))
            } satisfies Expr
        ),
    ),
    Bool: Union(
        [
            Tokens.True,
            Tokens.False,
        ],
        raw => ({ type: ExprType.LiteralBool, value: raw == "true" } satisfies Expr),
    ),
})
