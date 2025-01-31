import { Type, TypeType } from "./ast.ts";
import { Value } from "./eval.ts";

const typename = (v: Value) => ({ number: "int", boolean: "bool", object: "fn" } as Record<string, string>)[typeof v]
const expectInt = (v: Value) => (typeof v === "number") ? v : (() => { throw new Error("Runtime eval error: expected type int found " + typename(v)) })()
const expectBool = (v: Value) => (typeof v === "boolean") ? v : (() => { throw new Error("Runtime eval error: expected type bool found " + typename(v)) })()

const T = {
    int: { type: TypeType.Int } satisfies Type,
    bool: { type: TypeType.Bool } satisfies Type,
    fn: (argumentType: Type, returnType: Type): Type =>
        ({ type: TypeType.Function, argumentType, returnType }),
} as const

const t_fn_int_bool = T.fn(T.int, T.bool)
const t_fn_int_int = T.fn(T.int, T.int)
const t_fn_bool_bool = T.fn(T.int, T.int)
const t_fn_int_int_int = T.fn(T.int, T.fn(T.int, T.int))
const t_fn_int_int_bool = T.fn(T.int, T.fn(T.int, T.int))
const t_fn_bool_bool_bool = T.fn(T.int, T.fn(T.int, T.int))

const CORE: Record<string, [Type, Value]> = {
    odd: [
        t_fn_int_bool,
        n => expectInt(n) % 2 === 1],
    even: [
        t_fn_int_bool,
        n => expectInt(n) % 2 === 0],
    neg: [
        t_fn_int_int,
        n => -expectInt(n)],

    add: [
        t_fn_int_int_int,
        a => b => expectInt(a) + expectInt(b)],
    sub: [
        t_fn_int_int_int,
        a => b => expectInt(a) - expectInt(b)],
    mul: [
        t_fn_int_int_int,
        a => b => expectInt(a) * expectInt(b)],

    eq: [
        t_fn_int_int_bool,
        a => b => expectInt(a) === expectInt(b)],
    greater: [
        t_fn_int_int_bool,
        a => b => expectInt(a) > expectInt(b)],
    less: [
        t_fn_int_int_bool,
        a => b => expectInt(a) < expectInt(b)],

    not: [
        t_fn_bool_bool,
        x => !expectBool(x)],
    and: [
        t_fn_bool_bool_bool,
        a => b => expectBool(a) && expectBool(b)],
    nand: [
        t_fn_bool_bool_bool,
        a => b => !(expectBool(a) && expectBool(b))],
    or: [
        t_fn_bool_bool_bool,
        a => b => expectBool(a) || expectBool(b)],
    nor: [
        t_fn_bool_bool_bool,
        a => b => !(expectBool(a) || expectBool(b))],
    xor: [
        t_fn_bool_bool_bool,
        a => b => expectBool(a) !== expectBool(b)],
    xnor: [
        t_fn_bool_bool_bool,
        a => b => expectBool(a) === expectBool(b)],
} as const

export const CORE_TYPES: Record<string, Type> =
    Object.fromEntries(Object.entries(CORE)
        .map(([name, [type, _]]) => [name, type])
    )
export const CORE_VALUES: Record<string, Value> =
    Object.fromEntries(Object.entries(CORE)
        .map(([name, [_, value]]) => [name, value])
    )