// Copyright (C) 2019 Mark The Page

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

module.exports = class Utilities {
	static reduceStringToFitWidth(ctx, str, plannedWidth) {
		if (!Utilities.isString(str) || !Utilities.isNumberGt0(plannedWidth)) return null;
		let linew = ctx.measureText(str).width;
		while (linew > plannedWidth) {
			str = str.substring(0, str.length - 2);
			linew = ctx.measureText(str).width;
		}
		return str;
	}

	static replaceTags(tags, lines) {
		if (tags != undefined && Utilities.isAllStrings(tags) && lines != undefined && Utilities.isAllStrings(lines)) {
			for (let i = 0; i < tags.length; i++) {
				let breakIdx = tags[i].indexOf(">=");
				if (tags[i].charAt(0) == "<" && breakIdx != -1) {
					let tag = tags[i].substring(0, breakIdx + 1);
					let rep = tags[i].substring(breakIdx + 2);
					for (let j = 0; j < lines.length; j++) {
						while (lines[j].indexOf(tag) != -1) {
							lines[j] = lines[j].replace(tag, rep);
						}
					}
				}
			}
		}
		return lines;
	}

	static drawTextRectangleNoBorderOrBg(ctx, lines, textMetaData, top, left, width, height, mimic, previousWH, tags) {
		let bgCol = textMetaData.bgColour;
		textMetaData.bgColour = "rgb(0,0,0,0)";
		let xy = Utilities.drawTextRectangle(
			ctx,
			lines,
			textMetaData,
			top,
			left,
			width,
			height,
			0,
			false,
			false,
			false,
			false,
			mimic,
			previousWH,
			tags
		);
		textMetaData.bgColour = bgCol;
		return xy;
	}

	static drawTextRectangle(
		ctx,
		lines,
		textMetaData,
		top,
		left,
		width,
		height,
		cornerRadius,
		drawTopBorder,
		drawRightBorder,
		drawBottomBorder,
		drawLeftBorder,
		mimic,
		previousWH,
		tags
	) {
		// Validate parameters
		if (!Utilities.isObject(textMetaData)) throw new Error("drawTextRectangle: no textMetadata object");
		if (!Utilities.validColour(textMetaData.fgColour)) throw new Error("drawTextRectangle: no valid FG colour");
		if (!Utilities.isBoolean(textMetaData.bold)) throw new Error("drawTextRectangle: text has no indication of bold");
		if (!Utilities.isBoolean(textMetaData.italic)) throw new Error("drawTextRectangle: text has no indication of italic");
		if (!Utilities.isString(lines) && !Utilities.isAllStrings(lines))
			throw new Error("drawTextRectangle: lines must be string or array of strings");
		if (!Utilities.isNumberGtEq0(top)) throw new Error("drawTextRectangle: value for top not a number >= 0");
		if (!Utilities.isNumberGtEq0(textMetaData.spacing)) throw new Error("drawTextRectangle: value for spacing not a number >= 0");
		if (!Utilities.isNumberGtEq0(textMetaData.padding)) throw new Error("drawTextRectangle: value for padding not a number >= 0");
		// We are allowed a value with a negative LEFT
		//if (!Utilities.isNumberGtEq0(left)) throw new Error('drawTextRectangle: value for left not a number > 0');
		if (width != null && width != undefined && !Utilities.isNumberGtEq0(width))
			throw new Error("drawTextRectangle: value for width not a number > 0 AND not undefined");
		if (height != null && height != undefined && !Utilities.isNumberGtEq0(height))
			throw new Error("drawTextRectangle: value for height not a number > 0 AND not undefined");
		if (cornerRadius != null && cornerRadius != undefined && !Utilities.isNumberGtEq0(cornerRadius))
			throw new Error("drawTextRectangle: value for cornerRadius not a number > 0 AND not undefined");
		if (!Utilities.isBoolean(drawTopBorder)) throw new Error("drawTextRectangle: drawTopBorder not a boolean");
		if (!Utilities.isBoolean(drawRightBorder)) throw new Error("drawTextRectangle: drawRightBorder not a boolean");
		if (!Utilities.isBoolean(drawBottomBorder)) throw new Error("drawTextRectangle: drawBottomBorder not a boolean");
		if (!Utilities.isBoolean(drawLeftBorder)) throw new Error("drawTextRectangle: drawLeftBorder not a boolean");
		if (!Utilities.isBoolean(mimic)) throw new Error("drawTextRectangle: mimic not a boolean");

		// Update the lines from the defined tags
		lines = this.replaceTags(tags, lines);

		// Get the lines to write into an array
		let wh = undefined;
		if (
			typeof previousWH == "object" &&
			Utilities.isNumberGtEq0(previousWH.w) &&
			Utilities.isNumberGtEq0(previousWH.h) &&
			Array.isArray(previousWH.lines) &&
			Array.isArray(previousWH.linesMd) &&
			Utilities.isNumberGtEq0(previousWH.sbl)
		) {
			wh = previousWH;
		} else {
			wh = Utilities.getTextWidthAndHeight(ctx, textMetaData, lines, undefined);
		}
		let calcw = wh.w;
		let calch = wh.h;
		lines = wh.lines;
		let linesToWriteMd = wh.linesMd;
		let spaceBetweenLines = wh.sbl;
		let boxw = Utilities.isNumber(width) ? width : calcw;
		let boxh = Utilities.isNumber(height) ? height : calch;

		// Draw the surrounding rectangle
		let xy = Utilities.drawRectangle(
			ctx,
			textMetaData.borderWidth,
			textMetaData.borderColour,
			textMetaData.borderDash,
			textMetaData.bgColour,
			top,
			left,
			boxw,
			boxh,
			cornerRadius,
			drawTopBorder,
			drawRightBorder,
			drawBottomBorder,
			drawLeftBorder,
			mimic
		);
		if (mimic) return xy;

		// We have now drawn the surrounding rectangle. Now draw the text...
		let vpadding = textMetaData.vpadding == undefined ? textMetaData.padding : textMetaData.vpadding;

		let topPadding = boxh > calch ? vpadding / 2 + (boxh - calch) / 2 : vpadding / 2;
		let textBase = top + topPadding;
		ctx.textBaseline = "alphabetic"; // Could also be ctx.textBaseline = "top";
		let writeLine = true;
		let previousLineLeftPosition = undefined;
		let previousLineRightPosition = undefined;
		let previousLineTextBase = undefined;
		let previousLineHadHang = false;
		for (let i = 0; i < linesToWriteMd.length && writeLine; i++) {
			let lineToWriteMd = linesToWriteMd[i];
			let heightOfLine = lineToWriteMd.height;
			let textleft = undefined;
			if ((textMetaData.align == "center" || textMetaData.align == "centre") && lineToWriteMd.width < boxw) {
				// Align is CENTER
				textleft = left + boxw / 2 - lineToWriteMd.width / 2;
				textBase += heightOfLine;
				if (i > 0) textBase += spaceBetweenLines;
			} else if (textMetaData.align == "right" && lineToWriteMd.width + textMetaData.padding < boxw) {
				// Align is RIGHT
				textleft = left + boxw - lineToWriteMd.width - textMetaData.padding / 2;
				textBase += heightOfLine;
				if (i > 0) textBase += spaceBetweenLines;
			} else {
				// Align is LEFT
				// This line is hanging, but is the first after a non hanging line
				// So place to the right and not underneath the previous line
				if (
					lineToWriteMd.hang &&
					!previousLineHadHang &&
					Utilities.isNumberGtEq0(previousLineRightPosition) &&
					Utilities.isNumberGtEq0(previousLineTextBase)
				) {
					textleft = previousLineRightPosition;
					textBase = previousLineTextBase;
				}
				// This line is hanging, and is NOT the first after a non hanging line
				// So place underneath but at the hanging position (i.e. text left of the
				// previous hanging line)
				else if (
					lineToWriteMd.hang &&
					previousLineHadHang &&
					Utilities.isNumberGtEq0(previousLineLeftPosition) &&
					Utilities.isNumberGtEq0(previousLineTextBase)
				) {
					textleft = previousLineLeftPosition;
					textBase += heightOfLine;
					if (i > 0) textBase += spaceBetweenLines;
				}
				// This line is not hanging. Place underneath at the standard left position
				else {
					textleft = left + textMetaData.padding / 2;
					if (linesToWriteMd.length > i + 1) {
						let heightOfNextLine = linesToWriteMd[i + 1].height;
						textBase += linesToWriteMd[i + 1].hang && heightOfNextLine > heightOfLine ? heightOfNextLine : heightOfLine;
					} else {
						textBase += heightOfLine;
					}
					if (i > 0) textBase += spaceBetweenLines;
				}
			}
			let writePart = true;
			if (textBase > top + boxh) {
				writeLine = false;
			}
			previousLineLeftPosition = textleft;
			for (let j = 0; j < lineToWriteMd.metadata.length && writePart && writeLine; j++) {
				let partText = lineToWriteMd.metadata[j].text;
				let partWidth = lineToWriteMd.metadata[j].width;
				let partBold = lineToWriteMd.metadata[j].bold === true ? "bold " : "";
				let partItalic = lineToWriteMd.metadata[j].italic === true ? "italic " : "";
				let partFontSz = Utilities.isNumberGt0(lineToWriteMd.metadata[j].fontSizePx)
					? lineToWriteMd.metadata[j].fontSizePx + "px "
					: undefined;
				let partFontFamily = Utilities.isString(lineToWriteMd.metadata[j].fontFamily) ? lineToWriteMd.metadata[j].fontFamily : undefined;
				if (partFontSz == undefined || partFontFamily == undefined) {
					throw new Error("drawTextRectangle: text part must have font size and font family - " + JSON.stringify(lineToWriteMd.metadata));
				}
				ctx.font = partBold + partItalic + partFontSz + partFontFamily;
				ctx.fillStyle = lineToWriteMd.metadata[j].colour;
				if (textleft + partWidth > left + boxw) {
					partText = Utilities.reduceStringToFitWidth(ctx, partText, left + boxw - textleft);
					writePart = false; // Break writing the parts
				}
				ctx.fillText(partText, textleft, textBase);
				textleft += lineToWriteMd.metadata[j].width;
			}
			previousLineRightPosition = textleft;
			previousLineTextBase = textBase;
			if (lineToWriteMd.hang) {
				previousLineHadHang = true;
			} else {
				previousLineHadHang = false;
			}
		}

		return {
			x: left + boxw,
			y: top + boxh,
		};
	}

	static getTextWidthAndHeight(ctx, textMetaData, lines, tags) {
		let localFont = textMetaData.fontFamily;
		let localSize = textMetaData.fontSizePx;
		let localColour = textMetaData.fgColour;
		let localBold = textMetaData.bold;
		let localItalic = textMetaData.italic;
		let vpadding = textMetaData.vpadding == undefined ? textMetaData.padding : textMetaData.vpadding;
		let linesToWrite = [];
		if (Utilities.isString(lines)) {
			linesToWrite.push(lines);
		} else {
			linesToWrite = lines;
		}

		// Update the lines from the defined tags
		if (tags != undefined) linesToWrite = this.replaceTags(tags, linesToWrite);

		// Get the array of metadata objects for each line
		let linesToWriteMd = [];
		for (let i = 0; i < linesToWrite.length; i++) {
			let line = linesToWrite[i];
			if (line.startsWith("!!bold=")) {
				localBold = line.substring("!!bold=".length);
				if (localBold.toLowerCase() != "true") {
					localBold = false;
				} else {
					localBold = true;
				}
			} else if (line.startsWith("!!italic=")) {
				localItalic = line.substring("!!italic=".length);
				if (localItalic.toLowerCase() != "true") {
					localItalic = false;
				} else {
					localItalic = true;
				}
			} else if (line.startsWith("!!fontFamily=")) {
				localFont = line.substring("!!fontFamily=".length);
				if (!Utilities.isString(localFont) || localFont.length == 0) {
					localFont = fontFamily;
				}
			} else if (line.startsWith("!!fontSizePx=")) {
				localSize = line.substring("!!fontSizePx=".length);
				if (!Utilities.isNumberGt0(parseInt(localSize, 10))) {
					localSize = fontSizePx;
				}
			} else if (line.startsWith("!!fgColour=")) {
				localColour = line.substring("!!fgColour=".length);
				if (!Utilities.validColour(localColour)) {
					localColour = fgColour;
				}
			} else {
				linesToWriteMd.push(Utilities.getTextMetadata(ctx, line, localSize, localFont, localBold, localItalic, localColour));
			}
		}
		// Calculate width and height of box
		let calcw = 0;
		let calch = 0;
		let spaceBetweenLines = textMetaData.spacing > 1 ? textMetaData.fontSizePx * (textMetaData.spacing - 1) : 0;
		let lastLineWidth = undefined;
		let lastLineHeight = undefined;
		let lastLineHanging = undefined;
		let hangOffset = 0;
		for (let i = 0; i < linesToWriteMd.length; i++) {
			let thisLineWidth = linesToWriteMd[i].width;
			let thisLineHeight = linesToWriteMd[i].height;
			let thisLineHanging = linesToWriteMd[i].hang;
			if (lastLineHanging === false && thisLineHanging === true) {
				hangOffset = lastLineWidth;
				if (thisLineWidth + hangOffset > calcw) calcw = thisLineWidth + hangOffset;
				if (thisLineHeight > lastLineHeight) calch += thisLineHeight - lastLineHeight;
			} else if (lastLineHanging === true && thisLineHanging === true) {
				if (thisLineWidth + hangOffset > calcw) calcw = thisLineWidth + hangOffset;
				calch += thisLineHeight + spaceBetweenLines;
			} else {
				if (thisLineWidth > calcw) calcw = thisLineWidth;
				calch += thisLineHeight + spaceBetweenLines;
				hangOffset = 0;
			}
			lastLineWidth = thisLineWidth;
			lastLineHeight = thisLineHeight;
			lastLineHanging = thisLineHanging;
		}
		calcw = Math.ceil(calcw + textMetaData.padding);
		calch = Math.ceil(calch + vpadding);
		return {
			w: calcw,
			h: calch,
			lines: linesToWrite,
			linesMd: linesToWriteMd,
			sbl: spaceBetweenLines,
		};
	}

	static getTextPartWidth(ctx, textPart, fontSizePx, fontFamily, bold, italic) {
		if (!Utilities.isString(textPart)) return 0;
		if (bold && italic) {
			ctx.font = "bold italic" + fontSizePx + "px " + fontFamily;
		} else if (bold) {
			ctx.font = "bold " + fontSizePx + "px " + fontFamily;
		} else if (italic) {
			ctx.font = "italic " + fontSizePx + "px " + fontFamily;
		} else {
			ctx.font = fontSizePx + "px " + fontFamily;
		}
		return ctx.measureText(textPart).width;
	}

	static getTextMetadata(ctx, line, fontSizePx, fontFamily, bold, italic, colour) {
		if (!Utilities.isString(line)) return 0;
		const regexp = /(\<[a-zA-Z0-9\(\)\+\,\-\_\/\=\ ]*\>)/;
		const setItalic = /\<[Ii]\>/;
		const clearItalic = /\<\/[Ii]\>/;
		const setBold = /\<[Bb]\>/;
		const lessThanReplace = /(?<!\\)(&lt;)/g;
		const greaterThanReplace = /(?<!\\)(&gt;)/g;
		const lessThanReal = /(\\&lt;)/g;
		const greaterThanReal = /(\\&gt;)/g;
		const clearBold = /\<\/[Bb]\>/;
		const setColour = /(\<)([Rr][Gg][Bb]\( *\d{1,3} *, *\d{1,3} *, *\d{1,3} *\))( *\>)/;
		const clearColour = /\<\/[Rr][Gg][Bb]\>/;
		const setSize = /(\<[Pp][Xx])(\d{1,3})( *\>)/;
		const setSizeInc = /(\<[Ss][Zz])([+-]{1,3})( *\>)/;
		const clearSize = /\<\/[Pp][Xx]\>/;
		const setFont = /(\<[Ff][Oo][Nn][Tt] *\= *)([A-Za-z\-]+)( *\>)/;
		const clearFont = /\<\/[Ff][Oo][Nn][Tt]\>/;
		const setHang = /\<[Hh][Aa][Nn][Gg]\>/;
		let lineparts = line.split(regexp);
		let currentFontFamily = fontFamily;
		let currentFontSizePx = fontSizePx;
		let currentBold = bold;
		let currentItalic = italic;
		let currentWidth = 0;
		let currentMaxHeight = fontSizePx;
		let currentColour = colour;
		let currentHang = false;
		let lineMetadata = [];
		let r = undefined;
		for (let i = 0; i < lineparts.length; i++) {
			if (lineparts[i].match(setItalic) != null) {
				currentItalic = true;
			} else if (lineparts[i].match(clearItalic) != null) {
				currentItalic = false;
			} else if (lineparts[i].match(setHang) != null) {
				currentHang = true;
			} else if (lineparts[i].match(setBold) != null) {
				currentBold = true;
			} else if (lineparts[i].match(clearBold) != null) {
				currentBold = false;
			} else if ((r = lineparts[i].match(setSize)) != null) {
				if (r.length >= 3) {
					let val = parseInt(r[2]);
					if (val != NaN) {
						currentFontSizePx = val;
						if (currentMaxHeight < currentFontSizePx) currentMaxHeight = currentFontSizePx;
					}
				}
			} else if ((r = lineparts[i].match(setSizeInc)) != null) {
				if (r.length >= 3) {
					if (r[2] == "+") currentFontSizePx += 2;
					else if (r[2] == "++") currentFontSizePx += 4;
					else if (r[2] == "+++") currentFontSizePx += 6;
					else if (r[2] == "-") currentFontSizePx -= 2;
					else if (r[2] == "--") currentFontSizePx -= 4;
					else if (r[2] == "---") currentFontSizePx -= 6;
					if (currentMaxHeight < currentFontSizePx) currentMaxHeight = currentFontSizePx;
				}
			} else if (lineparts[i].match(clearSize) != null) {
				currentFontSizePx = fontSizePx;
			} else if ((r = lineparts[i].match(setFont)) != null) {
				if (r.length >= 3) {
					currentFontFamily = r[2];
				}
			} else if (lineparts[i].match(clearFont)) {
				currentFontFamily = fontFamily;
			} else if ((r = lineparts[i].match(setColour)) != null) {
				if (r.length >= 3) {
					currentColour = r[2];
					currentColour.toLowerCase();
					currentColour = currentColour.replace(/\s/g, "");
				}
			} else if (lineparts[i].match(clearColour)) {
				currentColour = colour;
			} else {
				if (
					ctx != undefined &&
					Utilities.isNumberGtEq0(currentFontSizePx) &&
					Utilities.isString(currentFontFamily) &&
					Utilities.isString(lineparts[i]) &&
					lineparts[i].length > 0 &&
					typeof bold == "boolean" &&
					typeof italic == "boolean"
				) {
					let txtPart = lineparts[i].valueOf();
					txtPart = txtPart.replace(lessThanReplace, "<");
					txtPart = txtPart.replace(greaterThanReplace, ">");
					txtPart = txtPart.replace(lessThanReal, "&lt;");
					txtPart = txtPart.replace(greaterThanReal, "&gt;");
					let md = {
						text: txtPart,
						fontSizePx: currentFontSizePx,
						fontFamily: currentFontFamily,
						bold: currentBold,
						italic: currentItalic,
						colour: currentColour,
						height: undefined,
						startOffset: currentWidth,
						width: Utilities.getTextPartWidth(ctx, txtPart, currentFontSizePx, currentFontFamily, currentBold, currentItalic),
					};
					currentWidth += md.width;
					lineMetadata.push(md);
				}
			}
		}

		if (ctx == undefined) {
			return {
				width: undefined,
				height: currentMaxHeight,
				hang: currentHang,
				metadata: undefined,
			};
		} else {
			for (let i = 0; i < lineMetadata.length; i++) {
				lineMetadata[i].height = currentMaxHeight;
			}
			return {
				width: Math.ceil(currentWidth),
				height: currentMaxHeight,
				hang: currentHang,
				metadata: lineMetadata,
			};
		}
	}

	static drawRectangle(
		ctx,
		borderWidth,
		borderColour,
		borderDash,
		fillColour,
		top,
		left,
		width,
		height,
		cornerRadius,
		drawTopBorder,
		drawRightBorder,
		drawBottomBorder,
		drawLeftBorder,
		mimic
	) {
		if (
			!Utilities.isNumber(top) ||
			!Utilities.isNumber(left) ||
			!Utilities.isNumber(width) ||
			!Utilities.isNumber(height) ||
			width < 0 ||
			height < 0 ||
			typeof mimic != "boolean"
		) {
			return "undefined";
		}

		// if (top < 0) {
		//    top = 1;
		// }

		// if (left < 0) {
		//    left = 0;
		// }

		/////////////////////
		// Draw the rectangle anticlockwise from the top left (not including the corner)
		if (Utilities.isNumber(cornerRadius) && cornerRadius > 0) {
			ctx.beginPath();
			ctx.moveTo(left, top + cornerRadius);
			ctx.lineTo(left, top + height - cornerRadius);
			ctx.arcTo(left, top + height, left + cornerRadius, top + height, cornerRadius);
			ctx.lineTo(left + width - cornerRadius, top + height);
			ctx.arcTo(left + width, top + height, left + width, top + height - cornerRadius, cornerRadius);
			ctx.lineTo(left + width, top + cornerRadius);
			ctx.arcTo(left + width, top, left + width - cornerRadius, top, cornerRadius);
			ctx.lineTo(left + cornerRadius, top);
			ctx.arcTo(left, top, left, top + cornerRadius, cornerRadius);
			if (!mimic) {
				if (Utilities.validColour(fillColour)) {
					ctx.fillStyle = fillColour;
					ctx.fill();
				}
				if (Utilities.isNumber(borderWidth) && borderWidth > 0 && borderColour != undefined) {
					if (!Array.isArray(borderDash)) borderDash = [];
					let oldStrokeStyle = ctx.strokeStyle;
					let oldLineDash = ctx.getLineDash();
					let oldLineWidth = ctx.lineWidth;
					ctx.strokeStyle = borderColour;
					ctx.setLineDash(borderDash);
					ctx.lineWidth = borderWidth;
					ctx.stroke();
					ctx.strokeStyle = oldStrokeStyle;
					ctx.setLineDash(oldLineDash);
					ctx.lineWidth = oldLineWidth;
				}
			}
		} else {
			ctx.beginPath();
			ctx.moveTo(left, top);
			mimic ? ctx.moveTo(left, top + height) : ctx.lineTo(left, top + height);
			mimic ? ctx.moveTo(left + width, top + height) : ctx.lineTo(left + width, top + height);
			mimic ? ctx.moveTo(left + width, top) : ctx.lineTo(left + width, top);
			mimic ? ctx.moveTo(left, top) : ctx.lineTo(left, top);
			if (!mimic) {
				if (Utilities.validColour(fillColour)) {
					ctx.fillStyle = fillColour;
					ctx.fill();
				}
				if (Utilities.isNumber(borderWidth) && borderWidth > 0 && borderColour != undefined) {
					if (!Array.isArray(borderDash)) borderDash = [];
					let oldStrokeStyle = ctx.strokeStyle;
					let oldLineDash = ctx.getLineDash();
					let oldLineWidth = ctx.lineWidth;
					ctx.strokeStyle = borderColour;
					ctx.setLineDash(borderDash);
					ctx.lineWidth = borderWidth;
					ctx.beginPath();
					ctx.moveTo(left, top);
					!drawLeftBorder ? ctx.moveTo(left, top + height) : ctx.lineTo(left, top + height);
					!drawBottomBorder ? ctx.moveTo(left + width, top + height) : ctx.lineTo(left + width, top + height);
					!drawRightBorder ? ctx.moveTo(left + width, top) : ctx.lineTo(left + width, top);
					!drawTopBorder ? ctx.moveTo(left, top) : ctx.lineTo(left, top);
					if (Utilities.validColour(borderColour)) {
						ctx.stroke();
					}
					ctx.strokeStyle = oldStrokeStyle;
					ctx.setLineDash(oldLineDash);
					ctx.lineWidth = oldLineWidth;
				}
			}
		}
		// Utilities.drawRectangeSvg(
		// 	borderWidth,
		// 	borderColour,
		// 	borderDash,
		// 	fillColour,
		// 	top,
		// 	left,
		// 	width,
		// 	height,
		// 	cornerRadius,
		// 	drawTopBorder,
		// 	drawRightBorder,
		// 	drawBottomBorder,
		// 	drawLeftBorder
		// );

		return {
			x: left + width,
			y: top + height,
		};
	}

	// static drawRectangeSvg({
	// 	borderWidth = 1,
	// 	borderColor = "black",
	// 	borderDash = [],
	// 	fillColor = "none",
	// 	top = 0,
	// 	left = 0,
	// 	width = 100,
	// 	height = 100,
	// 	cornerRadius = 0,
	// 	drawTopBorder = true,
	// 	drawRightBorder = true,
	// 	drawBottomBorder = true,
	// 	drawLeftBorder = true,
	// } = {}) {
	// 	////////////////////////////////////////////////////////////////////////////
	// 	// Ensure cornerRadius does not exceed half of width or height
	// 	const radius = Math.min(cornerRadius, width / 2, height / 2);
	// 	////////////////////////////////////////////////////////////////////////////
	// 	// Starting point
	// 	let d = `M ${left + radius}, ${top}`;
	// 	////////////////////////////////////////////////////////////////////////////
	// 	// Top border
	// 	if (drawTopBorder) {
	// 		d += ` H ${left + width - radius}`;
	// 		if (radius > 0) {
	// 			d += ` A ${radius},${radius} 0 0 1 ${left + width},${top + radius}`;
	// 		}
	// 	} else {
	// 		d += ` M ${left + width}, ${top}`;
	// 	}
	// 	////////////////////////////////////////////////////////////////////////////
	// 	// Right border
	// 	if (drawRightBorder) {
	// 		d += ` V ${top + height - radius}`;
	// 		if (radius > 0) {
	// 			d += ` A ${radius},${radius} 0 0 1 ${left + width - radius},${top + height}`;
	// 		}
	// 	} else {
	// 		d += ` M ${left + width}, ${top + height}`;
	// 	}
	// 	////////////////////////////////////////////////////////////////////////////
	// 	// Bottom border
	// 	if (drawBottomBorder) {
	// 		d += ` H ${left + radius}`;
	// 		if (radius > 0) {
	// 			d += ` A ${radius},${radius} 0 0 1 ${left},${top + height - radius}`;
	// 		}
	// 	} else {
	// 		d += ` M ${left}, ${top + height}`;
	// 	}
	// 	////////////////////////////////////////////////////////////////////////////
	// 	// Left border
	// 	if (drawLeftBorder) {
	// 		d += ` V ${top + radius}`;
	// 		if (radius > 0) {
	// 			d += ` A ${radius},${radius} 0 0 1 ${left + radius},${top}`;
	// 		}
	// 	} else {
	// 		d += ` M ${left}, ${top}`;
	// 	}
	// 	////////////////////////////////////////////////////////////////////////////
	// 	d += " Z"; // Close path
	// 	////////////////////////////////////////////////////////////////////////////
	// 	// Create the SVG path element as a string
	// 	const pathObject = { d, className: null, fill: "none", stroke: borderColor, strokeWidth: borderWidth, strokeDashArray: borderDash };
	// 	svg.addPath(`${process.hrtime.bigint()}`, pathObject);
	// 	svg.toSVG(`./test3.svg`);
	// }

	static drawOrMovePath(ctx, x, y, move) {
		if (typeof move === "boolean" && move) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}

	static drawOrMoveArcTo(ctx, x1, y1, x2, y2, radius, move) {
		if (typeof move === "boolean" && move) {
			ctx.moveTo(x1, y1);
			ctx.moveTo(x2, y2);
		} else {
			ctx.arcTo(x1, y1, x2, y2, radius);
		}
	}

	static jsonCopy(src) {
		return JSON.parse(JSON.stringify(src));
	}

	static isString(variableToCheck) {
		if (typeof variableToCheck == "string" && variableToCheck != null) return true;
		return false;
	}

	static isBoolean(variableToCheck) {
		if (typeof variableToCheck == "boolean" && variableToCheck != null) return true;
		return false;
	}

	static isNumber(variableToCheck) {
		if (typeof variableToCheck == "number") return true;
		return false;
	}

	static isNumberGt0(variableToCheck) {
		if (Utilities.isNumber(variableToCheck) && variableToCheck > 0) return true;
		return false;
	}

	static isNumberGtEq0(variableToCheck) {
		if (Utilities.isNumber(variableToCheck) && variableToCheck >= 0) return true;
		return false;
	}

	static isAllNumber(arr) {
		if (!Array.isArray(arr)) return false;
		let allNum = true;
		arr.forEach((num) => {
			if (!Utilities.isNumber(num)) allNum = false;
		});
		return allNum;
	}

	static isAllStrings(arr) {
		if (!Array.isArray(arr)) return false;
		let allStr = true;
		arr.forEach((str) => {
			if (!Utilities.isString(str)) allStr = false;
		});
		return allStr;
	}

	static isObject(variableToCheck) {
		if (typeof variableToCheck == "object" && variableToCheck != null) return true;
		return false;
	}

	static validRGBColour(stringColour) {
		if (typeof stringColour != "string") return false;
		stringColour = stringColour.replace(/\s/g, "");
		var n = stringColour.search(/rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)/);
		if (n != 0) return false;
		// Val 1
		var val1start = stringColour.search(/[0-9]{1,3}/);
		var val1end = stringColour.search(/,/);
		var v1 = parseInt(stringColour.substring(val1start, val1end));
		// Val 2
		var val2start = val1end + 1;
		stringColour = stringColour.substring(val2start);
		var val2end = stringColour.search(/,/);
		var v2 = parseInt(stringColour.substring(0, val2end));
		// Val 3
		var val3start = val2end + 1;
		stringColour = stringColour.substring(val3start);
		var val3end = stringColour.search(/\)/);
		var v3 = parseInt(stringColour.substring(0, val3end));
		// Check values
		if (v1 >= 0 && v1 <= 255 && v2 >= 0 && v2 <= 255 && v3 >= 0 && v3 <= 255) return true;
		else return false;
	}

	static validRGBAColour(stringColour) {
		if (typeof stringColour != "string") return false;
		var n = stringColour.search(/rgba\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},(0|1|(0.[0-9]+)|(.[0-9]+))\)/);
		if (n != 0) return false;
		// Val 1
		var val1start = stringColour.search(/[0-9]{1,3}/);
		var val1end = stringColour.search(/,/);
		var v1 = parseInt(stringColour.substring(val1start, val1end));
		// Val 2
		var val2start = val1end + 1;
		stringColour = stringColour.substring(val2start);
		var val2end = stringColour.search(/,/);
		var v2 = parseInt(stringColour.substring(0, val2end));
		// Val 3
		var val3start = val2end + 1;
		stringColour = stringColour.substring(val3start);
		var val3end = stringColour.search(/,/);
		var v3 = parseInt(stringColour.substring(0, val3end));
		// Val 4
		var val4start = val3end + 1;
		stringColour = stringColour.substring(val4start);
		var val4end = stringColour.search(/\)/);
		var v4 = parseFloat(stringColour.substring(0, val4end));
		if (v1 >= 0 && v1 <= 255 && v2 >= 0 && v2 <= 255 && v3 >= 0 && v3 <= 255 && v4 >= 0 && v4 <= 1) return true;
		else return false;
	}

	static validColour(stringColour) {
		return Utilities.validRGBColour(stringColour) || Utilities.validRGBAColour(stringColour);
	}

	static getRandomColour() {
		//var letters = '0123456789';
		var colour =
			"rgb(" + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ")";
		return colour;
	}

	static drawActiveFragments(working, ctx, starty, height, mimic) {
		if (Array.isArray(working.activeFragments)) {
			working.activeFragments.forEach((frag) => {
				Utilities.drawRectangle(
					ctx,
					frag.borderWidth,
					frag.borderColour,
					frag.borderDash,
					frag.colour,
					starty,
					frag.fragmentStartX,
					frag.fragmentEndX - frag.fragmentStartX,
					height,
					0,
					false,
					true,
					false,
					true,
					mimic
				);
			});
		}
	}

	static objToString(obj) {
		if (typeof obj != "object") return "";
		let res = "";
		for (let [key, value] of Object.entries(obj)) {
			if (typeof value == "string") res += `${key}: "${value}"`;
			else res += `${key}: ${value}`;
			res += ", ";
		}
		return res.slice(0, -2);
	}
};
