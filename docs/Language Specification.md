# language specification

## examples

```
add(1)(2)
// => 1+2 => 3
```

```
(a: int -> add(a)(a))(1)
// => 1+1 => 2
```

```
let x = 1 in
let y = 2 in
add(x)(y)
// => 1+2 => 3
```

```
if odd(3) 1 else 2
// => 1
```

```
let a = add(1)(2) in add(a, 3)
// => 1+2+3 => 6
```

```
let do_thing =
    a: int -> b: bool -> if b then a else add(a)(a)
in do_thing(1)(false)
// => 2
```

```
let add_one = add(1) in add_one(add_one(0))
// => 1+1+0 => 2
```

## syntax

```
<expr> ::= "(", <expr>, ")"
         | <expr_app>
         | <expr_abs>
         | <expr_let>
         | <expr_tern>
         | <expr_var>
         | <expr_literal>

<expr_app> ::= <expr>, "(", <expr>, ")" 
<expr_abs> ::= <binding>, "->", <expr>
<expr_let> ::= "let", <binding>, "=", <expr>, "in", <expr>
<expr_tern> ::= "if", <expr>, "then", <expr>, "else", <expr>
<expr_var> ::= <ident>
<expr_literal> ::= <literal_int>
                 | <literal_bool>

<literal_int> ::= ( <number> )+
<literal_bool> ::= "true" | "false"

<binding> ::= <ident>, (":", <type> )?

<type> ::= <type_fn>
         | <type_int>
         | <type_bool>

<type_fn> ::= "fn", "[", <type>, ",", <type> ,"]"
<type_int> ::= "int"
<type_bool> ::= "bool"
```

## semantics / evaluation

```
eval(`a`, ctx)
    = ctx['a']
```

```
eval(`$a($b)`, ctx)
    = let a, b = eval(a,ctx), eval(b,ctx)
        in match a {
            Fn(arg, body, ctx_captured) => eval(body, ctx_captured + {[arg]: b})
            _ => runtime error
        }
```

```
eval(`a -> $b`, ctx) / eval(`(a:_) -> $b`, ctx)
    = Fn(a, b, ctx)
```

```
eval(`let x = $a in $b`, ctx)  
    = eval(b, ctx + {[x]: eval(a,ctx)})
```

```
eval(`if $a $b else $c`, ctx)
    = match eval(a, ctx) {
        Bool(true) => eval($b, ctx)
        Bool(false) => eval($c, ctx)
        _ => runtime error
    }
```

```
eval(literal_int, ctx)
    = Int(literal_int)
```

```
eval(literal_bool, ctx)
    = Bool(literal_bool)
```

## semantics / type system

##### ... / xmas tree

> for:
>
> - $\alpha, \beta, ... \in \text{type}$
> - $e_i, (c \in \text{literal}), (x \in \text{var}) \in \text{expr}$
> - $\Gamma \in \text{context}$

1. $$\frac{x:\alpha \in \Gamma}{\Gamma \vdash x : \alpha}$$

1. $$\frac{(\Gamma \cup \{ x: \alpha \}) \vdash e:\beta}{\Gamma \vdash x \to e : \alpha \to \beta}$$

1. $$\frac{\Gamma \vdash e_1 : \alpha \to \beta,\Gamma \vdash e_2 : \alpha}{\Gamma \vdash e_1 (e_2) : \beta}$$

1. $$\frac{\Gamma \vdash e_1:\alpha, (\Gamma \cup \{x:\alpha\})\vdash e_2:\beta}{\Gamma \vdash \text{let}\ x = e_1 \ \text{in}\ e_2 : \beta}$$

1. $$\frac{\Gamma \vdash e_1 : \text{Bool}, \Gamma \vdash e_2 : \alpha, \Gamma \vdash e_3 : \alpha}{\Gamma \vdash \text{if}\ e_1 \ \text{then} \ e_2 \ \text{else}\ e_3 : \alpha}$$

1. $$\frac{c:\alpha}{\Gamma \vdash c:\alpha}$$
