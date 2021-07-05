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
const Canvas = require("canvas");
const sanitize = require("sanitize-filename");
const yaml = require("js-yaml");
const CanvasStart = require("./canvasStart.js");

let jsonstr = undefined;
let yamlstr = undefined;

const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const optionDefinitions = [
	{
		name: "id",
		type: String,
		alias: "I",
		multiple: false,
	},
	{
		name: "inputFile",
		type: String,
		alias: "i",
		multiple: false,
	},
	{
		name: "outputFile",
		type: String,
		alias: "o",
		multiple: false,
	},
	{
		name: "targetDir",
		type: String,
		alias: "t",
		multiple: false,
	},
	{
		name: "verbose",
		type: Boolean,
		alias: "v",
		multiple: false,
	},
	{
		name: "force",
		type: Boolean,
		alias: "f",
		multiple: false,
	},
	{
		name: "pdf",
		type: Boolean,
		alias: "d",
		multiple: false,
	},
	{
		name: "yaml",
		type: Boolean,
		alias: "y",
		multiple: false,
	},
	{
		name: "help",
		alias: "?",
		type: Boolean,
		multiple: false,
	},
];
const sections = [
	{
		header: "sequencer",
		content:
			"This node application reads JSON or YAML from <stdin> or a file that meets the sequencer specification and generates a PNG or PDF file for the sequence diagram produced",
	},
	{
		header: "Options",
		optionList: [
			{
				name: "id",
				type: String,
				alias: "I",
				description: "The ID used in the <stderr> log lines produced by the tool if -v is provided.",
			},
			{
				name: "verbose",
				type: Boolean,
				alias: "v",
				description: "If set, then the tool produced verbose (i.e. debug level) log messages to <stderr>",
			},
			{
				name: "yaml",
				type: Boolean,
				alias: "y",
				description:
					"If set, the input description (whether from file or <stdin>) is exected to be in YAML format. If not set, expected to be in JSON format.",
			},
			{
				name: "inputFile",
				type: String,
				alias: "i",
				description: "If set, the file to read the input description from. If not set, read from <stdin>.",
			},
			{
				name: "outputFile",
				type: String,
				alias: "o",
				description:
					"If set, the file to write the processed flie to. If not set, write to from <stdout>. If set but with no " +
					"filename then the name of the file is built from the title and version of the sequence description. If " +
					"the input is YAML, and there is no outputFile set, then the tool will write a formatted JSON and YAML file as well as the PNG or PDF.",
			},
			{
				name: "targetDir",
				type: String,
				alias: "t",
				description: "If set, the target directory to write output files to",
			},
			{
				name: "force",
				type: Boolean,
				alias: "f",
				description: "If set, the output file is overwrites any input file of the same name. Only relevent if -o option is used",
			},
			{
				name: "pdf",
				type: Boolean,
				alias: "d",
				description: "If set, then the output document will be in PDF format. Otherwise it will be in PNG format.",
			},
			{
				name: "help",
				alias: "?",
				type: Boolean,
				description: "Print this help",
			},
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

if (options == undefined || options.id == undefined || options.id == null) {
	options.id = assignId();
}
if (options == undefined || options.verbose == undefined || options.verbose == null) {
	options.verbose = false;
}
if (options == undefined || options.help == undefined || options.help == null) {
	options.help = false;
}
if (options == undefined || options.pdf == undefined || options.pdf == null) {
	options.pdf = false;
}
if (options == undefined || options.yaml == undefined || options.yaml == null) {
	options.yaml = false;
}
if (options == undefined || options.force == undefined || options.force == null) {
	options.force = false;
}
if (options != undefined && typeof options.help == "boolean" && options.help) {
	const usage = commandLineUsage(sections);
	console.error(usage);
	process.exit(0);
}

if (options.verbose === true) console.error("CLA: " + JSON.stringify(options));

// *********************
// READ AN INPUT FILE
if (options.inputFile != undefined && options.inputFile != null) {
	var fs = require("fs");
	try {
		var contents = fs.readFileSync(options.inputFile, "utf8");
		processJsonDescription(getObjectFromData(contents, options.yaml));
	} catch (error) {
		console.error(error.message);
		process.exit(0);
	}
}

// *********************
// READ FROM STDIN
else {
	let inputstr = "";
	const rl = readline.createInterface({
		input: process.stdin,
	});
	rl.on("line", (input) => {
		inputstr += input;
		inputstr += "\n";
	});
	rl.on("close", (input) => {
		processJsonDescription(getObjectFromData(inputstr, options.yaml));
	});
}

// *******************************
function assignId() {
	return uuid.v4();
}

// *******************************
function processJsonDescription(jsondescription) {
	let title = getTitle(jsondescription);
	var ofile = sanitize(title.split(" ").join("_")) + (options.pdf ? ".pdf" : ".png");
	var jfile = sanitize(title.split(" ").join("_")) + ".json";
	var yfile = sanitize(title.split(" ").join("_")) + ".yaml";

	if (options.targetDir != undefined && options.targetDir != null) jfile = options.targetDir + "/" + jfile;
	if (options.targetDir != undefined && options.targetDir != null) yfile = options.targetDir + "/" + yfile;
	if (options.targetDir != undefined && options.targetDir != null) ofile = options.targetDir + "/" + ofile;

	let cs = new CanvasStart();
	try {
		let cb = null;
		if (options.pdf == false) {
			cb = cs.draw(Canvas.createCanvas(100, 100), jsondescription, null, options.verbose, options.id);
		} else {
			cb = cs.draw(Canvas.createCanvas(100, 100, "pdf"), jsondescription, null, options.verbose, options.id);
		}
		if (options.outputFile === undefined) {
			process.stdout.write(cb);
		} else if (options.outputFile === null && options.force) {
			fs.writeFileSync(ofile, cb);
		} else if (options.outputFile === null && options.force != true && fs.existsSync(ofile)) {
			console.error(`Cannot write to file "${ofile}" as it already exists`);
			process.exit(-1);
		} else if (options.outputFile === null && options.force != true) {
			fs.writeFileSync(ofile, cb);
		} else if (options.outputFile != null && options.force) {
			fs.writeFileSync(options.outputFile, cb);
		} else if (options.outputFile != null && options.force != true && fs.existsSync(options.outputFile)) {
			console.error(`Cannot write to file "${ofile}" as it already exists`);
			process.exit(-1);
		} else if (options.outputFile != null && options.force != true) {
			fs.writeFileSync(options.outputFile, cb);
		}
		if (options.yaml && options.outputFile === null) {
			fs.writeFileSync(jfile, jsonstr);
		}
		if (options.yaml && options.outputFile === null) {
			yamlstr = "## https://github.com/markthepage/sequencer\n" + yamlstr;
			fs.writeFileSync(yfile, yamlstr);
		}
	} catch (error) {
		console.error("Error processing: " + error.message);
		process.exit(-1);
	}
}

// *******************************
function getTitle(obj) {
	var title = "";
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

// *******************************
function isAllStrings(arr) {
	if (!Array.isArray(arr)) return false;
	let allStr = true;
	arr.forEach((str) => {
		if (!typeof str == "string") allStr = false;
	});
	return allStr;
}

// *******************************
function getObjectFromData(data, isYaml) {
	if (isYaml) {
		try {
			let jsono = yaml.safeLoad(data, {
				onWarning: (error) => {
					console.error("Warning whilst parsing YAML: " + error.message);
				},
				json: true,
			});
			jsonstr = JSON.stringify(jsono, null, 3);
			yamlstr = yaml.safeDump(jsono);
			return jsono;
		} catch (error) {
			console.error("Error whilst parsing YAML: " + error.message);
			process.exit(-1);
		}
	} else {
		try {
			let jsono = JSON.parse(data);
			jsonstr = JSON.stringify(jsono, null, 3);
			return jsono;
		} catch (error) {
			console.error("Error whilst parsing JSON: " + error);
			process.exit(-1);
		}
	}
}
