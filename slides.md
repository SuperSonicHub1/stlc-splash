---
title: Reveal-MD
theme: serif  # try solarized, serif or white
---

// global

```css
.container {
  overflow: scroll;
  max-height: 90vh;
}
```

===

# Lambda Calculus from Scratch

MIT ESP Splash 2025 • M03 16 2025 Skylar N. Huber, Kyle A. Williams

===

## Abstract

- We are going to write a _programming language_ (PL) from nothing!
- We will use the canonical model for PLs, the _lambda calculus_ (LC), as a
  guide.
- We will extend the LC to support "modern" programming features like `let` and
  `if`.
- Along the way, we will implement good software development practices and
  _y'all_ will write some code!

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

===

## Why study programming languages?

**Exercise 2**: Why are programming languages cool?

<!-- Take three people. -->

--

All software is written in programming languages. If we can design better programming languages, perhaps we can make it easier to write software! <!-- .element: class="fragment" -->

- Writing more correct software <!-- .element: class="fragment" -->
- Making software more accessible <!-- .element: class="fragment" -->
- Solving challenging domain-specific problems <!-- .element: class="fragment" -->

===

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

===

## Intro to Lambda Calculus

```
λx . x
```

"LC" for short. Occasionally written as "λ-calculus" or "λC" by nerds.

![Man in suit smiling.](https://upload.wikimedia.org/wikipedia/en/a/a6/Alonzo_Church.jpg)

Created in the 1930s at Princeton University by legendary mathematician Alonzo Church, thesis advisor of the equally legendary Alan Turing. <!-- .element: class="fragment" -->

Captures all of computation in a few elegant* rules. <!-- .element: class="fragment" -->

===

### A Taste of LC

In LC, the only things you can construct are **lambdas**, functions of one *argument* that return their inner expression, the *body*:

```ts
x -> x
```

Figure 1: The identity function.

--

With **application**, we can pass values to lambdas by "calling" them.

```ts
(x -> x)(y)
// evaluates to…
y
```

Figure 2: Application of the identity function.

--

And that's it! With just these two ideas, Church realized that much of computer science can be described.

Let's evaluate some expressions by hand to make sure we understand this thing.

--

#### Syntax

**Exercise 4**: Determine if the following strings *look* right. We'll let you know when to shout out an answer.

<!-- 
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

- It must contain exactly one expression. <!-- .element: class="fragment" -->
- That expression is either a lambda declaration, an **abstraction**; an application; or a variable. <!-- .element: class="fragment" -->
- An abstraction has exactly one argument and exactly one expression as its body, separated by an arrow. <!-- .element: class="fragment" -->
- An application is an expression next to another encased in parentheses.
- We can use parentheses to control order of operations. <!-- .element: class="fragment" -->

To think about: How can we more precisely state what is a syntactically valid string? <!-- .element: class="fragment" -->

<!-- Pause for questions (15 seconds!). -->

--

#### Execution Semantics

Now that we know what programs we can write, let's begin to understand what they can do.

**Exercise 5**: Simplify the following expressions. We'll let you know when to shout out an answer.

<!-- 
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

- Abstractions and variables cannot be simplified further; they are **values**. <!-- .element: class="fragment" -->
- Two abstractions are equivalent if they differ only in their arguments. <!-- .element: class="fragment" -->
- Application consists of taking your input expression, and putting it everywhere the argument is in the body expression. <!-- .element: class="fragment" -->
- We need to be careful about re-using variable names in an expression; the rules that govern simplification in this regard are called **closure**. <!-- .element: class="fragment" -->

To think about: How would we implement simplification as a algorithm on a computer? <!-- .element: class="fragment" -->

<!-- Pause for questions (15 seconds!). -->

===

The lambda calculus is cool and all, but it kinda sucks as a programming language. *There's only functions*!

We can crudely use abstractions as a way to represent data like numbers (see: Church numerals), but they are hard to work with and quite slow computationally. <!-- element: class="fragment" -->

*Can we just drop stuff like booleans and integers into the lambda calculus* <!-- element: class="fragment" -->

--

### Simply Typed Lambda Calculus

```
λx : τ . x
```

The **simply typed lambda calculus** (STLC) gives us a way forward!

Created by Church (still) at Princeton in 1940. <!-- .element: class="fragment" -->

Introduces **types** to the LC, allowing us to support data beyond abstractions! <!-- .element: class="fragment" -->

Also makes it harder to write nonsense programs by *type-checking* them. <!-- .element: class="fragment" -->

===

### A Taste of Pai

The language based on the STLC we'll be developing today.

<!-- TODO(supersonichub1): Show some nice example programs. -->

===

### End of Section

**Exercise 6**: Look at some cats to wash down all the math you just ate (three (3) minute break).

===

## Writing a PL

--

### Chunk N: <>

===

## What next?

