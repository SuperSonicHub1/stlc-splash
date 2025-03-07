import { assertEquals } from "jsr:@std/assert";
import { Runtime } from "jsr:@kawcco/parsebox";
import {
  Binding,
  BindingUntyped,
  Expr,
  ExprType,
  Type,
  TypeType,
} from "./ast.ts";
import { inspectGrammar } from "./inspect.ts";
import { displayJupyterInspector } from "./notebook.ts";

const { Const, Tuple, Union, Ident, Module, Ref, Array, Optional } = Runtime;

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
    Multiple,
  }

  let output = "";
  let state = CommentState.None;
  for (let i = 0; i < input.length; i++) {
    switch (state) {
      case CommentState.None:
        // Make sure there's enough characters
        if (input.length - i >= 2) {
          // Single line comment
          if (input[i] == "/" && input[i + 1] == "/") {
            state = CommentState.Single;
            // Skip one char extra
            i++;
            continue;
          }
          // Multi-line comment
          if (input[i] == "/" && input[i + 1] == "*") {
            state = CommentState.Multiple;
            // Skip one char extra
            i++;
            continue;
          }
        }
        output += input[i];
        break;
      case CommentState.Single:
        if (input[i] == "\n") {
          state = CommentState.None;
          // Include the newline
          output += input[i];
        }
        break;
      case CommentState.Multiple:
        if (input.length - i >= 2 && input[i] == "*" && input[i + 1] == "/") {
          state = CommentState.None;
          // Skip one char extra
          i++;
        }
        break;
    }
  }
  return output;
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
`;
    assertEquals(processComments(test), "a \nb c d e\nf \na  f\na  f\n");
  },
});

Deno.test({
  name: "processComments: empty string passthrough",
  fn() {
    assertEquals(processComments(""), "");
  },
});

Deno.test({
  name: "processComments: short string",
  fn() {
    assertEquals(processComments("a"), "a");
  },
});

Deno.test({
  name: "processComments: slashes are still good",
  fn() {
    assertEquals(processComments("a / b"), "a / b");
  },
});

const Tokens = {
  Arrow: Const("->"),
  LParen: Const("("),
  RParen: Const(")"),
  LBracket: Const("["),
  RBracket: Const("]"),
  Int: Const("int"),
  Bool: Const("bool"),
  Fn: Const("fn"),
  Comma: Const(","),
  Colon: Const(":"),
  Let: Const("let"),
  In: Const("in"),
  Equals: Const("="),
  If: Const("if"),
  Then: Const("then"),
  Else: Const("else"),
  True: Const("true"),
  False: Const("false"),
};

/**
 * Extension of {@link Module} for the lecture.
 */
export class OurModule extends Module {
  [Symbol.for("Jupyter.display")]() {
    return displayJupyterInspector(inspectGrammar, this);
  }
}

export const Language = new OurModule({
  Expr: Tuple(
    [
      Ref<Expr>("ExprWithoutApplication"),
      Array(Tuple([
        Tokens.LParen,
        Ref<Expr>("Expr"),
        Tokens.RParen,
      ], ([, expr]) => expr)),
    ],
    ([base, applicationArgs]) => {
      let expr = base;
      for (const argument of applicationArgs) {
        expr = { type: ExprType.Application, lambda: expr, argument };
      }
      return expr;
    },
  ),
  ExprWithoutApplication: Union(
    [
      Ref<Expr>("Abstraction"),
      Ref<Expr>("Let"),
      Ref<Expr>("Ternary"),
      Ref<Expr>("Int"),
      Ref<Expr>("Bool"),
      Ref<Expr>("Var"),
      Ref<Expr>("ExprParen"),
    ],
  ),
  ExprParen: Tuple(
    [
      Tokens.LParen,
      Ref<Expr>("Expr"),
      Tokens.RParen,
    ],
    ([, expr]) => expr,
  ),
  Ty: Union(
    [
      Tokens.Int,
      Tokens.Bool,
      Ref<Type>("TyFn"),
    ],
    (raw) =>
      (
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
      Ref<Type>("Ty"),
      Tokens.Comma,
      Ref<Type>("Ty"),
      Tokens.RBracket,
    ],
    (
      [, , argumentType, , returnType],
    ) => ({ type: TypeType.Function, argumentType, returnType } satisfies Type),
  ),
  Binding: Tuple(
    [
      Ident(),
      Tokens.Colon,
      Ref<Type>("Ty"),
    ],
    ([name, , type]) => ({ name, type } as Binding),
  ),
  BindingUntyped: Tuple(
    [
      Ident(),
      Optional(Tuple([
        Tokens.Colon,
        Ref<Type>("Ty"),
      ], ([, type]) => type)),
    ],
    ([name, [type]]) => ({ name, type: type ?? null } as BindingUntyped),
  ),
  Abstraction: Tuple(
    [
      Ref<Binding>("Binding"),
      Tokens.Arrow,
      Ref<Expr>("Expr"),
    ],
    (
      [binding, , body],
    ) => ({ type: ExprType.Abstraction, binding, body } satisfies Expr),
  ),
  Let: Tuple(
    [
      Tokens.Let,
      Ref<BindingUntyped>("BindingUntyped"),
      Tokens.Equals,
      Ref<Expr>("Expr"),
      Tokens.In,
      Ref<Expr>("Expr"),
    ],
    (
      [, binding, , boundTo, , boundIn],
    ) => ({ type: ExprType.Let, binding, boundIn, boundTo } satisfies Expr),
  ),
  Ternary: Tuple(
    [
      Tokens.If,
      Ref<Expr>("Expr"),
      Tokens.Then,
      Ref<Expr>("Expr"),
      Tokens.Else,
      Ref<Expr>("Expr"),
    ],
    (
      [, condition, , positive, , negative],
    ) => ({
      type: ExprType.Ternary,
      condition,
      positive,
      negative,
    } satisfies Expr),
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
      Array(Ref("Digit")),
    ],
    ([[minus], first_digit, digits]) => (
      {
        type: ExprType.LiteralInt,
        value: parseInt((minus ?? "") + first_digit + digits.join("")),
      } satisfies Expr
    ),
  ),
  Bool: Union(
    [
      Tokens.True,
      Tokens.False,
    ],
    (raw) => ({
      type: ExprType.LiteralBool,
      value: raw == "true",
    } satisfies Expr),
  ),
});

Deno.test({
  name: "Language.Parse: parsing one of each type of Expr and Type",
  fn() {
    assertEquals(
      Language.Parse(
        "Expr",
        `
                let x: fn[int, bool] =
                    y: int -> odd(y)
                in if x(2)
                    then false
                    else true
                `.trim(),
      ),
      [{
        type: ExprType.Let,
        binding: {
          name: "x",
          type: {
            type: TypeType.Function,
            argumentType: {
              type: TypeType.Int,
            },
            returnType: {
              type: TypeType.Bool,
            },
          },
        },
        boundIn: {
          type: ExprType.Ternary,
          condition: {
            type: ExprType.Application,
            lambda: {
              type: ExprType.Var,
              name: "x",
            },
            argument: {
              type: ExprType.LiteralInt,
              value: 2,
            },
          },
          positive: {
            type: ExprType.LiteralBool,
            value: false,
          },
          negative: {
            type: ExprType.LiteralBool,
            value: true,
          },
        },
        boundTo: {
          type: ExprType.Abstraction,
          binding: {
            name: "y",
            type: {
              type: TypeType.Int,
            },
          },
          body: {
            type: ExprType.Application,
            lambda: {
              type: ExprType.Var,
              name: "odd",
            },
            argument: {
              type: ExprType.Var,
              name: "y",
            },
          },
        },
      }, ""],
    );
  },
});
