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

const readline = require("readline");
const uuid = require("node-uuid");
const sanitize = require("sanitize-filename");
const yaml = require("js-yaml");
const fs = require("fs");
const SvgStart = require("./SvgStart.js");

let jsonstr = undefined;
let yamlstr = undefined;

const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const optionDefinitions = [
	{ name: "id", type: String, alias: "I", multiple: false },
	{ name: "inputFile", type: String, alias: "i", multiple: false },
	{ name: "outputFile", type: String, alias: "o", multiple: false },
	{ name: "targetDir", type: String, alias: "t", multiple: false },
	{ name: "verbose", type: Boolean, alias: "v", multiple: false },
	{ name: "force", type: Boolean, alias: "f", multiple: false },
	{ name: "outjson", type: Boolean, alias: "J", multiple: false },
	{ name: "outyaml", type: Boolean, alias: "Y", multiple: false },
	{ name: "yaml", type: Boolean, alias: "y", multiple: false },
	{ name: "nocovertext", type: Boolean, alias: "c", multiple: false },
	{ name: "help", alias: "?", type: Boolean, multiple: false },
];
const sections = [
	{
		header: "sequencer-svg",
		content:
			"Reads JSON or YAML from <stdin> or a file that meets the sequencer specification and generates an SVG file for the sequence diagram produced.",
	},
	{
		header: "Options",
		optionList: [
			{ name: "id", type: String, alias: "I", description: "ID used in <stderr> log lines if -v is provided." },
			{ name: "verbose", type: Boolean, alias: "v", description: "Emit verbose (debug) log messages to <stderr>." },
			{ name: "yaml", type: Boolean, alias: "y", description: "Treat input as YAML instead of JSON." },
			{ name: "inputFile", type: String, alias: "i", description: "Read input from this file instead of <stdin>." },
			{
				name: "outputFile",
				type: String,
				alias: "o",
				description:
					"Write the SVG to this file. If set without a value, a name is built from the title and version. If unset, write SVG to <stdout>.",
			},
			{ name: "targetDir", type: String, alias: "t", description: "Directory to write output files to." },
			{ name: "force", type: Boolean, alias: "f", description: "Overwrite the output file if it exists." },
			{ name: "outjson", type: Boolean, alias: "J", description: "Also write a formatted JSON file." },
			{ name: "outyaml", type: Boolean, alias: "Y", description: "Also write a formatted YAML file." },
			{ name: "nocovertext", type: Boolean, alias: "c", description: "Skip rendering the title, version and description cover text." },
			{ name: "help", alias: "?", type: Boolean, description: "Print this help." },
		],
	},
];

let options = undefined;
try {
	options = commandLineArgs(optionDefinitions);
} catch (error) {
	console.error(error.message);
	process.exit(-1);
}

if (options == undefined || options.id == undefined || options.id == null) options.id = assignId();
if (options.verbose == undefined || options.verbose == null) options.verbose = false;
if (options.help == undefined || options.help == null) options.help = false;
if (options.outjson == undefined || options.outjson == null) options.outjson = false;
if (options.outyaml == undefined || options.outyaml == null) options.outyaml = false;
if (options.yaml == undefined || options.yaml == null) options.yaml = false;
if (options.force == undefined || options.force == null) options.force = false;
if (options.nocovertext == undefined || options.nocovertext == null) options.nocovertext = false;

if (typeof options.help == "boolean" && options.help) {
	const usage = commandLineUsage(sections);
	console.error(usage);
	process.exit(0);
}

if (options.verbose === true) console.error("CLA: " + JSON.stringify(options));

// Read input file or stdin
if (options.inputFile != undefined && options.inputFile != null) {
	try {
		const contents = fs.readFileSync(options.inputFile, "utf8");
		processJsonDescription(getObjectFromData(contents, options.yaml));
	} catch (error) {
		console.error(error.message);
		process.exit(0);
	}
} else {
	let inputstr = "";
	const rl = readline.createInterface({ input: process.stdin });
	rl.on("line", (input) => {
		inputstr += input + "\n";
	});
	rl.on("close", () => {
		processJsonDescription(getObjectFromData(inputstr, options.yaml));
	});
}

function assignId() {
	return uuid.v4();
}

function processJsonDescription(jsondescription) {
	const title = getTitle(jsondescription);
	let ofile = sanitize(title.split(" ").join("_")) + ".svg";
	let jfile = sanitize(title.split(" ").join("_")) + ".json";
	let yfile = sanitize(title.split(" ").join("_")) + ".yaml";

	if (options.targetDir != undefined && options.targetDir != null) {
		jfile = options.targetDir + "/" + jfile;
		yfile = options.targetDir + "/" + yfile;
		ofile = options.targetDir + "/" + ofile;
	}

	const ss = new SvgStart();
	try {
		const cb = ss.draw(jsondescription, null, options.verbose, options.id, options.nocovertext);

		if (options.outputFile === undefined) {
			process.stdout.write(cb);
		} else if (options.outputFile === null && options.force) {
			fs.writeFileSync(ofile, cb);
		} else if (options.outputFile === null && !options.force && fs.existsSync(ofile)) {
			console.error(`Cannot write to file "${ofile}" as it already exists`);
			process.exit(-1);
		} else if (options.outputFile === null && !options.force) {
			fs.writeFileSync(ofile, cb);
		} else if (options.outputFile != null && options.force) {
			fs.writeFileSync(options.outputFile, cb);
		} else if (options.outputFile != null && !options.force && fs.existsSync(options.outputFile)) {
			console.error(`Cannot write to file "${options.outputFile}" as it already exists`);
			process.exit(-1);
		} else if (options.outputFile != null && !options.force) {
			fs.writeFileSync(options.outputFile, cb);
		}

		if (options.outjson) {
			console.log(`+ Writing JSON outfile to ${jfile}`);
			fs.writeFileSync(jfile, jsonstr);
		}
		if (options.outyaml) {
			yamlstr = "## https://github.com/andrewgepearce/sequencer\n" + yamlstr;
			console.log(`+ Writing YAML outfile to ${yfile}`);
			fs.writeFileSync(yfile, yamlstr);
		}
	} catch (error) {
		console.error("Error processing: " + error.message);
		if (options.verbose) console.error(error.stack);
		process.exit(-1);
	}
}

function getTitle(obj) {
	let title = "";
	if (typeof obj != "object") obj = {};
	if (typeof obj.title == "string" && obj.title.length > 0) {
		title += obj.title;
	} else if (isAllStrings(obj.title)) {
		obj.title.forEach((str) => {
			title += str;
		});
	} else if (typeof obj.title == "object" && typeof obj.title.text == "string" && obj.title.text.length > 0) {
		title += obj.title.text;
	} else if (typeof obj.title == "object" && isAllStrings(obj.title.text)) {
		obj.title.text.forEach((str) => {
			title += str;
		});
	} else {
		title += "NoTitleSet";
	}
	title += ".";
	if (typeof obj.version == "string" && obj.version.length > 0) {
		title += obj.version;
	} else if (isAllStrings(obj.version)) {
		obj.version.forEach((str) => {
			title += str;
		});
	} else if (typeof obj.version == "object" && typeof obj.version.text == "string" && obj.version.text.length > 0) {
		title += obj.version.text;
	} else if (typeof obj.version == "object" && isAllStrings(obj.version.text)) {
		obj.version.text.forEach((str) => {
			title += str;
		});
	} else {
		title += ".NoVersionSet";
	}
	return title;
}

function isAllStrings(arr) {
	if (!Array.isArray(arr)) return false;
	let allStr = true;
	arr.forEach((str) => {
		if (typeof str != "string") allStr = false;
	});
	return allStr;
}

function getObjectFromData(data, isYaml) {
	if (isYaml) {
		try {
			const jsono = loadWithSourceLines(data, (msg) => console.error("Warning whilst parsing YAML: " + msg));
			jsonstr = JSON.stringify(jsono, null, 3);
			yamlstr = yaml.safeDump(jsono);
			return jsono;
		} catch (error) {
			console.error("Error whilst parsing YAML: " + error.message);
			process.exit(-1);
		}
	} else {
		try {
			const jsono = JSON.parse(data);
			jsonstr = JSON.stringify(jsono, null, 3);
			annotateJsonWithSourceLines(jsono, data);
			return jsono;
		} catch (error) {
			console.error("Error whilst parsing JSON: " + error);
			process.exit(-1);
		}
	}
}

function loadWithSourceLines(data, onWarning) {
	const opens = [];
	const jsono = yaml.safeLoad(data, {
		onWarning: (error) => onWarning(error.message),
		json: true,
		listener: function (eventType, state) {
			if (eventType === "open") {
				opens.push(state.line);
			} else if (eventType === "close") {
				const startLine = opens.pop();
				if (state.result && typeof state.result === "object") {
					try {
						Object.defineProperty(state.result, "__sourceLine", {
							value: (startLine != null ? startLine : state.line) + 1,
							enumerable: false,
							configurable: true,
							writable: true,
						});
					} catch (e) {
						// Ignore; source-line annotation is best-effort.
					}
				}
			}
		},
	});
	return jsono;
}

function annotateJsonWithSourceLines(parsed, rawData) {
	// Use js-yaml with the source-line listener (JSON is valid YAML) to build a parallel
	// object tree whose mapping/sequence nodes carry __sourceLine. Then walk the two
	// trees in parallel and copy __sourceLine from the yaml-parsed tree onto the
	// JSON.parse tree by structural position (array index, object key).
	let annotated;
	try {
		annotated = loadWithSourceLines(rawData, () => {});
	} catch (e) {
		return;
	}
	copySourceLines(parsed, annotated);
}

function copySourceLines(target, source) {
	if (target == null || source == null) return;
	if (typeof target !== "object" || typeof source !== "object") return;
	if (source.__sourceLine != null) {
		try {
			Object.defineProperty(target, "__sourceLine", {
				value: source.__sourceLine,
				enumerable: false,
				configurable: true,
				writable: true,
			});
		} catch (e) {}
	}
	if (Array.isArray(target) && Array.isArray(source)) {
		const len = Math.min(target.length, source.length);
		for (let i = 0; i < len; i++) copySourceLines(target[i], source[i]);
	} else if (!Array.isArray(target) && !Array.isArray(source)) {
		Object.keys(target).forEach((k) => {
			if (Object.prototype.hasOwnProperty.call(source, k)) copySourceLines(target[k], source[k]);
		});
	}
}
