import { Scanner } from '@/scanner';

import type { Error } from '@/error';
export class Lox {
  errored: boolean = false;
  errors: Error[] = [];

  get hadError() {
    return this.errored;
  }

  clearError() {
    this.errored = false;
    this.errors = [];
  }

  error(...error: Error) {
    this.errored = true;
    this.errors.push(error);
  }

  run(source: string) {
    const scanner = new Scanner(source, this.error.bind(this));
    const tokens = scanner.scanTokens();

    for (const token of tokens) {
      console.log(token);
    }
  }
}



