# language spec proposal 0
[edits from izzie lol]

## syntax

example:
```
// uwu owo diz iz codingu uwu hehe hewo world or smt :33333333333333333333helpmeohmyfuckinggodthevoiceshelp:333333333333333333333333333333333333eeeeesssaaaaaaaaaaaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa

let id = x -> x in
let g = x -> x(x) in
g(id)(5)


if odd(3) 1 else 2
```

formal:
```
<expr> ::= "(", <expr>, ")"
         | <expr_app>
         | <expr_abs>
         | <expr_let>
         | <expr_tern>
         | <expr_var>
         | <expr_int>
         | <expr_bool>

<expr_app> ::= <expr>, "(", <expr>, ")" 
<expr_abs> ::= <binding>, "->", <expr>
<binding> ::= <ident>, (":", <typename> )?
<typename> ::= "int" | "bool"
<expr_let> ::= "let", <binding>, "=", <expr>, "in", <expr>
<expr_tern> ::= "if", <expr>, <expr>, "else", <expr>
<expr_var> ::= <ident>
<expr_int> ::= ( <number> )+
<expr_bool> ::= "true" | "false"
```

## semantics:

evaluation
```
eval(`a`, ctx)
    = ctx['a']
eval(`$a($b)`, ctx)
    = let a, b = eval(a,ctx), eval(b,ctx)
        in match a {
            Fn(arg, body, ctx_captured) => eval(body, ctx_captured + {[arg]: b})
            _ => runtime error
        }
eval(`a -> $b`, ctx) / eval(`(a:_) -> $b`, ctx)
    = Fn(a, b, ctx)
eval(`let x = $a in $b`, ctx)  
    = eval(b, ctx + {[x]: eval(a,ctx)})
eval(`if $a $b else $c`, ctx)
    = match eval(a, ctx) {
        Bool(true) => eval($b, ctx)
        Bool(false) => eval($c, ctx)
        _ => runtime error
    } 
eval(literal, ctx)
    = Int(literal) / Bool(literal)
```

xmas tree

1. $$\frac{x:\alpha \in \Gamma}{\Gamma \vdash x : \alpha}$$
1. $$\frac{\Gamma, x:\alpha \vdash e:\beta}{\Gamma \vdash x \to e : \alpha \to \beta}$$
1. $$\frac{\Gamma \vdash e_1 : \alpha \to \beta,\Gamma \vdash e_2 : \alpha}{\Gamma \vdash e_1 (e_2) : \beta}$$
1. $$\frac{\Gamma \vdash e_1:\alpha, \Gamma,x:\alpha\vdash e_2:\beta}{\Gamma \vdash \text{let}\ x = e_1 \ \text{in}\ e_2 : \beta}$$
1. $$\frac{\Gamma \vdash e_1 : \text{Bool}, \Gamma \vdash e_2 : \alpha, \Gamma \vdash e_3 : \alpha}{\Gamma \vdash \text{if}\ e_1 \ e_2 \ \text{else}\ e_3 : \alpha}$$
1. $$\frac{c:\alpha}{\Gamma \vdash c:\alpha}$$

## Feedback from Kyle M01 25 2025

@supersonichub1:

Good stuff. Some comments:
- The production rules `"(", <expr>, ")"` from `expr` and `<expr>, "(", <expr>, ")"`  from `expr_app` may lead to an ambiguous parse.
- We should think about how to implement comments. Should this be discussed during the class?
- Functions arguments should have bindings.
- Also, do you want to add type polymorphism such that the stuff like the identity function is posisble? Always keep in mind that adding more features will result in a longer class.
- Why doesn't the ternary use the classic `x ? a : b` syntax if we're aiming for familiarity with JavaScript?
- Evaluation rules look good!
- Inference rule (4) is a bit confusing. Can you explain to me in English how what it's supposed to be doing?
- For inference rule (6), is `c` any literal integer/bool?

@scidev5:

Good stuff. Some comments:
> thank
- The production rules "(", <expr>, ")" from expr and <expr>, "(", <expr>, ")"  from expr_app may lead to an ambiguous parse.
> perhaps we'll just drop the first rule then, its not strictly necessary
- We should think about how to implement comments. Should this be discussed during the class?
> idk i usually make it a kind of meta-rule like anywhere you'd put \s in regex, or like a <space> or <break> rule
- Functions arguments should have bindings.
> wym i thought i did that
- Also, do you want to add type polymorphism such that the stuff like the identity function is posisble? Always keep in mind that adding more features will result in a longer class.
> that sounds hard to teach well, im not sure how the simply typed lambda calculus works 100% i kinda just guessed
- Why doesn't the ternary use the classic `x ? a : b` syntax if we're aiming for familiarity with JavaScript?
> mostly because it's kinda hard to read even in js, and if/else should still be understood
- Evaluation rules look good!
> yay!
- Inference rule (4) is a bit confusing. Can you explain to me in English how what it's supposed to be doing?
> "if in e1 has type alpha and e2 has type beta (in a context where x is bound to type alpha), then the expression "let x = e1 in e2" has type beta"
- For inference rule (6), is `c` any literal integer/bool?
> yes

@supersonichub1:

> wym i thought I did that
I misread the grammar. I also forgot that we're going to initially implement the untyped calculus and then add types in, so never mind. We should make the type specification required once we add types. We'll create multiple versions of the grammar as we flesh out the lesson plan.
> that sounds hard to teach
Fair enough. Think of the STLC as a simpler Hindley-Milner; recommend reading the Wikipedia page.
> mostly because it's hard to read
Fair enough.
> "if e1..."
Ah; we should find a nicer way to write the antecedent; perhaps something like: `\Gamma \vdash e_1: \alpha,  (\Gamma \cup (x: \alpha) \vdash e_2: \beta`? Having a newline would also help.
