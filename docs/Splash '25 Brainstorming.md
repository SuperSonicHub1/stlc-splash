[Simply typed lambda calculus](https://en.wikipedia.org/wiki/Simply_typed_lambda_calculus)/[System F](https://en.wikipedia.org/wiki/System_F)
in \~2 hours

Strong inspiration from:

- [SML by Dan Grossman](https://www.youtube.com/playlist?list=PL-eVNDa9MNJczU4ZjhJDT8rIcCa12DyAx)
- [“How should I read type system notation?”](https://langdev.stackexchange.com/questions/2692/how-should-i-read-type-system-notation)
  by Alexis King
- [Type systems: Lambda calculus to Hindley-Milner](https://www.youtube.com/playlist?list=PLoyEIY-nZq_uipRkxG79uzAgfqDuHzot-)
  by Adam Jones

Who is this class for:

- someone with intermediate programming experience (at least an APCSA-level
  understanding of coding)
- knows more than one programming language
- some math experience beyond arithmetic (the kind of person who asks for
  clarification about syntax and semantics of math operators during class)
- ideal student
  - conlang/esolang geek
  - code golfer
  - basically high school Kyle

Tools to use:

- TypeScript via Deno
- [ParseBox](https://github.com/sinclairzx81/parsebox): the runtime API is quite
  nice and easy to use
- [@std/assert](https://docs.deno.com/runtime/fundamentals/testing/) (yes, we’re
  going to write unit tests\!)

Four corners (first two kindly yoinked from Grossman):

- syntax: how do I parse this?
- semantics: how does it work?
- interpretation: what are the implications on lambda calculus interpretation?
- inference: what are the implications on type inference?

Teaching style:

- blackboard keeps score of our expanding grammar and semantics, core
  definitions
- [literate programming with Deno](https://docs.deno.com/runtime/reference/cli/jupyter/)
  - literate programming as slides is very good for teaching;
    [see our math department](https://github.com/mitmath/)
  - enables us to pair program with the class without leaving the window
  - can easily answer questions by just creating a new cell
  - document can be repurposed as lecture notes and printed out for students
- we should have two versions of our notebook
  - completed document for printouts, reference
  - “hole” document with incomplete programs which we copy-paste into/pair
    program to fill so we properly show how the sausage is made
- build a programming language modularly
  - first informally
    - explain what we're about to implement and why
    - go into the REPL and show how it works
  - then formally
    - show syntax for a new feature
    - show execution semantics
    - show type system semantics
    - implement syntax
    - implement execution semantics
    - implement type inference
    - test everything along the way
- pause for questions regularly
- take a five-min break every hour; this is probably gonna be a long class :)

Order of operations:

- introduce ourselves
- why is studying programming languages important?
- what _is_ a programming language?
- the (simply typed) lambda calculus, and why it’s a good model of programming
  languages
- “all of math is two things: pattern-matching and substitution”
- intro to
  [Backus-Naur form](https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form),
  ParseBox
- the lambda: grammar, variables, substitution, beta-reduction
- intro to types with the integer
- function types
- let expressions
- ternary expressions
- some demo programs
- conclusion
- where to go from here

Syntax and semantics of our toy language:

- to be discussed further
- a very light version of TypeScript
