import katex from 'npm:katex'

const stylesheet = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib" crossorigin="anonymous">`


export enum InspectOutput {
	Plain,
	Latex,
}
export function displayJupyterInspector<T>(inspect: (value: T, output: InspectOutput) => string, value: T, displayMode: boolean = true): Record<string, string> {
	const plain = inspect(value, InspectOutput.Plain)
	const latex = inspect(value, InspectOutput.Latex)
	return { ...richLatexGen(latex, displayMode), 'text/plain': plain }
}

function richLatexGen(code: string, displayMode: boolean = false): Record<string, string> {
	const braces = displayMode ? "$$" : "$"
	return {
		'text/plain': code,
		'text/markdown': `${braces}${code}${braces}`,
		'text/html': stylesheet + katex.renderToString(code, {
			throwOnError: false,
			displayMode,
		})
	}
}


/**
 * Simple class for testing {@link richLatexGen}.
 */
export class Latex {
	constructor(private code: string, private displayMode: boolean = false) { }

	[Deno.jupyter.$display]() {
		return richLatexGen(this.code, this.displayMode)
	}
}

/**
 * Simple class for testing {@link richLatexGen}.
 */
export class Inspect<T> {
	constructor(private inspector: (value: T, output: InspectOutput) => string, private value: T, private displayMode: boolean = true) { }

	[Deno.jupyter.$display]() {
		return displayJupyterInspector(this.inspector, this.value, this.displayMode)
	}
}