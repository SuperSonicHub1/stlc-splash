---
title: Reveal-MD
theme: serif  # try solarized, serif or white
---

# Lambda Calculus from Scratch

MIT ESP Splash 2025 • M03 16 2025 Skylar N. Huber, Kyle A. Williams

--

## Abstract

We are going to write a _programming language_ (PL) from nothing! <!-- .element: class="fragment" data-fragment-index="1" -->

We will use the canonical model for PLs, the _lambda calculus_ (LC), as a guide. <!-- .element: class="fragment" -->

We will extend the LC to support "modern" programming features like `let` and `if`. <!-- .element: class="fragment" -->

Along the way, we will implement good software development practices and _y'all_ will write some code! <!-- .element: class="fragment" -->

--

### Who are we?

<table>
  <caption>
    Table 1: This class' lecturers
  </caption>
  <thead>
    <tr>
      <th scope="col">Person</th>
      <th scope="col">Pronouns</th>
      <th scope="col">Headshot</th>
      <th scope="col">Interests</th>
      <th scope="col">Class year</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <th scope="row">Skylar</th>
        <td>she/they</td>
        <td>
            <img height="40%" width="40%" src="https://avatars.githubusercontent.com/u/67175934?v=4" />
        </td>
        <td>Theoretical physics, software engineering</td>
        <td>2028</td>
    </tr>
    <tr>
      <th scope="row">Kyle</th>
        <td>he/him</td>
      <td>
        <img height="40%" width="40%" src="https://avatars.githubusercontent.com/u/25624882?v=4" />
      </td>
      <td>Systems design, language</td>
      <td>2027</td>
    </tr>
  </tbody>
</table>

--

### Who are y'all?

**Exercise 1**: Take five (5) minutes to talk to the people around you. Share your name, pronouns (if any), and what you do for fun.

--

## Why study programming languages?

**Exercise 2**: Why are programming languages cool?

<!-- Take three people. -->

--

All software is written in programming languages. If we can design better programming languages, perhaps we can make it easier to write software!

Writing more correct software <!-- .element: class="fragment" -->

Making software more accessible <!-- .element: class="fragment" -->

Solving challenging domain-specific problems <!-- .element: class="fragment" -->

--

## What *is* a programming language?

I imagine that each of y'all are here today because you know one or two.

**Exercise 3**: Shout out a programming language you know. The more obscure, the better!

<!-- No more than three minutes. -->

--

### Our definition for today

<!-- Programming languages can be a lot of things, in part because there are so many! To make sure we're all on the same page, we'll forward one of many valid definitions.  -->

**Programs** encode the instructions necessary to do a task. <!-- .element: class="fragment" -->

**Programming languages** (PLs) are tools for describing programs. <!-- .element: class="fragment" -->

A PL adheres to a **grammar** and defines a **semantics**, which dictates what programs are valid and what they will do when you run them. <!-- .element: class="fragment" -->

<!-- This definition, while already quite abstract, doesn't necessarily capture all programs and all PLs! -->

--

### Example: TypeScript

```ts
function add(x: number, y: number) {
    return x + y
}

add(1, 1) // => 2
```

--

## Intro to Lambda Calculus

<img width="30%" src="https://wikimedia.org/api/rest_v1/media/math/render/svg/7aa284718745826bd142338fc1e6110582f46583" />


"LC" for short. Occasionally written as "λ-calculus" or "λC" by nerds.

Created in the 1930s at Princeton University by legendary mathematician Alonzo Church, thesis advisor of the equally legendary Alan Turing. <!-- .element: class="fragment" -->

Captures all of computation in a few elegant* rules. <!-- .element: class="fragment" -->

--

![Man in suit smiling.](https://upload.wikimedia.org/wikipedia/en/a/a6/Alonzo_Church.jpg)

--

### A Taste of LC

In LC, the only things you can construct are **lambdas**, functions of one *argument* that return their inner expression, the *body*:

```ts
x -> x
```

--

With **application**, we can pass values to lambdas by "calling" them.

```ts
(x -> x)(y)
// evaluates to…
y
```

--

And that's it! With just these two ideas, Church realized that much of computer science can be described.

Let's evaluate some expressions by hand to make sure we understand this thing.

--

#### Syntax

**Exercise 4**: Determine if the following strings *look* right. We'll let you know when to shout out an answer.

<!-- 
[!! Make sure this doesn't get erased in anticipation of chunk 1!!]

Go to blackboard!

Warmup: x -> x [valid]
Parentheses: (x -> x) [valid]
Different variable name: y -> y [valid]
Long variable names: abc -> abc [valid]
Free variables: x -> y [valid]
Empty body: x -> [invalid]
Empty argument: -> x [invalid]
Two arguments: (x, y) -> y [invalid]
Empty string: "" [invalid]
Two expressions: x y [invalid]
Application 1: x(z) [valid]
Application 2: (x)z [invalid]
Application 3: (x -> x)(z) [valid]
Application 4: x -> x(z) [valid; equiv to x -> (x(z))]
-->

--

A string is a *syntactically valid* LC program if it fulfills the following properties:

It must contain exactly one expression. <!-- .element: class="fragment" -->

That expression is either a lambda declaration, an **abstraction**; an **application**; or a **variable**. <!-- .element: class="fragment" -->

An abstraction has exactly one argument and exactly one expression as its body, separated by an arrow. <!-- .element: class="fragment" -->

An application is an expression next to another encased in parentheses. <!-- .element: class="fragment" -->

We can use parentheses to control order of operations. <!-- .element: class="fragment" -->

To think about: How can we more precisely state what is a syntactically valid string? <!-- .element: class="fragment" -->

<!-- Pause for questions (15 seconds!). -->

--

#### Execution Semantics

Now that we know what programs we can write, let's begin to understand what they can do.

**Exercise 5**: Simplify the following expressions. We'll let you know when to shout out an answer.

<!-- 
[!! Make sure this doesn't get erased in anticipation of chunk 1!!]

Go to blackboard!

Warmup: x -> x => x -> x
Variables: x => x
Substitution 1: (x -> x)(y) => y
Partial application: (x -> (y -> x(y)))(z) => y -> z(y)
Full application: (x -> (y -> x(y)))(z)(w) => (y -> z(y))(w) => z(w)
Closure 1: (x -> (x -> x))(y) => x -> x
!=> x -> y
Closure 2: (x -> (z -> x))(z) => y -> y(z)
!=> z -> z(z)
-->

--

Execution in the lambda calculus is just *simplification*!

<!-- Pause for questions. (15 seconds!) -->

Abstractions and variables cannot be simplified further; they are **values**. <!-- .element: class="fragment" -->

Two abstractions are equivalent if they differ only in their arguments. <!-- .element: class="fragment" -->

Application consists of taking your input expression, and putting it everywhere the argument is in the body expression. <!-- .element: class="fragment" -->

We need to be careful about re-using variable names in an expression; the rules that govern simplification in this regard are called **closure**. <!-- .element: class="fragment" -->

To think about: How would we implement simplification as a algorithm on a computer? <!-- .element: class="fragment" -->

<!-- Pause for questions (15 seconds!). -->

--

The lambda calculus is cool and all, but it kinda sucks as a programming language. *There's only functions!*

We can crudely use abstractions as a way to represent data like numbers (see: Church numerals), but they are hard to work with and quite slow computationally. <!-- .element: class="fragment" -->

*Can we just drop stuff like booleans and integers into the lambda calculus?* <!-- .element: class="fragment" -->

--

### Simply Typed Lambda Calculus

<img width="30%" src="https://wikimedia.org/api/rest_v1/media/math/render/svg/d2115231ef049e19d47c1dffcc25a9c31d70d6d1" />

The **simply typed lambda calculus** (STLC) gives us a way forward!

Created by Church (still) at Princeton in 1940. <!-- .element: class="fragment" -->

Introduces **types** to the LC, allowing us to support data beyond abstractions! <!-- .element: class="fragment" -->

Also makes it harder to write nonsense programs by *type-checking* them. <!-- .element: class="fragment" -->

--

### A Taste of Pai

The language based on the STLC we'll be developing today.

```ts
// Logical implication
let
  implies: fn[bool,fn[bool, bool]]
    = x: bool -> y: bool -> or(not(x))(y)
in implies(true)(false)
//  = false : boolean
```

--

```ts
// Polynomials
let
  polynomial: fn[int, fn[int, fn[int, fn[int, int]]]]
    = a: int -> b: int -> c: int -> x: int -> 
    add(mul(a)(mul(x)(x)))(add(mul(b)(x))(c))
in polynomial(1)(2)(3)(4)
//  = 27 : int
```

--

## Break 1

**Exercise 6**: Look at some cats to wash down all the math you just ate (three (3) minute break).

--

## Writing a PL

Armed with knowledge of the STLC, we go off to write an implementation…

--

### Introduction to Parsing

One of the most important parts of creating a language is deciding *how it shall be written*.

Describing this is the purpose of a **grammar**. Think of it as a bouncer that decides whether a string gets in. <!-- .element: class="fragment" -->

The act of determining if a string is valid (and later transforming it into something more useful), is called **parsing**. <!-- .element: class="fragment" -->

Huh, we've already had some practice with this earlier! <!-- .element: class="fragment" -->

--

Grammars can be described in many ways. <!-- Us talking it out on the board earlier is very valid! -->

One way they can be described is through **Backus-Naur form**, or BNF, a notation created by computer scientists John Backus and Peter Naur in the 1960s.

--

Let's work through the syntax and semantics of BNF on the blackboard.

<!-- 
Talk through what each operator does; work through examples like in exercises 4, 5.

On blackboard:

Legend for BNF syntax:

Expressions:
- Strings: "cats"
"cats" [valid]; "dogs" [invalid]
- Tuple (sequences of expressions): "cats", "dogs", "geckos"
"cats dogs geckos" [valid]; "cats geckos dogs" [invalid]
- Union ("or"): "cats" | "dogs"
"cats" [valid]; "dogs" [valid]; "geckos" [invalid]
- Optional (expression or the empty string): "cats"? === ("cats" | "")
"cats" [valid]; "cats cats cats cats" [valid]; "" [invalid]
- Array: (zero or more of the expression) "cats"*
Rules:
- Declaration: <name> ::= expression
- Reference: <name>
<animal> ::= "cats" | "dogs"
<sentence> ::= "I like" <animal>
"I like cats" [valid]; "I like dogs" [valid]; ""


We'll keep this on the board for your reference.
-->

--

With that out of the way, y'all now have everything you need to start writing some code.

Talk is cheap; **time for programming!**

--

## Chunk 1: Literals

We'll first start by implementing a language even simpler than the untyped lambda calculus: one with integers, booleans, and nothing more.

<!-- This is so y'all can get used to the loop of thinking through the design, and then expressing it in code. -->

--

How do we parse a number? A boolean?

**Exercise 7**: Take two (2) minutes to think through what the grammar would be for integers and booleans. <!-- .element: class="fragment" -->

(Hint: Break down a number into its constituent parts, represent each with rules, and then combine them together with references.) <!-- .element: class="fragment" -->

--

<!--

OK, what did y'all come up with? Well, I imagine saying a grammar out loud and y'all tell me if it looks right.

Okay, so booleans look like this right?
<boolean> ::= "true"
[you forgot "false"!]
Ah, my bad. :P
<boolean> ::= "true" | "false"

-->

```
<boolean> ::= "true" | "false"
```

<!--

So, integers?

[write -1234567890 on blackboard]

They have this little dash which tells us they're negative, but it isn't always there. After that, we have one or more digits, the numerals zero through nine, which tell us the magnitude.

So, we can write the parsing rule in two parts. First, we need to describe what a digit is:

<digit> ::= "0" | "1" | "2" | … | "8" | "9"
I leave out the middle ones because we don't have all day.
-->

--

```
<digit> ::= "0" | "1" | "2" | … | "8" | "9"
```

<!--

Then we can describe what an integer is:
<integer> ::= "-"? <digit> <digit>*

We can use a tuple of <expr> and <expr>* to create a "one or more" rule.

-->

--

```
<digit> ::= "0" | "1" | "2" | … | "8" | "9"
<integer> ::= "-"? <digit> <digit>*
```

<!-- Nice. -->

--

<!-- We can combine them into a single <expr> rule: -->

```
<expr> ::= <boolean> | <integer>
<boolean> ::= "true" | "false"
<digit> ::= "0" | "1" | "2" | … | "8" | "9"
<integer> ::= "-"? <digit> <digit>*
```

--

So, how do we simplify booleans and integers? 

<!--

Gesture to students?
["you can't!"]

Sounds about right!

-->

--

```ts
evaluate("true") == true
evaluate("false") == false
evaluate("1") == 1
// extrapolate out to all other integers
```

<!--

Can't simplify the core values of Pai much further than this.

Note that we're skipping over how the string "true" becomes the value `true`; this'll be made much more clear when we start coding.

-->

--

Time to code!

<!-- Now that we've gamed out the syntax and semantics of integers and booleans (at least those objects on their own), now we can begin writing our implementation! [switch to notebook] -->

--

## Chunk 2: Functions

Let's play the same "game" of syntax, semantics, and implementation to add functions to Pai.

--

<!-- Alright, you know the drill: -->

**Exercise 8**: Take three (3) minutes to think about what a grammar for variables and functions would look like.

(Hint: Refer to the examples on the board! Your grammar should depend on *and* modify `<expr>`.) <!-- .element: class="fragment" -->

--

<!--

Alright, let's start working through this.
So as we discussed earlier, an abstraction has a single argument and a body expression, separated by an arrow.
So, something like this right?

<abstraction> ::= <binding> "->" <expr>

We'll call the argument in an abstraction a "binding."

Nice. Of course, we haven't defined <biding> yet, but we can do that pretty easily; it's just a variable name:

<letter> ::= "A" | "B" | … | "Z" | "a" | "b" | … | "z"
<identifier> ::= <letter> <letter>*
<binding> ::= <identifier>

One might expect to be able to put more characters in their identifiers, but this'll do for now.

The other half of implementing the syntax of functions is application, but we figured that earlier too: it's just an expression next to another expression in parentheses:

<application> ::= <expr> "(" <expr> ")"

Variables come along for the ride, too.

<variable> ::= <identifier>

Finally, since <abstraction> and <application> are both kinds of expression, our <expr> rule grows ever larger:

<expr> ::= <boolean> | <integer> | <abstraction> | <application> | <variable>

And that's it for functions! Nice.
-->

```
<abstraction> ::= <binding> "->" <expr>
<letter> ::= "A" | "B" | … | "Z" | "a" | "b" | … | "z"
<identifier> ::= <letter> <letter>*
<binding> ::= <identifier>
<application> ::= <expr> "(" <expr> ")"
<variable> ::= <identifier>
<expr> ::= <boolean> | <integer> | <abstraction> | <application> | <variable>
```

--

So, how are we going to evaluate these guys?

<!-- The core concept we need is closure.  -->

With closure! <!-- .element: class="fragment" -->

<!-- Let's go through it quickly by looking at some JavaScript. -->

--

**Exercise 9**: Consider the following JavaScript code.

```ts
let x = 5

x // => ?
```

What will the last line evaluate to?

<!--

[Five!]

Exactly; no surprises there.

-->

--

<!-- What about this? -->

**Exercise 10**: Consider the following JavaScript code.

```ts
let x = 5 

function f() {
  let x = 6
}
f()

x // => ?
```

What will the last line evaluate to?

<!-- 

[Still five!]

Yup! Even though there's a variable named `x` in the body of `f`, that doesn't alter what `x` is at that top line. We call this phenomenon scope.

-->

--

### Scope

If, in a **scope**, you declare a variable `x` which was present in the previous scope, you get to start fresh *and* not affect the outer scope once you're done.


```ts
// start scope 0 (top level)

let x = 5 

function f() {
  // start scope 1
  let x = 6
  // end scope 1
}
f() // enter and exit scope 1

x // => 5

// end scope 0
```

<!--

[use chalk to mark contexts of scope]

What's happening becomes much more obvious when we label when the scopes of our program.
First, we enter scope 0, traditionally called the top level.
We let `x` be `5`.
Then, we call `f`, causing us to enter scope 1.
We let a new, distinct `x` be `6`.
Then we leave scope 1, which causes us to forget this new `x`.
Now back in the top level, we check on our old `x`, and we find that it still contains 5.

We should be pretty happy that this is the case, right?
Imagine if you had to give each variable and binding in your program a unique name; that would be nightmarish.

Let's take a look at a few more programs to make sure we fully get this.

-->

--

**Exercise 11**: Consider the following JavaScript code.

```ts
let x = 5 

function f() {
  return x + 1
}

f() // => ?
```

What will the last line evaluate to?

<!--

[Six!]

Yup. Because we didn't create a new `x` inside of the body of `f`, scope 1, Javascript gives us access to the `x` in the top level.

-->

--

<!-- This is one half of closure: we get to reference variables from earlier scopes. -->

**1st fundamental principle of closure**: If you don't declare a variable `x` inside of your current scope, you get to use `x` from the outer scope.



--

<!-- The other half is best represented with this program: -->

**Exercise 12**: Consider the following JavaScript code.

```ts
function f() {
  let y = 100;
  return () => {
    return y
  }
}

let g = f()
g() // => ?
```

What will the last line evaluate to?

<!-- 

[One hundred?]

Yes! Let's take a closer look at the scopes to get an understanding of what's going on here.

-->

--

```ts
// start scope 0

function f() {
  // start scope 1

  let y = 100;
  return () => {
    // start scope 2

    return y

    // start scope 2
  }
  
  // end scope 1
}

let g = f() // enter and exit scope 1
g() // enter and exit scope 2 => 100

// end scope 0
```

<!--

We have three scopes this time.
It looks like the function returned in `f` is not only inheriting scope 1, but then *carrying it around*, long after we've exited them.

-->

--

<!-- This is the heart of the second half of closure: functions carry their scopes with them. -->

**2nd fundamental principle of closure**: Functions carry their scopes with them, *even if their parent scopes have closed*. This is called a **context**.

<!-- We already saw this in exercises 10 and 11, but it becomes most obvious when we start creating functions that return functions. -->

--

**1st fundamental principle of closure**: If you don't declare a variable `x` inside of your current scope, you get to use `x` from the outer scope.

**2nd fundamental principle of closure**: Functions carry their scopes with them, *even if their parent scopes have closed*. This is called a **context**.

<!--

Closure is what enables us to treat function evaluation like simplification while still getting all the nice benefits of abstract syntax.
It's a very powerful concept.

-->

--

Time to code again!

<!-- With that, implementing functions should be an easy task. Let's switch back to Skylar to start coding. -->

--

## Chunk 3: Types

--

## Chunk 4: Builtins and FFI

--

## Chunk 5: A Real Programming Language

--

## What next?

