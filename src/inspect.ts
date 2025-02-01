import { Runtime } from "@kawcco/parsebox";
import type { Module, IParser } from "@kawcco/parsebox";
import { assertEquals } from "jsr:@std/assert";

export function inspectGrammar(module: Module): string {
	// @ts-ignore Deno is being annoying.
	const properties = module['properties']
	return Object.entries(properties)
		.map(([name, parser]) => `${name} ::= ${inspectParser(parser)}`)
		.join('\n\n')
}

export function inspectParser(x: IParser): string {
	if (Runtime.Guard.IsConst(x)) {
		return Deno.inspect(x.value)
	}
	else if (Runtime.Guard.IsTuple(x)) {
		return x.parsers.map(inspectParser).join(" ")
	}
	else if (Runtime.Guard.IsUnion(x)) {
		return x.parsers.map(inspectParser).join(" | ")
	}
	else if (Runtime.Guard.IsArray(x)) {
		return `(${inspectParser(x.parser)})*`
	}
	else if (Runtime.Guard.IsOptional(x)) {
		return `(${inspectParser(x.parser)})?`
	}
	else if (Runtime.Guard.IsIdent(x) || Runtime.Guard.IsNumber(x)) {
		return `<${x.type}>`
	}
	else if (Runtime.Guard.IsString(x)) {
		return `<${x.type}<${Deno.inspect(x.options)}>>`
	}
	else if (Runtime.Guard.IsRef(x)) {
		return `<${x.ref}>`
	}
	else {
		// @ts-ignore Deno is being annoying
		throw new Error(`Unexpected parser type: ${x.type}`);	
	}
}

Deno.test({
	name: "inspectParser: general exercise",
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
