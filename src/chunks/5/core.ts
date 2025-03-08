import { Ident, Type, TypeType } from "./ast.ts"
import { Value, ValueType } from "./eval.ts"
import { inspectValue } from "../../inspect.ts"

const typename = (v: Value) => ({ number: "int", boolean: "bool", object: "fn" } as Record<string, string>)[typeof v]
const expectInt = (v: Value) => (v.type === ValueType.Int) ? v.value : (() => { throw new Error("Runtime eval error: expected type int found " + typename(v)) })()
const expectBool = (v: Value) => (v.type === ValueType.Bool) ? v.value : (() => { throw new Error("Runtime eval error: expected type bool found " + typename(v)) })()

const T = {
    int: { type: TypeType.Int } satisfies Type,
    bool: { type: TypeType.Bool } satisfies Type,
    fn: (argumentType: Type, returnType: Type): Type =>
        ({ type: TypeType.Function, argumentType, returnType }),
} as const

const t_fn_int_bool = T.fn(T.int, T.bool)
const t_fn_int_int = T.fn(T.int, T.int)
const t_fn_bool_bool = T.fn(T.bool, T.bool)
const t_fn_int_int_int = T.fn(T.int, T.fn(T.int, T.int))
const t_fn_int_int_bool = T.fn(T.int, T.fn(T.int, T.bool))
const t_fn_bool_bool_bool = T.fn(T.bool, T.fn(T.bool, T.bool))

type JSValue = number | boolean | Value

function toValue(x: number | boolean | Value): Value {
    switch (typeof x) {
        case 'number':
            return { type: ValueType.Int, value: x }
        case 'boolean':
            return { type: ValueType.Bool, value: x }
        default:
            return x
    }
}

function impl_native<N extends string, T>(
    name: N,
    ty: (v: Value) => T,
    fn: (v: T) => JSValue,
): Value & { name: N } {
    return {
        type: ValueType.FunctionNative,
        eval: v => toValue(fn(ty(v))),
        name,
    }
}
function impl_native_2<N extends string, A, B>(
    name: N,
    ty_a: (v: Value) => A,
    ty_b: (v: Value) => B,
    fn: (a: A, b: B) => JSValue,
): Value & { name: N } {
    return {
        type: ValueType.FunctionNative,
        eval: a => ({
            type: ValueType.FunctionNative,
            eval: b => toValue(fn(ty_a(a), ty_b(b))),
            name: `${name}(${inspectValue(a as never)})`, // @fixme(scidev5) find some better way to suppress this typeerror.
        }),
        name,
    }
}

type CoreNames =
    | "odd"
    | "even"
    | "neg"
    | "add"
    | "sub"
    | "mul"
    | "eq"
    | "greater"
    | "less"
    | "not"
    | "and"
    | "nand"
    | "or"
    | "nor"
    | "xor"
    | "xnor"
/// @impl a few functions
const CORE: () => { [k in CoreNames]: [Type, Value & { name: k }] } = () => ({
    odd: [
        t_fn_int_bool,
        impl_native("odd", expectInt, v => v % 2 === 1)],
    even: [
        t_fn_int_bool,
        impl_native("even", expectInt, v => v % 2 === 0)],
    neg: [
        t_fn_int_int,
        impl_native("neg", expectInt, v => -v)],

    add: [
        t_fn_int_int_int,
        impl_native_2("add", expectInt, expectInt, (a, b) => a + b)],
    sub: [
        t_fn_int_int_int,
        impl_native_2("sub", expectInt, expectInt, (a, b) => a - b)],
    mul: [
        t_fn_int_int_int,
        impl_native_2("mul", expectInt, expectInt, (a, b) => a * b)],

    eq: [
        t_fn_int_int_bool,
        impl_native_2("eq", expectInt, expectInt, (a, b) => a === b)],
    greater: [
        t_fn_int_int_bool,
        impl_native_2("greater", expectInt, expectInt, (a, b) => a > b)],
    less: [
        t_fn_int_int_bool,
        impl_native_2("less", expectInt, expectInt, (a, b) => a < b)],

    not: [
        t_fn_bool_bool,
        impl_native("not", expectBool, v => !v)],
    and: [
        t_fn_bool_bool_bool,
        impl_native_2("and", expectBool, expectBool, (a, b) => a && b)],
    nand: [
        t_fn_bool_bool_bool,
        impl_native_2("nand", expectBool, expectBool, (a, b) => !(a && b))],
    or: [
        t_fn_bool_bool_bool,
        impl_native_2("or", expectBool, expectBool, (a, b) => a || b)],
    nor: [
        t_fn_bool_bool_bool,
        impl_native_2("nor", expectBool, expectBool, (a, b) => !(a || b))],
    xor: [
        t_fn_bool_bool_bool,
        impl_native_2("xor", expectBool, expectBool, (a, b) => a !== b)],
    xnor: [
        t_fn_bool_bool_bool,
        impl_native_2("xnor", expectBool, expectBool, (a, b) => a === b)],
} as const)

export const CORE_TYPES: () => Record<Ident, Type> =
    () => Object.fromEntries(Object.entries(CORE)
        .map(([name, [type, _]]) => [name, type])
    )
export const CORE_VALUES: () => Record<Ident, Value> =
    () => Object.fromEntries(Object.entries(CORE)
        .map(([name, [_, value]]) => [name, value])
    )