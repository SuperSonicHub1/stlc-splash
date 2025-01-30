import { assertEquals } from "jsr:@std/assert"
import { Runtime } from 'jsr:@kawcco/parsebox'

const { Const, Tuple, Union, Number, Ident, Module, Ref } = Runtime

/**
 * Pre-processing step for parsing that removes C-style single— and
 * multi-line comments from a string.
 * @param input String with comments
 * @returns String without comments.
 */
function processComments(input: string): string {
    enum CommentState {
        None,
        Single,
        Multiple
    }

    let output = ''
    let state = CommentState.None
    for (let i = 0; i < input.length; i++) {
        switch (state) {
            case CommentState.None:
                // Make sure there's enough characters
                if (input.length - i >= 2) {
                    // Single line comment
                    if (input[i] == '/' && input[i + 1] == '/') {
                        state = CommentState.Single
                        // Skip one char
                        i++
                        continue
                    }
                    // Multi-line comment
                    if (input[i] == '/' && input[i + 1] == '*') {
                        state = CommentState.Multiple
                        // Skip one char
                        i++
                        continue
                    }
                }
                output += input[i]
                break
            case CommentState.Single:
                if (input[i] == '\n') {
                    state = CommentState.None
                    // Include the newline
                    output += input[i]
                }
                break
            case CommentState.Multiple:
                if (input.length - i >= 2 && input[i] == '*' && input[i + 1] == '/') {
                    state = CommentState.None
                    // Skip one char
                    i++
                }
                break
        }
    }
    return output
}

Deno.test({
    name: "processComments: general exercise",
    fn() {
        const test = `a // hello
b c d e
f // g h i j k
a /* aaaaaaaaa */ f
a /* aaaaaa



aaa */ f
`
        assertEquals(processComments(test), "a \nb c d e\nf \na  f\na  f\n")
    },
})

Deno.test({
    name: "processComments: empty string passthrough",
    fn() {
        assertEquals(processComments(''), '')
    },
})

Deno.test({
    name: "processComments: short string",
    fn() {
        assertEquals(processComments('a'), 'a')
    },
})

Deno.test({
    name: "processComments: slashes are still good",
    fn() {
        assertEquals(processComments('a / b'), 'a / b')
    },
})

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

const Language = new Module({
    Expr: Union([
        Ref('Abstraction'),
        Ref('Application'),
        Ref('Let'),
        Ref('Ternary'),
        Ref('Var'),
        Ref('Int'),
        Ref('Bool'),
    ]),
    Ty: Union([
        Tokens.Int,
        Tokens.Bool,
        Ref('TyFn'),
    ]),
    TyFn: Tuple([
        Tokens.Fn,
        Tokens.LBracket,
        Ref('Ty'),
        Tokens.Comma,
        Ref('Ty'),
        Tokens.RBracket,
    ]),    
    Binding: Tuple([
        Ident(),
        Tokens.Colon,
        Ref('Ty'),
    ]),
    Abstraction: Tuple([
        Ref('Binding'),
        Tokens.Arrow,
        Ref('Expr')
    ]),
    Application: Tuple([
        Ref('Expr'),
        Tokens.LParen,
        Ref('Expr'),
        Tokens.RParen,
    ]),
    Let: Union([
        Tokens.Let,
        Ref('Binding'),
        Tokens.Equals,
        Ref('Expr'),
        Tokens.In,
        Ref('Expr'),
    ]),
    Ternary: Tuple([
        Tokens.If,
        Ref('Expr'),
        Tokens.Then,
        Ref('Expr'),
        Tokens.Else,
        Ref('Expr'),
    ]),
    Var: Tuple([Ident()]),
    // TODO(supersonichub1): Also parses floats; change to be more strict.
    Int: Tuple([Number()]),
    Bool: Union([
        Tokens.True,
        Tokens.False,
    ]),
})

const test = `let id = x: int -> x in
let g = x: fn[int, int] -> x(x) in
g(id)(5)`

// const res = Language.Parse('Bool', 'true')
// console.log(res)

