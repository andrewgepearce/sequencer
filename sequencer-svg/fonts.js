const path = require("path");
const fontsDir = path.join(__dirname, "fonts");

module.exports = {
	families: {
		"sans-serif": {
			normal: path.join(fontsDir, "LiberationSans-Regular.ttf"),
			bold: path.join(fontsDir, "LiberationSans-Bold.ttf"),
			italic: path.join(fontsDir, "LiberationSans-Italic.ttf"),
			boldItalic: path.join(fontsDir, "LiberationSans-BoldItalic.ttf"),
		},
		serif: {
			normal: path.join(fontsDir, "LiberationSerif-Regular.ttf"),
			bold: path.join(fontsDir, "LiberationSerif-Bold.ttf"),
			italic: path.join(fontsDir, "LiberationSerif-Italic.ttf"),
			boldItalic: path.join(fontsDir, "LiberationSerif-BoldItalic.ttf"),
		},
		monospace: {
			normal: path.join(fontsDir, "LiberationMono-Regular.ttf"),
			bold: path.join(fontsDir, "LiberationMono-Bold.ttf"),
			italic: path.join(fontsDir, "LiberationMono-Italic.ttf"),
			boldItalic: path.join(fontsDir, "LiberationMono-BoldItalic.ttf"),
		},
	},
	svgFamilyNames: {
		"sans-serif": "Liberation Sans, Arial, Helvetica, sans-serif",
		serif: "Liberation Serif, Times New Roman, Times, serif",
		monospace: "Liberation Mono, Courier New, Courier, monospace",
	},
};
