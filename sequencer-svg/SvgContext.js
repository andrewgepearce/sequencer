const { create } = require("xmlbuilder2");

class SvgContext {
	constructor(fontManager) {
		this._fontManager = fontManager;
		this._elements = [];
		this._currentPath = [];
		this._currentPoint = { x: 0, y: 0 };

		// Canvas 2D state
		this._fillStyle = "rgb(0,0,0)";
		this._strokeStyle = "rgb(0,0,0)";
		this._lineWidth = 1;
		this._lineDash = [];
		this._fontString = "14px sans-serif";
		this._textBaseline = "alphabetic";
	}

	// ─── Property: font ────────────────────────────────────────────
	get font() {
		return this._fontString;
	}

	set font(value) {
		this._fontString = value;
	}

	_parseFont() {
		const str = this._fontString || "14px sans-serif";
		let bold = false;
		let italic = false;
		let sizePx = 14;
		let family = "sans-serif";

		// Match patterns like "bold italic 14px sans-serif" or "14px monospace"
		const parts = str.trim().split(/\s+/);
		const remaining = [];
		for (const part of parts) {
			if (part === "bold") bold = true;
			else if (part === "italic") italic = true;
			else remaining.push(part);
		}

		// First remaining part with "px" is the size
		for (let i = 0; i < remaining.length; i++) {
			const match = remaining[i].match(/^(\d+(?:\.\d+)?)px$/);
			if (match) {
				sizePx = parseFloat(match[1]);
				remaining.splice(i, 1);
				break;
			}
		}

		// Everything left is the font family
		if (remaining.length > 0) {
			family = remaining.join(" ").replace(/['"]/g, "");
		}

		return { bold, italic, sizePx, family };
	}

	// ─── Property: fillStyle ───────────────────────────────────────
	get fillStyle() {
		return this._fillStyle;
	}

	set fillStyle(value) {
		this._fillStyle = value;
	}

	// ─── Property: strokeStyle ─────────────────────────────────────
	get strokeStyle() {
		return this._strokeStyle;
	}

	set strokeStyle(value) {
		this._strokeStyle = value;
	}

	// ─── Property: lineWidth ───────────────────────────────────────
	get lineWidth() {
		return this._lineWidth;
	}

	set lineWidth(value) {
		this._lineWidth = value;
	}

	// ─── Property: textBaseline ────────────────────────────────────
	get textBaseline() {
		return this._textBaseline;
	}

	set textBaseline(value) {
		this._textBaseline = value;
	}

	// ─── Path methods ──────────────────────────────────────────────
	beginPath() {
		this._currentPath = [];
	}

	moveTo(x, y) {
		this._currentPath.push({ cmd: "M", x, y });
		this._currentPoint = { x, y };
	}

	lineTo(x, y) {
		this._currentPath.push({ cmd: "L", x, y });
		this._currentPoint = { x, y };
	}

	arcTo(x1, y1, x2, y2, radius) {
		if (radius <= 0) {
			// radius 0 means just go to the control point
			this.lineTo(x1, y1);
			return;
		}

		const cp = this._currentPoint;
		if (cp.x === undefined) {
			this.moveTo(x1, y1);
			return;
		}

		// Vector from current point to (x1,y1)
		const dx0 = cp.x - x1;
		const dy0 = cp.y - y1;
		// Vector from (x1,y1) to (x2,y2)
		const dx1 = x2 - x1;
		const dy1 = y2 - y1;

		const len0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
		const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

		if (len0 === 0 || len1 === 0) {
			this.lineTo(x1, y1);
			return;
		}

		// Unit vectors
		const ux0 = dx0 / len0;
		const uy0 = dy0 / len0;
		const ux1 = dx1 / len1;
		const uy1 = dy1 / len1;

		// Half-angle between the two lines
		const cross = ux0 * uy1 - uy0 * ux1;
		const dot = ux0 * ux1 + uy0 * uy1;
		const halfAngle = Math.atan2(Math.abs(cross), 1 + dot);

		if (Math.abs(halfAngle) < 1e-6) {
			// Lines are parallel, just draw to control point
			this.lineTo(x1, y1);
			return;
		}

		// Distance from corner to tangent points
		const tangentDist = radius / Math.tan(halfAngle);

		// Tangent points
		const t1x = x1 + ux0 * tangentDist;
		const t1y = y1 + uy0 * tangentDist;
		const t2x = x1 + ux1 * tangentDist;
		const t2y = y1 + uy1 * tangentDist;

		// Line to first tangent point
		this._currentPath.push({ cmd: "L", x: t1x, y: t1y });

		// Determine sweep flag (clockwise vs counter-clockwise)
		const sweepFlag = cross < 0 ? 1 : 0;

		this._currentPath.push({
			cmd: "A",
			rx: radius,
			ry: radius,
			xRotation: 0,
			largeArcFlag: 0,
			sweepFlag: sweepFlag,
			x: t2x,
			y: t2y,
		});

		this._currentPoint = { x: t2x, y: t2y };
	}

	arc(x, y, radius, startAngle, endAngle, counterclockwise) {
		// Used by Terminate.js for drawing circles
		const startX = x + radius * Math.cos(startAngle);
		const startY = y + radius * Math.sin(startAngle);
		const endX = x + radius * Math.cos(endAngle);
		const endY = y + radius * Math.sin(endAngle);

		// Determine if it's a full circle (or nearly)
		const angleDiff = Math.abs(endAngle - startAngle);
		const isFullCircle = angleDiff >= 2 * Math.PI - 1e-6;

		if (isFullCircle) {
			// SVG can't draw a full circle with a single arc, use two semicircles
			const midX = x + radius * Math.cos(startAngle + Math.PI);
			const midY = y + radius * Math.sin(startAngle + Math.PI);
			this._currentPath.push({ cmd: "M", x: startX, y: startY });
			this._currentPath.push({
				cmd: "A",
				rx: radius,
				ry: radius,
				xRotation: 0,
				largeArcFlag: 0,
				sweepFlag: counterclockwise ? 0 : 1,
				x: midX,
				y: midY,
			});
			this._currentPath.push({
				cmd: "A",
				rx: radius,
				ry: radius,
				xRotation: 0,
				largeArcFlag: 0,
				sweepFlag: counterclockwise ? 0 : 1,
				x: startX,
				y: startY,
			});
		} else {
			const largeArcFlag = angleDiff > Math.PI ? 1 : 0;
			const sweepFlag = counterclockwise ? 0 : 1;
			this._currentPath.push({ cmd: "M", x: startX, y: startY });
			this._currentPath.push({
				cmd: "A",
				rx: radius,
				ry: radius,
				xRotation: 0,
				largeArcFlag,
				sweepFlag,
				x: endX,
				y: endY,
			});
		}
		this._currentPoint = { x: endX, y: endY };
	}

	// ─── Path to SVG d-attribute ───────────────────────────────────
	_pathToD() {
		let d = "";
		for (const seg of this._currentPath) {
			switch (seg.cmd) {
				case "M":
					d += `M ${r(seg.x)} ${r(seg.y)} `;
					break;
				case "L":
					d += `L ${r(seg.x)} ${r(seg.y)} `;
					break;
				case "A":
					d += `A ${r(seg.rx)} ${r(seg.ry)} ${seg.xRotation} ${seg.largeArcFlag} ${seg.sweepFlag} ${r(seg.x)} ${r(seg.y)} `;
					break;
			}
		}
		return d.trim();
	}

	// ─── Stroke / Fill ─────────────────────────────────────────────
	stroke() {
		const d = this._pathToD();
		if (!d) return;
		const attrs = {
			d,
			fill: "none",
			stroke: this._strokeStyle,
			"stroke-width": this._lineWidth,
		};
		if (this._lineDash.length > 0) {
			attrs["stroke-dasharray"] = this._lineDash.join(",");
		}
		this._elements.push({ tag: "path", attrs });
	}

	fill() {
		const d = this._pathToD();
		if (!d) return;
		this._elements.push({
			tag: "path",
			attrs: {
				d,
				fill: this._fillStyle,
				stroke: "none",
			},
		});
	}

	// ─── Text ──────────────────────────────────────────────────────
	fillText(text, x, y) {
		if (!text || text.length === 0) return;
		const { bold, italic, sizePx, family } = this._parseFont();
		const svgFamily = this._fontManager.getSvgFontFamily(family);
		const attrs = {
			x: r(x),
			y: r(y),
			fill: this._fillStyle,
			"font-family": svgFamily,
			"font-size": sizePx,
			"xml:space": "preserve",
		};
		if (bold) attrs["font-weight"] = "bold";
		if (italic) attrs["font-style"] = "italic";
		// Map textBaseline to SVG dominant-baseline
		if (this._textBaseline === "alphabetic") {
			attrs["dominant-baseline"] = "auto";
		} else if (this._textBaseline === "top") {
			attrs["dominant-baseline"] = "hanging";
		}
		this._elements.push({ tag: "text", attrs, content: text });
	}

	measureText(text) {
		const { bold, italic, sizePx, family } = this._parseFont();
		return this._fontManager.measureText(text, sizePx, family, bold, italic);
	}

	// ─── Dash ──────────────────────────────────────────────────────
	setLineDash(segments) {
		this._lineDash = Array.isArray(segments) ? segments.slice() : [];
	}

	getLineDash() {
		return this._lineDash.slice();
	}

	// ─── clearRect (no-op for SVG) ─────────────────────────────────
	clearRect() {
		// No-op: SVG doesn't need clearing
	}

	// ─── Reset for redraw ──────────────────────────────────────────
	reset() {
		this._elements = [];
		this._currentPath = [];
		this._currentPoint = { x: 0, y: 0 };
		this._fillStyle = "rgb(0,0,0)";
		this._strokeStyle = "rgb(0,0,0)";
		this._lineWidth = 1;
		this._lineDash = [];
		this._fontString = "14px sans-serif";
		this._textBaseline = "alphabetic";
	}

	// ─── SVG Generation ────────────────────────────────────────────
	toSVG(width, height) {
		const svg = create({ version: "1.0" }).ele("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			width: Math.ceil(width),
			height: Math.ceil(height),
			viewBox: `0 0 ${Math.ceil(width)} ${Math.ceil(height)}`,
		});

		// White background
		svg.ele("rect", {
			width: "100%",
			height: "100%",
			fill: "white",
		}).up();

		for (const el of this._elements) {
			if (el.tag === "text") {
				const textEl = svg.ele("text", el.attrs);
				textEl.txt(el.content);
				textEl.up();
			} else {
				svg.ele(el.tag, el.attrs).up();
			}
		}

		return svg.end({ prettyPrint: true });
	}

	toBuffer(width, height) {
		return Buffer.from(this.toSVG(width, height), "utf-8");
	}
}

// Round to 2 decimal places for clean SVG output
function r(n) {
	return Math.round(n * 100) / 100;
}

module.exports = SvgContext;
