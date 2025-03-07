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

## Lambda Calculus

$$\lambda x . x$$

"LC" for short. Occasionally written as "λ-calculus" or "λC" by nerds.

![Man in suit smiling.](https://upload.wikimedia.org/wikipedia/en/a/a6/Alonzo_Church.jpg)

Created in the 1930s at Princeton University by legendary mathematician Alonzo Church, thesis advisor of the equally legendary Alan Turing. <!-- .element: class="fragment" -->

Captures all of computation in a few elegant* rules. <!-- .element: class="fragment" -->

--

### A Taste of LC

We will return to syntax and semantics when we start implementing the LC.

### Simply Typed Lambda Calculus

===

## Substitution and Pattern Matching



===

