import { Runtime } from "@kawcco/parsebox";
import type { Module, IParser } from "@kawcco/parsebox";
import { assertEquals } from "jsr:@std/assert";
import { richLatexGen } from "./notebook.ts";

enum GrammarOutput {
	Plain,
	Latex,
}
export function inspectGrammar(module: Module, output: GrammarOutput = GrammarOutput.Plain): string {
	// @ts-ignore Deno is being annoying.
	const properties = module['properties']
	const equals = (output == GrammarOutput.Latex ? '&' : '') + "::="
	const base = Object.entries(properties)
		.map(([name, parser]) => {
			const pname = output == GrammarOutput.Latex
				? String.raw`\mathsf{${name}}`
				: name
			return `${pname} ${equals} ${inspectParser(parser, output)}`
		})
		.join(output == GrammarOutput.Latex ? String.raw`\\` : '\n\n')
	const final = output == GrammarOutput.Latex
		? String.raw`\begin{align*}
${base}
\end{align*}`
		: base
	return final
}

export function inspectGrammarJupyter(module: Module): Record<string, string> {
	const plain = inspectGrammar(module, GrammarOutput.Plain)
	const latex = inspectGrammar(module, GrammarOutput.Latex)
	return { ...richLatexGen(latex, true), 'text/plain': plain }
}

export function inspectParser(x: IParser, output: GrammarOutput = GrammarOutput.Plain): string {
	if (Runtime.Guard.IsConst(x)) {
		return output == GrammarOutput.Latex
			? String.raw`\texttt{${Deno.inspect(x.value)}}`
			: Deno.inspect(x.value)
	}
	else if (Runtime.Guard.IsTuple(x)) {
		return x.parsers.map(x => inspectParser(x, output)).join(
			output == GrammarOutput.Latex ? String.raw` \: ` : " "
		)
	}
	else if (Runtime.Guard.IsUnion(x)) {
		return x.parsers.map(x => inspectParser(x, output)).join(
			output == GrammarOutput.Latex ? String.raw` \mid ` : " | "
		)
	}
	else if (Runtime.Guard.IsArray(x)) {
		return `(${inspectParser(x.parser, output)})*`
	}
	else if (Runtime.Guard.IsOptional(x)) {
		return `(${inspectParser(x.parser, output)})?`
	}
	else if (Runtime.Guard.IsIdent(x) || Runtime.Guard.IsNumber(x)) {
		return output == GrammarOutput.Latex
			? String.raw`\mathsf{${x.type}}`
			: `<${x.type}>`
	}
	else if (Runtime.Guard.IsString(x)) {
		return output == GrammarOutput.Latex
			? String.raw`\mathsf{${x.type}}[${x.options.map(x => String.raw`\texttt{${Deno.inspect(x)}}`).join(', ')}]`
			: `<${x.type}<${Deno.inspect(x.options)}>>`
	}
	else if (Runtime.Guard.IsRef(x)) {
		return output == GrammarOutput.Latex
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
