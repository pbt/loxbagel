import { TokenType } from "@/token";
import type { Token } from "@/token";
import type { Error } from '@/error';

export class Scanner {
  source: string;
  tokens: Token<any>[];
  start: number = 0;
  current: number = 0;
  line: number = 1;
  onError: (...error: Error) => void;

  constructor(source: string, onError: (...error: Error) => void) {
    this.source = source;
    this.tokens = [];
    this.onError = onError;
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: "",
      literal: null,
      line: this.line
    });

    return this.tokens;
  }

  advance() {
    return this.source.charAt(this.current++);
  }

  match(expected: string) {
    return this.peek() === expected ? this.advance() : false;
  }

  peek(offset: number = 0) {
    if (this.current + offset > this.source.length) return '\0';
    return this.source.charAt(this.current + offset);
  }


  addToken(tokenType: TokenType, literal: any = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push({ type: tokenType, lexeme: text, literal, line: this.line });
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // fractional case
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      // consume the '.'
      this.advance();
      // consume remaining numbers
      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, Number(this.source.substring(this.start, this.current)));

  }

  identifier() {
    while (this.isAlpha(this.peek()) || this.isDigit(this.peek())) {
      this.advance();
    }

    const identifier = this.source.substring(this.start, this.current);

    switch (identifier) {
      case "and":
        this.addToken(TokenType.AND); break;

      case "class":
        this.addToken(TokenType.CLASS); break;
      case "else":
        this.addToken(TokenType.ELSE); break;
      case "false":
        this.addToken(TokenType.FALSE); break;
      case "for":
        this.addToken(TokenType.FOR); break;
      case "fun":
        this.addToken(TokenType.FUN); break;
      case "if":
        this.addToken(TokenType.IF); break;
      case "nil":
        this.addToken(TokenType.NIL); break;
      case "or":
        this.addToken(TokenType.OR); break;
      case "print":
        this.addToken(TokenType.PRINT); break;
      case "super":
        this.addToken(TokenType.SUPER); break;
      case "this":
        this.addToken(TokenType.THIS); break;
      case "true":
        this.addToken(TokenType.TRUE); break;
      case "var":
        this.addToken(TokenType.VAR); break;
      case "while":
        this.addToken(TokenType.WHILE); break;
      default:
        this.addToken(TokenType.IDENTIFIER);
    }

  }

  string() {
    while (!this.isAtEnd() && this.peek() !== '"') {
      this.advance();
    }

    if (this.isAtEnd()) {
      this.onError(this.line, "Unterminated string");
      return;
    }

    // capture the closing "
    this.advance();

    // add the literal, without the starting and closing ""
    this.addToken(TokenType.STRING, this.source.substring(this.start + 1, this.current - 1));

  }

  isDigit(c: string) {
    return c >= '0' && c <= '9';
  }

  isAlpha(c: string) {
    return (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      c == '_';
  }
  scanToken() {
    const c = this.advance();
    switch (c) {
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.STAR); break;
      case '!':
        this.match('=') ? this.addToken(TokenType.BANG_EQUAL) : this.addToken(TokenType.BANG);
        break;
      case '=':
        this.match('=') ? this.addToken(TokenType.EQUAL_EQUAL) : this.addToken(TokenType.EQUAL);
        break;
      case '<':
        this.match('=') ? this.addToken(TokenType.LESS_EQUAL) : this.addToken(TokenType.LESS);
        break;
      case '>':
        this.match('=') ? this.addToken(TokenType.GREATER_EQUAL) : this.addToken(TokenType.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          // Comment: advance till end of the line
          while (this.peek() != '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break; case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      case '\n':
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } {
          this.onError(this.line, "Unexpected character.");
        }
    }
  }
}
