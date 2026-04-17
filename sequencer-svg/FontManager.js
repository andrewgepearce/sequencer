const opentype = require("opentype.js");
const fontsConfig = require("./fonts.js");

class FontManager {
	constructor() {
		this._fonts = {};
		this._loadedFamilies = new Set();
	}

	_fontKey(family, bold, italic) {
		const weight = bold ? "bold" : "normal";
		const style = italic ? "italic" : "normal";
		return `${family}:${weight}:${style}`;
	}

	loadFont(family, bold, italic, ttfPath) {
		const key = this._fontKey(family, bold, italic);
		try {
			this._fonts[key] = opentype.loadSync(ttfPath);
			this._loadedFamilies.add(family);
		} catch (err) {
			console.error(`FontManager: failed to load font ${ttfPath}: ${err.message}`);
		}
	}

	loadDefaults() {
		for (const [family, paths] of Object.entries(fontsConfig.families)) {
			this.loadFont(family, false, false, paths.normal);
			this.loadFont(family, true, false, paths.bold);
			this.loadFont(family, false, true, paths.italic);
			this.loadFont(family, true, true, paths.boldItalic);
		}
	}

	getFont(family, bold, italic) {
		let key = this._fontKey(family, bold, italic);
		if (this._fonts[key]) return this._fonts[key];

		// Try without italic
		key = this._fontKey(family, bold, false);
		if (this._fonts[key]) return this._fonts[key];

		// Try without bold
		key = this._fontKey(family, false, italic);
		if (this._fonts[key]) return this._fonts[key];

		// Try normal variant of same family
		key = this._fontKey(family, false, false);
		if (this._fonts[key]) return this._fonts[key];

		// Fall back to sans-serif
		key = this._fontKey("sans-serif", bold, italic);
		if (this._fonts[key]) return this._fonts[key];

		key = this._fontKey("sans-serif", false, false);
		return this._fonts[key] || null;
	}

	measureText(text, fontSizePx, fontFamily, bold, italic) {
		const font = this.getFont(fontFamily, bold, italic);
		if (!font) {
			// Rough fallback: average character width ≈ 0.6 * fontSize
			return { width: text.length * fontSizePx * 0.6 };
		}
		const width = font.getAdvanceWidth(text, fontSizePx);
		return { width: width };
	}

	isValidFont(fontFamily) {
		if (this._loadedFamilies.has(fontFamily)) return true;
		if (fontFamily === "monospace" || fontFamily === "sans-serif" || fontFamily === "serif") return true;
		return false;
	}

	getSvgFontFamily(family) {
		return fontsConfig.svgFamilyNames[family] || family;
	}
}

module.exports = FontManager;
