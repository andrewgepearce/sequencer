// Copyright (C) 2019 Mark The Page
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const Utilities = require("./Utilities.js");
const TextMetadata = require("./TextMetadata.js");
const Actor = require("./Actor.js");

const DEFAULT_BORDER_COLOUR = "rgb(255,0,0)";
const DEFAULT_BG_COLOUR = "rgb(255,235,235)";
const DEFAULT_FG_COLOUR = "rgb(120,0,0)";
const BORDER_WIDTH = 3;

module.exports = class ErrorLine {
	/**
	 * Render a single, consistently-formatted error line into the diagram and emit
	 * a matching warning to the log. The error box is left-aligned at
	 * `working.startX` (which already accounts for any leftward overflow and
	 * fragment-depth shift from `Working.init()`), wraps to the available canvas
	 * width so it never clips, and carries the originating source-file line
	 * number when available.
	 *
	 * @param {object} working Shared working/state object.
	 * @param {object} ctx Drawing context (SvgContext or compatible).
	 * @param {number} starty Top y-coordinate for the error line.
	 * @param {string} reason Short human-readable error reason.
	 * @param {object} offendingLine The parsed line object that caused the error.
	 * @param {boolean} mimic If true, compute size without drawing.
	 * @returns {{x:number,y:number}} Position after drawing.
	 */
	static draw(working, ctx, starty, reason, offendingLine, mimic) {
		const sourceLine = ErrorLine._extractSourceLine(offendingLine);
		const srcLabel = sourceLine != null ? " at source line " + sourceLine : "";
		working.logWarn("Error" + srcLabel + ": " + reason + " - " + Utilities.objToString(offendingLine));

		const textLines = ErrorLine._formatLines(reason, sourceLine, offendingLine);

		const left = working.startX;
		const boxWidth = Math.max(200, working.canvasWidth - left - working.windowPadding);

		const tmd = TextMetadata.getTextMetadataFromObject(working, null, null, ErrorLine._defaultTmd());
		const top = starty + working.globalSpacing;

		// Layout-only pass to measure height so we can draw timelines through the
		// full vertical extent of the error line.
		const wh = Utilities.getTextWidthAndHeight(ctx, tmd, textLines, working.tags);
		const boxHeight = wh.h;
		const errBoxBottom = top + boxHeight;
		const hasActorTimelines =
			Array.isArray(working.postdata && working.postdata.actors) &&
			working.postdata.actors.some((actor) => actor && actor.clinstance && Utilities.isNumber(actor.clinstance.middle));
		const finalHeightOfAllLine = hasActorTimelines ? Actor.drawTimelines(working, ctx, starty, errBoxBottom - starty + 1, true).y - starty : errBoxBottom - starty;

		// 1. Background fragments (if any)
		Utilities.drawActiveFragments(working, ctx, starty, finalHeightOfAllLine, mimic);

		// 2. Time lines through the error line's vertical span
		if (hasActorTimelines) {
			Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);
		}

		// 3. Error box — borders on all sides, red.
		const textxy = Utilities.drawTextRectangle(
			ctx,
			textLines,
			tmd,
			top,
			left,
			boxWidth,
			null,
			5,
			true,
			true,
			true,
			true,
			mimic,
			wh,
			working.tags
		);

		working.manageMaxWidth(left + boxWidth, textxy.y);
		return working.manageMaxWidth(0, starty + finalHeightOfAllLine);
	}

	/**
	 * Extract the __sourceLine annotation (set by sequencer.js during parse) from
	 * the offending line object.
	 *
	 * @param {*} offendingLine Parsed line object or primitive.
	 * @returns {number|null} 1-based source line number, or null if absent.
	 */
	static _extractSourceLine(offendingLine) {
		if (offendingLine && typeof offendingLine === "object" && Utilities.isNumber(offendingLine.__sourceLine)) {
			return offendingLine.__sourceLine;
		}
		return null;
	}

	/**
	 * Build the array of text lines to render inside the error box. The first
	 * line is a bold header naming the error and source location; the remainder
	 * are one-key-per-line dumps of the offending line's own enumerable fields
	 * so the box never needs to be wider than the longest single field.
	 *
	 * @param {string} reason Short reason text.
	 * @param {number|null} sourceLine 1-based source line number if known.
	 * @param {object} offendingLine The parsed line object that triggered the error.
	 * @returns {string[]} Lines to pass to drawTextRectangle.
	 */
	static _formatLines(reason, sourceLine, offendingLine) {
		const headerLabel = sourceLine != null ? "<b>ERROR at source line " + sourceLine + ":</b>" : "<b>ERROR:</b>";
		const out = [headerLabel];
		ErrorLine._softWrap(ErrorLine._escape(reason), 90).forEach((w) => out.push("  " + w));
		out.push("");
		out.push("Offending object:");
		if (offendingLine && typeof offendingLine === "object") {
			Object.keys(offendingLine).forEach((k) => {
				const v = offendingLine[k];
				let rendered;
				if (typeof v === "string") rendered = '"' + v + '"';
				else if (v == null) rendered = String(v);
				else if (Array.isArray(v) || typeof v === "object") {
					try {
						rendered = JSON.stringify(v);
					} catch (e) {
						rendered = String(v);
					}
				} else rendered = String(v);
				const prefix = "  " + ErrorLine._escape(k) + ": ";
				const wrapped = ErrorLine._softWrap(ErrorLine._escape(rendered), Math.max(20, 90 - prefix.length));
				if (wrapped.length === 0) out.push(prefix);
				else {
					out.push(prefix + wrapped[0]);
					for (let i = 1; i < wrapped.length; i++) out.push(" ".repeat(prefix.length) + wrapped[i]);
				}
			});
		}
		return out;
	}

	/**
	 * Soft-wrap a single-line string to an approximate character budget, breaking
	 * at whitespace boundaries where possible and hard-splitting tokens that
	 * exceed the budget on their own. Used purely for the monospaced error box,
	 * where a character budget maps directly to visual width.
	 *
	 * @param {string} text Input string (no embedded newlines expected).
	 * @param {number} maxChars Target maximum characters per wrapped line.
	 * @returns {string[]} Array of wrapped lines (never empty unless input empty).
	 */
	static _softWrap(text, maxChars) {
		if (!text) return [""];
		if (text.length <= maxChars) return [text];
		const out = [];
		const words = text.split(/(\s+)/);
		let cur = "";
		for (const tok of words) {
			if (cur.length + tok.length <= maxChars) {
				cur += tok;
				continue;
			}
			if (cur.length > 0) {
				out.push(cur.replace(/\s+$/, ""));
				cur = "";
			}
			if (tok.length <= maxChars) {
				cur = tok.replace(/^\s+/, "");
			} else {
				let t = tok;
				while (t.length > maxChars) {
					out.push(t.slice(0, maxChars));
					t = t.slice(maxChars);
				}
				cur = t;
			}
		}
		if (cur.length > 0) out.push(cur.replace(/\s+$/, ""));
		return out.length === 0 ? [""] : out;
	}

	/**
	 * Escape the sequencer's own angle-bracket markup so raw error content does
	 * not accidentally activate tag parsing (e.g. a stray "<b>" inside a user
	 * value). Only escapes `<` and `>`; the header explicitly opts in to markup
	 * before being combined with an escaped reason.
	 *
	 * @param {string} s Text to escape.
	 * @returns {string} The escaped text.
	 */
	static _escape(s) {
		if (typeof s !== "string") return String(s);
		return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	/**
	 * Default text-metadata template for error boxes. Red-on-pale-red with a
	 * thick red border, left-aligned so long lines do not try to centre and go
	 * negative.
	 *
	 * @returns {object} Text-metadata template.
	 */
	static _defaultTmd() {
		return {
			fontFamily: "monospace",
			fontSizePx: 12,
			fgColour: DEFAULT_FG_COLOUR,
			bgColour: DEFAULT_BG_COLOUR,
			padding: 10,
			spacing: 1.2,
			align: "left",
			borderColour: DEFAULT_BORDER_COLOUR,
			borderWidth: BORDER_WIDTH,
			borderDash: [],
		};
	}
};
