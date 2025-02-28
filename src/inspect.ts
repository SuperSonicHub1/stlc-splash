import { Runtime } from "@kawcco/parsebox";
import type { Module, IParser } from "@kawcco/parsebox";
import { assertEquals } from "jsr:@std/assert";
import { InspectOutput } from "./notebook.ts";
import { Binding, BindingUntyped, Expr, ExprType, Type, TypeType } from "./ast.ts";
import { Value, ValueType } from "./eval.ts";

export function inspectGrammar(module: Module, output: InspectOutput = InspectOutput.Plain): string {
	// @ts-ignore Deno is being annoying.
	const properties = module['properties']
	const equals = (output == InspectOutput.Latex ? '&' : '') + "::="
	const base = Object.entries(properties)
		.map(([name, parser]) => {
			const pname = output == InspectOutput.Latex
				? String.raw`\mathsf{${name}}`
				: name
			return `${pname} ${equals} ${inspectParser(parser, output)}`
		})
		.join(output == InspectOutput.Latex ? String.raw`\\` : '\n\n')
	const final = output == InspectOutput.Latex
		? String.raw`\begin{align*}
${base}
\end{align*}`
		: base
	return final
}

export function inspectParser(x: IParser, output: InspectOutput = InspectOutput.Plain): string {
	if (Runtime.Guard.IsConst(x)) {
		return output == InspectOutput.Latex
			? String.raw`\texttt{${Deno.inspect(x.value)}}`
			: Deno.inspect(x.value)
	}
	else if (Runtime.Guard.IsTuple(x)) {
		return x.parsers.map(x => inspectParser(x, output)).join(
			output == InspectOutput.Latex ? String.raw` \: ` : " "
		)
	}
	else if (Runtime.Guard.IsUnion(x)) {
		return x.parsers.map(x => inspectParser(x, output)).join(
			output == InspectOutput.Latex ? String.raw` \mid ` : " | "
		)
	}
	else if (Runtime.Guard.IsArray(x)) {
		return `(${inspectParser(x.parser, output)})*`
	}
	else if (Runtime.Guard.IsOptional(x)) {
		return `(${inspectParser(x.parser, output)})?`
	}
	else if (Runtime.Guard.IsIdent(x) || Runtime.Guard.IsNumber(x)) {
		return output == InspectOutput.Latex
			? String.raw`\mathsf{${x.type}}`
			: `<${x.type}>`
	}
	else if (Runtime.Guard.IsString(x)) {
		return output == InspectOutput.Latex
			? String.raw`\mathsf{${x.type}}[${x.options.map(x => String.raw`\texttt{${Deno.inspect(x)}}`).join(', ')}]`
			: `<${x.type}<${Deno.inspect(x.options)}>>`
	}
	else if (Runtime.Guard.IsRef(x)) {
		return output == InspectOutput.Latex
			? String.raw`\mathsf{${x.ref}}`
			: `<${x.ref}>`
	}
	else {
		throw new Error(`Unexpected parser type: ${x.type}`);
	}
}

// TODO(supersonichub1): Test LaTeX output
Deno.test({
	name: "inspectParser: general exercise for Plain",
	fn() {
		assertEquals(inspectParser(Runtime.Const('a')), '"a"')
		assertEquals(
			inspectParser(Runtime.Tuple([Runtime.Const('a'), Runtime.Const('b')])),
			'"a" "b"'
		)
		assertEquals(
			inspectParser(Runtime.Union([Runtime.Const('a'), Runtime.Const('b')])),
			'"a" | "b"'
		)
		assertEquals(inspectParser(Runtime.Array(Runtime.Const('a'))), '("a")*')
		assertEquals(inspectParser(Runtime.Optional(Runtime.Const('a'))), '("a")?')
		assertEquals(inspectParser(Runtime.Ident()), '<Ident>')
		assertEquals(inspectParser(Runtime.Number()), '<Number>')
		assertEquals(inspectParser(Runtime.String(['"'])), `<String<[ '"' ]>>`)
		assertEquals(inspectParser(Runtime.Ref('A')), '<A>')
	}
})

export function inspectExpr(expr: Expr, output: InspectOutput = InspectOutput.Plain, mayNeedParen = false): string {
	switch (expr.type) {
		case ExprType.Application: return `${inspectExpr(expr.lambda, output, true)}(${inspectExpr(expr.argument, output)})`
		case ExprType.Abstraction: {
			const base = output === InspectOutput.Latex
				? `${inspectBinding(expr.binding, output)} \\to ${inspectExpr(expr.body, output)}`
				: `${inspectBinding(expr.binding, output)} -> ${inspectExpr(expr.body, output)}`
			return mayNeedParen ? `(${base})` : base
		}
		case ExprType.Let: {
			const base = output === InspectOutput.Latex
				? `\\text{let} \\ ${inspectBinding(expr.binding, output)} = ${inspectExpr(expr.boundTo, output)} \\ \\text{in} \\ ${inspectExpr(expr.boundIn, output)}`
				: `let ${inspectBinding(expr.binding, output)} = ${inspectExpr(expr.boundTo, output)} in ${inspectExpr(expr.boundIn, output)}`
			return mayNeedParen ? `(${base})` : base
		}
		case ExprType.Var: return output === InspectOutput.Latex
			? `\\text{${expr.name}}`
			: expr.name
		case ExprType.Ternary: {
			const base = output === InspectOutput.Latex
				? `\\text{if} \\ ${inspectExpr(expr.condition, output)} \\ \\text{then} \\ ${inspectExpr(expr.positive, output)} \\ \\text{else} \\ ${inspectExpr(expr.negative, output)}`
				: `if ${inspectExpr(expr.condition, output)} then ${inspectExpr(expr.positive, output)} else ${inspectExpr(expr.negative, output)}`
			return mayNeedParen ? `(${base})` : base
		}
		case ExprType.LiteralInt: return output === InspectOutput.Latex
			? `\\text{${expr.value}}`
			: `${expr.value}`
		case ExprType.LiteralBool: return output === InspectOutput.Latex
			? `\\text{${expr.value}}`
			: `${expr.value}`
	}
}
export function inspectBinding(binding: Binding | BindingUntyped, output: InspectOutput = InspectOutput.Plain): string {
	return `${output === InspectOutput.Latex ? `\\text{${binding.name}}` : binding.name}${binding.type !== null ? `: [${inspectType(binding.type, output)}]` : ""}`
}
export function inspectType(type: Type, output: InspectOutput = InspectOutput.Plain, mayNeedParen = false): string {
	switch (type.type) {
		case TypeType.Int: return output === InspectOutput.Latex ? "\\mathsf{Int}" : "int"
		case TypeType.Bool: return output === InspectOutput.Latex ? "\\mathsf{Bool}" : "bool"
		case TypeType.Function: {
			const base = output === InspectOutput.Latex
				? `${inspectType(type.argumentType, output, true)} \\to ${inspectType(type.returnType, output)}`
				: `${inspectType(type.argumentType, output, true)} -> ${inspectType(type.returnType, output)}`
			return mayNeedParen ? `(${base})` : base
		}
	}
}

export function inspectValue(value: Value, output: InspectOutput = InspectOutput.Plain): string {
	switch (value.type) {
		case ValueType.Int:
		case ValueType.Bool:
			return `${value.value}`
		case ValueType.Function:
			return `${value.binding} ${output === InspectOutput.Plain ? '->' : '\\to'} ${inspectExpr(value.body, output)}`
		case ValueType.FunctionNative:
			return output === InspectOutput.Plain ? value.name : `\\operatorname{${value.name}}`
	}
}
