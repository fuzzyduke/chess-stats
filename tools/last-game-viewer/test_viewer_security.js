/**
 * Regression and security test suite for tools/last-game-viewer/app.js
 */
const assert = require("assert");
const { parsePGN, isValidHttpUrl, renderMoves } = require("./app.js");

// Mock Minimal DOM for Node environment testing
class MockElement {
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.children = [];
    this.textContent = "";
    this._innerHTML = "";
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = val;
    if (val === "") {
      this.children = [];
    }
  }

  appendChild(child) {
    this.children.push(child);
  }
}

global.document = {
  createElement: (tag) => new MockElement(tag)
};

console.log("Running Chess.com Viewer Security & Robustness Tests...");

// 1. URL Scheme Validation Tests (Mitigating javascript: / data: URI attacks)
assert.strictEqual(isValidHttpUrl("https://www.chess.com/game/live/12345"), true);
assert.strictEqual(isValidHttpUrl("http://localhost:3000"), true);
assert.strictEqual(isValidHttpUrl("javascript:alert(document.cookie)"), false);
assert.strictEqual(isValidHttpUrl("data:text/html,<script>alert(1)</script>"), false);
assert.strictEqual(isValidHttpUrl("vbscript:msgbox(1)"), false);
assert.strictEqual(isValidHttpUrl("not-a-url"), false);
assert.strictEqual(isValidHttpUrl(""), false);
console.log("✓ URL validation successfully blocks non-HTTP/HTTPS protocols");

// 2. DOM Node Construction & XSS Neutralization Tests
const mockTbody = new MockElement("tbody");
// Emulate global movesBody
global.movesBody = mockTbody;

const maliciousMoves = [
  { move: "1", white: "<script>alert('xss')</script>", black: "<img src=x onerror=alert(1)>" },
  { move: "<b onmouseover=alert(1)>2</b>", white: "e4", black: "e5" }
];

renderMoves(maliciousMoves);
assert.strictEqual(mockTbody.children.length, 2);

const tr1 = mockTbody.children[0];
assert.strictEqual(tr1.children[0].textContent, "1");
assert.strictEqual(tr1.children[1].textContent, "<script>alert('xss')</script>");
assert.strictEqual(tr1.children[3].textContent, "<img src=x onerror=alert(1)>");

// Ensure innerHTML does not evaluate or interpolate raw HTML markup
assert.strictEqual(tr1.innerHTML, "");
console.log("✓ renderMoves assigns textContent safely to DOM nodes without HTML injection");

// 3. PGN Parsing Tests (Standard, Malformed, and Empty PGN)
const standardPGN = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.10.30"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5`;

const moves = parsePGN(standardPGN);
assert.strictEqual(moves.length, 3);
assert.strictEqual(moves[0].move, "1");
assert.strictEqual(moves[0].white, "e4");
assert.strictEqual(moves[0].black, "e5");
assert.strictEqual(moves[2].move, "3");
assert.strictEqual(moves[2].white, "Bc4");
assert.strictEqual(moves[2].black, "Bc5");

// Malformed / Non-standard PGN
assert.deepStrictEqual(parsePGN(""), []);
assert.deepStrictEqual(parsePGN(null), []);
assert.deepStrictEqual(parsePGN(undefined), []);
assert.deepStrictEqual(parsePGN("malformed text with no header or moves"), []);

const pgnWithClocks = `[Header "Val"]\n\n1. d4 {[%clk 0:02:59]} d5 {[%clk 0:02:58]} 2. c4`;
const clockMoves = parsePGN(pgnWithClocks);
assert.strictEqual(clockMoves.length, 2);
assert.strictEqual(clockMoves[0].white, "d4");
assert.strictEqual(clockMoves[0].black, "d5");

console.log("✓ PGN parser robustly handles standard, clock-annotated, and malformed inputs");

console.log("\nAll 3 test suites passed successfully!");
