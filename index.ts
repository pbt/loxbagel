import readline from 'node:readline/promises';

import { Lox } from '@/lox';

function main() {
	const lox = new Lox();
	const args = process.argv.slice(2) as string[];
	if (args.length > 1) {
		console.log("Usage: loxbagel [script]");
		process.exit(64);
	} else if (args.length == 1) {
		runFile(lox, args[0]);
	} else {
		runPrompt(lox);
	}
}

async function runFile(lox: Lox, path: string) {
	const file = Bun.file(path);
	lox.run(await file.text());
	if (lox.hadError) {
		process.exit(65);
	}
}

async function runPrompt(lox: Lox) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	for (; ;) {
		const line = await rl.question('> ');
		if (line.length <= 0) {
			break;
		}
		lox.run(line);
		lox.clearError();
	}
}

main();
