// npm install --save-dev jsdoc-to-markdown
// npx jsdoc2md SvgBuilder.js > SvgBuilder.md

const fs = require("fs");
const { create } = require("xmlbuilder2");
const SortedMap = require("./SortedMap"); // Assuming the SortedMap is implemented as discussed

/**
 * Class representing an SVG Builder.
 * Allows adding SVG primitives (rectangles, circles, lines, polygons, ellipses, text), applying CSS-like styles, and exporting as SVG XML.
 *
 * ### CSS Style Usage
 * You can define CSS-like styles using the `setStyle` method and apply them to primitives with the `className` property.
 *
 * **Example:**
 * ```javascript
 * const SVGBuilder = require('./SVGBuilder');
 * const svgBuilder = new SVGBuilder(400, 400);
 *
 * // CSS Styles
 * svgBuilder.setStyle('.highlight', { fill: 'yellow', stroke: 'black', 'stroke-width': 2 });
 * svgBuilder.setStyle('.label', { fill: 'red', 'font-size': '20px', 'font-weight': 'bold' });
 *
 * // Add Primitives
 * svgBuilder.addRectangle(1, { x: 50, y: 50, width: 100, height: 150, className: 'highlight' });
 * svgBuilder.addCircle(2, { cx: 200, cy: 200, r: 50, className: 'highlight' });
 * svgBuilder.addLine(3, { x1: 20, y1: 20, x2: 300, y2: 300, className: 'highlight' });
 * svgBuilder.addPolygon(4, { points: '50,150 150,50 250,150', className: 'highlight' });
 * svgBuilder.addText(5, { x: 60, y: 40, content: 'Styled Text', className: 'label' });
 * svgBuilder.addRectangle(1, { x: -50, y: -30, width: 100, height: 150 });
 * svgBuilder.addCircle(2, { cx: -20, cy: 100, r: 40 });
 * svgBuilder.addText(3, { x: -10, y: -20, content: 'Outside Canvas' });
 *
 * // Output SVG
 * svgBuilder.toSVG();
 * ```
 *
 * The above code will generate SVG with embedded styles:
 * ```xml
 * <style>
 *   .highlight { fill: yellow; stroke: black; stroke-width: 2; }
 *   .label { fill: red; font-size: 20px; font-weight: bold; }
 * </style>
 * ```
 */
class SVGBuilder {
	constructor(borderMargin = -1, borderWidth = -1, borderPadding = -1, borderClass = null, width = 1, height = 1) {
		this.borderMargin = borderMargin;
		this.borderWidth = borderWidth;
		this.borderPadding = borderPadding;
		this.borderClass = borderClass;
		this.width = width;
		this.height = height;
		this.primitives = new SortedMap();
		this.styles = {};
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Sets the style for a given CSS selector.
	 *
	 * This function allows you to define or update the style properties for a specific CSS selector within the SVG.
	 * It merges the new style properties with any existing style properties for the selector.
	 *
	 * @param {string} selector - The CSS selector to which the style should be applied.
	 * @param {Object} style - An object containing the style properties to be applied.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.setStyle('.my-class', { fill: 'red', stroke: 'black' });
	 * svgBuilder.setStyle('.my-class', { strokeWidth: 2 });
	 * // The resulting style for '.my-class' will be { fill: 'red', stroke: 'black', strokeWidth: 2 }
	 */
	setStyle(selector, style) {
		this.styles[selector] = { ...this.styles[selector], ...style };
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Adds a rectangle to the SVG with the specified attributes.
	 *
	 * This function allows you to add a rectangle element to the SVG. The rectangle is defined by its position (x, y),
	 * dimensions (width, height), and style properties (fill, stroke, strokeWidth, className).
	 *
	 * @param {string} key - The unique key to identify the rectangle in the SVG.
	 * @param {Object} options - An object containing the attributes of the rectangle.
	 * @param {number} options.x - The x-coordinate of the top-left corner of the rectangle.
	 * @param {number} options.y - The y-coordinate of the top-left corner of the rectangle.
	 * @param {number} options.width - The width of the rectangle.
	 * @param {number} options.height - The height of the rectangle.
	 * @param {string} [options.fill="none"] - The fill color of the rectangle.
	 * @param {string} [options.stroke="black"] - The stroke color of the rectangle.
	 * @param {number} [options.strokeWidth=1] - The width of the stroke.
	 * @param {string} [options.className=""] - The CSS class name to apply to the rectangle.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addRectangle('rect1', { x: 10, y: 20, width: 100, height: 50, fill: 'blue', stroke: 'red', strokeWidth: 2, className: 'my-rect' });
	 * // Adds a rectangle with the specified attributes to the SVG.
	 */
	addRectangle(key, { x, y, width, height, fill = "none", stroke = "black", strokeWidth = 1, className = "" }, start = false, end = false) {
		const rect = {
			name: "rect",
			attributes: { x, y, width, height, class: className, fill, stroke, "stroke-width": strokeWidth },
		};
		if (start) this.primitives.setFirst(key, rect);
		else if (end) this.primitives.setLast(key, rect);
		else if (key != null) this.primitives.set(key, rect);
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Adds a circle to the SVG with the specified attributes.
	 *
	 * This function allows you to add a circle element to the SVG. The circle is defined by its center position (cx, cy),
	 * radius (r), and style properties (fill, stroke, strokeWidth, className).
	 *
	 * @param {string} key - The unique key to identify the circle in the SVG.
	 * @param {Object} options - An object containing the attributes of the circle.
	 * @param {number} options.cx - The x-coordinate of the center of the circle.
	 * @param {number} options.cy - The y-coordinate of the center of the circle.
	 * @param {number} options.r - The radius of the circle.
	 * @param {string} [options.fill="none"] - The fill color of the circle.
	 * @param {string} [options.stroke="black"] - The stroke color of the circle.
	 * @param {number} [options.strokeWidth=1] - The width of the stroke.
	 * @param {string} [options.className=""] - The CSS class name to apply to the circle.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addCircle('circle1', { cx: 50, cy: 50, r: 25, fill: 'green', stroke: 'blue', strokeWidth: 2, className: 'my-circle' });
	 * // Adds a circle with the specified attributes to the SVG.
	 */
	addCircle(key, { cx, cy, r, fill = "none", stroke = "black", strokeWidth = 1, className = "" }) {
		const circle = {
			name: "circle",
			attributes: { cx, cy, r, class: className, fill, stroke, "stroke-width": strokeWidth },
		};
		this.primitives.set(key, circle);
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Adds a line to the SVG with the specified attributes.
	 *
	 * This function allows you to add a line element to the SVG. The line is defined by its start position (x1, y1),
	 * end position (x2, y2), and style properties (stroke, strokeWidth, className).
	 *
	 * @param {string} key - The unique key to identify the line in the SVG.
	 * @param {Object} options - An object containing the attributes of the line.
	 * @param {number} options.x1 - The x-coordinate of the start of the line.
	 * @param {number} options.y1 - The y-coordinate of the start of the line.
	 * @param {number} options.x2 - The x-coordinate of the end of the line.
	 * @param {number} options.y2 - The y-coordinate of the end of the line.
	 * @param {string} [options.stroke="black"] - The stroke color of the line.
	 * @param {number} [options.strokeWidth=1] - The width of the stroke.
	 * @param {string} [options.className=""] - The CSS class name to apply to the line.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addLine('line1', { x1: 10, y1: 20, x2: 100, y2: 200, stroke: 'red', strokeWidth: 2, className: 'my-line' });
	 * // Adds a line with the specified attributes to the SVG.
	 */
	addLine(key, { x1, y1, x2, y2, stroke = "black", strokeWidth = 1, className = "" }) {
		const line = {
			name: "line",
			attributes: { x1, y1, x2, y2, class: className, stroke, "stroke-width": strokeWidth },
		};
		this.primitives.set(key, line);
	}

	////////////////////////////////////////////////////////////////////////////////
	/**
	 * Adds a polygon to the SVG with the specified attributes.
	 *
	 * This function allows you to add a polygon element to the SVG. The polygon is defined by its points and style properties
	 * (fill, stroke, strokeWidth, className).
	 *
	 * @param {string} key - The unique key to identify the polygon in the SVG.
	 * @param {Object} options - An object containing the attributes of the polygon.
	 * @param {string} options.points - A string containing a list of points for the polygon, formatted as "x1,y1 x2,y2 ...".
	 * @param {string} [options.fill="none"] - The fill color of the polygon.
	 * @param {string} [options.stroke="black"] - The stroke color of the polygon.
	 * @param {number} [options.strokeWidth=1] - The width of the stroke.
	 * @param {string} [options.className=""] - The CSS class name to apply to the polygon.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addPolygon('polygon1', { points: "50,150 50,200 200,200", fill: 'yellow', stroke: 'blue', strokeWidth: 2, className: 'my-polygon' });
	 * // Adds a polygon with the specified attributes to the SVG.
	 */
	addPolygon(key, { points, fill = "none", stroke = "black", strokeWidth = 1, className = "" }) {
		const polygon = {
			name: "polygon",
			attributes: { points, class: className, fill, stroke, "stroke-width": strokeWidth },
		};
		this.primitives.set(key, polygon);
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Adds a text element to the SVG with the specified attributes.
	 *
	 * This function allows you to add a text element to the SVG. The text is defined by its position (x, y),
	 * content, and style properties (fontSize, fill, className).
	 *
	 * @param {string} key - The unique key to identify the text element in the SVG.
	 * @param {Object} options - An object containing the attributes of the text element.
	 * @param {number} options.x - The x-coordinate of the text element.
	 * @param {number} options.y - The y-coordinate of the text element.
	 * @param {string} options.content - The text content to be displayed.
	 * @param {number} [options.fontSize=16] - The font size of the text.
	 * @param {string} [options.fill="black"] - The fill color of the text.
	 * @param {string} [options.className=""] - The CSS class name to apply to the text element.
	 * @param {string} [options.fontFamily='Arial'] - Font family for the text.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addText('text1', { x: 50, y: 50, content: 'Hello, SVG!', fontSize: 20, fill: 'red', className: 'my-text' });
	 * // Adds a text element with the specified attributes to the SVG.
	 */
	addText(key, { x, y, content, fontSize = 16, fill = "black", className = "", fontFamily = "Arial" }) {
		const text = {
			name: "text",
			attributes: { x, y, "font-size": fontSize, fill, class: className, "font-family": fontFamily },
			content,
		};
		this.primitives.set(key, text);
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Resets the SVG builder by clearing all primitives and styles.
	 *
	 * This function clears all the elements and styles that have been added to the SVG builder,
	 * effectively resetting it to its initial state.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addRectangle('rect1', { x: 10, y: 20, width: 100, height: 50 });
	 * svgBuilder.reset();
	 * // The SVG builder is now reset, and all previously added elements and styles are cleared.
	 */
	reset() {
		this.primitives.clear();
		this.styles = {};
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Converts the stored styles into a CSS string.
	 *
	 * This function takes the styles stored in the SVG builder and converts them into a single CSS string.
	 * Each style is formatted as a CSS rule, with the selector followed by the style properties.
	 *
	 * @returns {string} A string containing all the styles formatted as CSS rules.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.setStyle('.my-class', { fill: 'red', stroke: 'black' });
	 * const cssString = svgBuilder.stylesToCSS();
	 * console.log(cssString); // Outputs: ".my-class { fill: red; stroke: black; }"
	 */
	stylesToCSS() {
		return Object.entries(this.styles)
			.map(([selector, style]) => {
				const styleString = Object.entries(style)
					.map(([prop, value]) => `${prop}: ${value};`)
					.join(" ");
				return `${selector} { ${styleString} }`;
			})
			.join(" ");
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Calculates the bounding box of all primitives to fit within the canvas dimensions.
	 *
	 * This function calculates the minimum and maximum x and y coordinates of all primitives (shapes, lines, text, etc.)
	 * to determine the bounding box that fits within the canvas dimensions.
	 *
	 * @returns {Object} An object containing the minimum and maximum x and y coordinates.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addRectangle('rect1', { x: -10, y: -20, width: 100, height: 50 });
	 * const boundingBox = svgBuilder.calculateBoundingBox();
	 * console.log(boundingBox); // { minX: -10, minY: -20, maxX: 90, maxY: 30 }
	 */
	calculateBoundingBox() {
		let minX = 0,
			minY = 0,
			maxX = this.width,
			maxY = this.height;
		for (const [, primitive] of this.primitives) {
			const attrs = primitive.attributes;
			if (attrs.x !== undefined) minX = Math.min(minX, attrs.x);
			if (attrs.y !== undefined) minY = Math.min(minY, attrs.y);
			if (primitive.name === "text" && attrs["font-size"] !== undefined && attrs.y !== undefined)
				minY = Math.min(minY, attrs.y - attrs["font-size"]);
			if (attrs.cx !== undefined) minX = Math.min(minX, attrs.cx - (attrs.r || 0));
			if (attrs.cy !== undefined) minY = Math.min(minY, attrs.cy - (attrs.r || 0));
			if (attrs.x1 !== undefined) minX = Math.min(minX, attrs.x1);
			if (attrs.y1 !== undefined) minY = Math.min(minY, attrs.y1);
			if (attrs.x2 !== undefined) maxX = Math.max(maxX, attrs.x2);
			if (attrs.y2 !== undefined) maxY = Math.max(maxY, attrs.y2);
			if (attrs.width !== undefined) maxX = Math.max(maxX, attrs.x + attrs.width);
			if (attrs.height !== undefined) maxY = Math.max(maxY, attrs.y + attrs.height);
			if (attrs.points) {
				const points = attrs.points.split(" ").map((p) => p.split(",").map(Number));
				points.forEach(([px, py]) => {
					minX = Math.min(minX, px);
					minY = Math.min(minY, py);
					maxX = Math.max(maxX, px);
					maxY = Math.max(maxY, py);
				});
			}
		}
		return { minX, minY, maxX, maxY };
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Shifts the positions of all primitives by the specified amounts.
	 *
	 * This function adjusts the coordinates of all primitives (shapes, lines, text, etc.) by the specified amounts.
	 * It ensures that the primitives are shifted by the given x and y values.
	 *
	 * @param {number} shiftX - The amount to shift the x-coordinates.
	 * @param {number} shiftY - The amount to shift the y-coordinates.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addRectangle('rect1', { x: 10, y: 20, width: 100, height: 50 });
	 * svgBuilder.shiftPrimitives(5, 10);
	 * // The rectangle's position will be shifted by 5 units in the x direction and 10 units in the y direction.
	 */
	shiftPrimitives(shiftX, shiftY) {
		for (const [, primitive] of this.primitives) {
			const attrs = primitive.attributes;
			if (attrs.x !== undefined) attrs.x += shiftX;
			if (attrs.y !== undefined) attrs.y += shiftY;
			if (attrs.cx !== undefined) attrs.cx += shiftX;
			if (attrs.cy !== undefined) attrs.cy += shiftY;
			if (attrs.x1 !== undefined) attrs.x1 += shiftX;
			if (attrs.y1 !== undefined) attrs.y1 += shiftY;
			if (attrs.x2 !== undefined) attrs.x2 += shiftX;
			if (attrs.y2 !== undefined) attrs.y2 += shiftY;
			if (attrs.points) {
				attrs.points = attrs.points
					.split(" ")
					.map((p) => {
						const [px, py] = p.split(",").map(Number);
						return `${px + shiftX},${py + shiftY}`;
					})
					.join(" ");
			}
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Adjusts the positions of all primitives to fit within the canvas dimensions.
	 *
	 * This function recalculates the positions of all primitives (shapes, lines, text, etc.) to ensure they fit within the canvas.
	 * It adjusts the coordinates of the primitives to ensure that none of them have negative coordinates and that they all fit within the specified width and height of the canvas.
	 * The canvas dimensions are also updated if necessary to accommodate the adjusted primitives.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addRectangle('rect1', { x: -10, y: -20, width: 100, height: 50 });
	 * svgBuilder.adjustPrimitivesToFitCanvas();
	 * // The rectangle's position will be adjusted to fit within the canvas, and the canvas dimensions will be updated if necessary.
	 */
	adjustPrimitivesToFitCanvas() {
		const { minX, minY, maxX, maxY } = this.calculateBoundingBox();
		const shiftX = minX < 0 ? -minX : 0;
		const shiftY = minY < 0 ? -minY : 0;
		console.error(`Shify X by ${shiftX}, shift Y by ${shiftY}`);
		this.shiftPrimitives(shiftX, shiftY);
		this.width = Math.max(this.width, maxX + shiftX);
		this.height = Math.max(this.height, maxY + shiftY);
	}

	//////////////////////////////////////////////////////////////////////////////
	/**
	 * Converts the SVG builder's content to an SVG string and optionally writes it to a file.
	 *
	 * This function generates an SVG string from the primitives and styles stored in the SVG builder.
	 * It can also write the generated SVG string to a specified output file.
	 *
	 * @param {string|null} [outputFile=null] - The path to the file where the SVG string should be written. If null, the SVG string is logged to the console.
	 * @returns {string} The generated SVG string.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addRectangle('rect1', { x: 10, y: 20, width: 100, height: 50, fill: 'blue' });
	 * const svgString = svgBuilder.toSVG();
	 * console.log(svgString); // Logs the generated SVG string to the console.
	 *
	 * @example
	 * const svgBuilder = new SvgBuilder();
	 * svgBuilder.addCircle('circle1', { cx: 50, cy: 50, r: 25, fill: 'green' });
	 * svgBuilder.toSVG('output.svg'); // Writes the generated SVG string to 'output.svg'.
	 */
	toSVG(outputFile = null) {
		console.error(this.calculateBoundingBox());
		if (this.borderMargin <= 0) this.borderMargin = 0;
		if (this.borderWidth <= 0) this.borderWidth = 0;
		if (this.borderPadding <= 0) this.borderPadding = 0;

		if (this.borderMargin > 0 || this.borderWidth > 0 || this.borderPadding > 0) {
			const { minX, minY, maxX, maxY } = this.calculateBoundingBox();
			let totalMarginWidthPadding = this.borderMargin + this.borderWidth + this.borderPadding;
			let totalWidthPadding = this.borderWidth + this.borderPadding;
			let totalPadding = this.borderPadding;

			//////////////////////////////////////////////////////////////////////////
			// Add Margin
			if (this.borderMargin > 0) {
				const marginRectangle = {
					x: minX - totalMarginWidthPadding,
					y: minY - totalMarginWidthPadding,
					width: maxX - minX + totalMarginWidthPadding * 2,
					height: maxY - minY + totalMarginWidthPadding * 2,
					strokeWidth: 0,
					fill: "none",
				};
				this.addRectangle("margin", marginRectangle, true);
			}
			//////////////////////////////////////////////////////////////////////////
			// Add border
			if (this.borderWidth > 0) {
				const borderRectangle = {
					x: minX - totalWidthPadding,
					y: minY - totalWidthPadding,
					width: maxX - minX + totalWidthPadding * 2,
					height: maxY - minY + totalWidthPadding * 2,
					strokeWidth: this.borderWidth,
					fill: "none",
				};
				this.addRectangle("border", borderRectangle, true);
			}
			//////////////////////////////////////////////////////////////////////////
			// Add padding
			if (this.borderPadding > 0) {
				const paddingRectangle = {
					x: minX - totalPadding,
					y: minY - totalPadding,
					width: maxX - minX + totalPadding * 2,
					height: maxY - minY + totalPadding * 2,
					strokeWidth: 0,
					fill: "none",
				};
				this.addRectangle("padding", paddingRectangle, true);
			}
		}
		console.error(this.primitives);
		console.error(this.calculateBoundingBox());
		this.adjustPrimitivesToFitCanvas();
		console.error(this.calculateBoundingBox());

		const svg = create({ version: "1.0" }).ele("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			width: this.width,
			height: this.height,
		});

		const css = this.stylesToCSS();
		if (css) {
			svg.ele("style").txt(css).up();
		}

		for (const [_, primitive] of this.primitives) {
			console.error(primitive);

			const element = svg.ele(primitive.name, primitive.attributes);

			if (primitive.content) {
				element.txt(primitive.content);
			}
		}

		const svgString = svg.end({ prettyPrint: true });

		if (outputFile) {
			fs.writeFileSync(outputFile, svgString);
		} else {
			console.log(svgString);
		}

		return svgString;
	}
}

module.exports = SVGBuilder;
