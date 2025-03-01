import { Runtime } from 'jsr:@kawcco/parsebox'
import { OurModule } from "../../grammar.ts";
import { Expr, ExprType } from "./ast.ts";
import { assertEquals } from "jsr:@std/assert/equals";

const { Const, Tuple, Union, Ref, Array, Optional } = Runtime

const Tokens = {
    True: Const('true'),
    False: Const('false'),
}

export const Language = new OurModule({
    Expr: Union(
        [
            Ref('Int'),
            Ref('Bool'),
        ]
    ),
    /// @impl
    Bool: Union(
        [
            Tokens.True,
            Tokens.False,
        ],
        raw => ({ type: ExprType.LiteralBool, value: raw == "true" } satisfies Expr),
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
        /// @impl
        ([[minus], first_digit, digits]) => (
            {
                type: ExprType.LiteralInt,
                value: parseInt((minus ?? "") + first_digit + digits.join(""))
            } satisfies Expr
        ),
    ),
})

// TODO(supersonichub1): Fix
/// @impl
Deno.test({
    name: "`-9` is -9",
    fn() {
        let result: any = Language.Parse('Expr', '-9')[0]
        assertEquals(result.value as number, -9)
    },
})
