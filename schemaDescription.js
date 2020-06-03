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

const _schemaUtils = require("./schemaUtils.js");
module.exports._description = {
	$schema: "http://json-schema.org/draft-07/schema#",
	$id: _schemaUtils._base + "description",
	title: "Description Schema",
	decription: "Defines the description of the sequence diagram.",
	oneOf: [{type: "string"}, {type: "array", items: {type: "string"}}]
};
