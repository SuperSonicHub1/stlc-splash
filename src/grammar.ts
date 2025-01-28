import { Runtime, Static } from '@sinclair/parsebox'

const { Const, Tuple, Union, Array, Optional, Number, Ident, } = Runtime

const Tokens = {
    LParen: Const('('),
    RParen: Const(')'),
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

const Expr = Union([])

// TODO(supersonichub1): Handle cycle
const Ty: Runtime.IUnion = Union([
    Tokens.Int,
    Tokens.Bool,
    TyFn,
])

const TyFn = Tuple([
    Tokens.Fn,
    Tokens.LParen,
    Ty,
    Tokens.Comma,
    Ty,
    Tokens.RParen,
])


const Binding = Tuple([
    Ident(),
    Tokens.Colon,
    Ty,
])

const Let = Union([
    Tokens.Let,
    Binding,
    Tokens.Equals,
    Expr,
    Tokens.In,
    Expr,
])

const Ternary = Tuple([
    Tokens.If,
    Expr,
    Tokens.Then,
    Expr,
    Tokens.Else,
    Expr,
])

const Var = Tuple([Ident()])

// TODO(supersonichub1): Also parses floats; change to be more strict.
const Int = Tuple([Number()])

const Bool = Union([
    Tokens.True,
    Tokens.False,
])
