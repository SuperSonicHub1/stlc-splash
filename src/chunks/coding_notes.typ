= 1: Literals
`int` and `bool`

== :: AST
`Expr` is the start of our AST

== :: Parsing
reintroduce functions: `Const`, `Union`, `Tuple`, `Ref`, [`Array`, `Optional`]

`impl union`
#box(stroke: black, inset: 0.5em)[```ts
Bool: Union(
    [
        Tokens.True,
        Tokens.False,
    ],
    raw => ({ type: ExprType.LiteralBool, value: raw == "true" } satisfies Expr),
),
```]

explain and rationalize map
#box(stroke: black, inset: 0.5em)[```ts
([[minus], first_digit, digits]) => (
    {
        type: ExprType.LiteralInt,
        value: parseInt((minus ?? "") + first_digit + digits.join(""))
    } satisfies Expr
),
```]


== :: Evaluation
note the new datastructure

the rest is shrimple


#pagebreak()
#line(length: 100%)
= 2: Abstractions
abstractions, applications, and vars

== :: AST / Parsing
#box(stroke: black, inset: 0.5em)[```ts
Binding: Tuple(
    [
        Ident(),
    ],
    ([name,]) => ({ name } as Binding),
),
```]

== :: Evaluation



#pagebreak()
#line(length: 100%)
= 3: Types

== :: AST / Parsing
types obviously

== :: Solver
#box(stroke: black, inset: 0.5em)[```ts
case ExprType.Application: {
    const argumentType = solveTypes(expr.argument, context)
    const lambdaType = solveTypes(expr.lambda, context)
    if (lambdaType.type !== TypeType.Function) {
        throw new Error(`solveTypes: cannot call value of type ${inspectType(lambdaType)}`)
    }
    if (!typesMatch(lambdaType.argumentType, argumentType)) {
        throw new Error(`solveTypes: lambda argument type mismatched: expected type ${inspectType(lambdaType.argumentType)}, found ${inspectType(argumentType)}`)
    }
    return lambdaType.returnType
}
```]
#box(stroke: black, inset: 0.5em)[```ts
case ExprType.Abstraction: {
    return {
        type: TypeType.Function,
        argumentType: expr.binding.type,
        returnType: solveTypes(expr.body, {
            ...context,
            [expr.binding.name]: expr.binding.type,
        })
    }
}
```]
#box(stroke: black, inset: 0.5em)[```ts
case TypeType.Function: {
    if (b.type !== TypeType.Function) {
        return false
    }
    return typesMatch(a.argumentType, b.argumentType)
        && typesMatch(a.returnType, b.returnType)
}
```]



#pagebreak()
#line(length: 100%)
= 4: Core
builtins and stuff

== :: Solver
== :: Evaluation
#box(stroke: black, inset: 0.5em)[```ts
if (lambda.type === ValueType.FunctionNative) {
    return lambda.eval(argument)
}
```]



#pagebreak()
#line(length: 100%)
= 5: Syntactic sugar
`if` and `let`

== :: AST / Parsing
#box(stroke: black, inset: 0.5em)[```ts
case CommentState.Multiple:{
    if (input.length - i >= 2 && input[i] == '*' && input[i + 1] == '/') {
        state = CommentState.None
        // Skip one char extra
        i++
    }
    break
}
```]
#box(stroke: black, inset: 0.5em)[```ts
Let: Tuple(
    [
        Tokens.Let,
        Ref<BindingUntyped>('BindingUntyped'),
        Tokens.Equals,
        Ref<Expr>('Expr'),
        Tokens.In,
        Ref<Expr>('Expr'),
    ],
    ([, binding, , boundTo, , boundIn]) =>
        ({ type: ExprType.Let, binding, boundIn, boundTo } satisfies Expr),
),
```]
#box(stroke: black, inset: 0.5em)[```ts
Ternary: Tuple(
    [
        Tokens.If,
        Ref<Expr>('Expr'),
        Tokens.Then,
        Ref<Expr>('Expr'),
        Tokens.Else,
        Ref<Expr>('Expr'),
    ],
    ([, condition, , positive, , negative]) =>
        ({ type: ExprType.Ternary, condition, positive, negative } satisfies Expr),
),
```]

== :: Evaluation
#box(stroke: black, inset: 0.5em)[```ts
case ExprType.Let: {
    const boundValue = evaluate(expr.boundTo, context)
    return evaluate(expr.boundIn, { ...context, [expr.binding.name]: boundValue })
}
```]
#box(stroke: black, inset: 0.5em)[```ts
case ExprType.Ternary: {
    const condition = evaluate(expr.condition, context)
    if (condition.type !== ValueType.Bool) {
        throw new Error("Runtime eval error: type " + (ValueType[condition.type]) + " cannot be used as a condition")
    }
    return evaluate(condition.value ? expr.positive : expr.negative, context)
}
```]

== :: Solver
#box(stroke: black, inset: 0.5em)[```ts
case ExprType.Let: {
    const boundToType = solveTypes(expr.boundTo, context)
    if (expr.binding.type !== null && !typesMatch(boundToType, expr.binding.type)) {
        throw new Error(`solveTypes: let binding variable type mismatched: expected type ${expr.binding.type}, found ${inspectType(boundToType)}`)
    }
    return solveTypes(expr.boundIn, {
        ...context,
        [expr.binding.name]: boundToType
    })
}
```]
#box(stroke: black, inset: 0.5em)[```ts
case ExprType.Ternary: {
    const conditionType = solveTypes(expr.condition, context)
    const positiveType = solveTypes(expr.positive, context)
    const negativeType = solveTypes(expr.negative, context)
    if (!typesMatch(conditionType, { type: TypeType.Bool })) {
        throw new Error(`solveTypes: ternary condition must be of type bool, found ${inspectType(conditionType)}`)
    }
    if (!typesMatch(positiveType, negativeType)) {
        throw new Error(`solveTypes: branches of ternary must have the same type, found ${inspectType(positiveType)} and ${inspectType(negativeType)}`)
    }
    return positiveType // or `negativeType`, doesn't matter since they equal
}
```]

