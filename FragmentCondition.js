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

let Utilities = require("./Utilities.js");
let Actor = require("./Actor.js");
let TextMetadata = require("./TextMetadata.js");
let Fragment = require("./Fragment.js");
let Comment = require("./Comment.js");




module.exports = class FragmentCondition {
   /**
    *Creates an instance of FragmentCondition.
    * @param {object} ctx
    * @param {object} line
    * @memberof FragmentCondition
    */
   constructor(ctx, line) {
      this._ctx = ctx;
      this._line = line;
   }

   draw(working, starty, mimic) {
      const ctx = this._ctx;
      let activeFrag = null;
      if (Array.isArray(working.activeFragments) && working.activeFragments.length > 0) {
         activeFrag = working.activeFragments[working.activeFragments.length - 1];
      } else {
         let xy = Actor.drawTimelines(working, ctx, starty, working.globalSpacing, mimic);
         return working.manageMaxWidth(xy.x, xy.y);
      }
      if (!Utilities.isNumber(activeFrag.fragmentStartX) || !Utilities.isNumber(activeFrag.fragmentEndX)) {
         let xy = Actor.drawTimelines(working, ctx, starty, working.globalSpacing, mimic);
         return working.manageMaxWidth(xy.x, xy.y);
      }

      const conditionTmd =
         Utilities.isObject(this._line.condition) ?
         TextMetadata.getTextMetadataFromObject(working, this._line.condition, working.postdata.params.fragment.condition, FragmentCondition.getDefaultConditionTmd()) :
         TextMetadata.getTextMetadataFromObject(working, this._line, working.postdata.params.fragment.condition, FragmentCondition.getDefaultConditionTmd());
      conditionTmd.bgColour = 'rgba(0,0,0,0)';


      ///////////////////////
      // Get the line dash
      let lineDash = Array.isArray(this._line.lineDash) && Utilities.isAllNumber(this._line.lineDash) ?
         this._line.lineDash :
         working.postdata.params && working.postdata.params.fragment &&
         Array.isArray(working.postdata.params.fragment.lineDash) &&
         Utilities.isAllNumber(working.postdata.params.fragment.lineDash) ?
         working.postdata.params.fragment.lineDash : [4, 3];

      ///////////////////////
      // Get the line width
      let lineWidth = Utilities.isNumber(this._line.lineWidth) && this._line.lineWidth >= 0 ?
         this._line.lineWidth :
         working.postdata.params && working.postdata.params.fragment &&
         Utilities.isNumber(working.postdata.params.fragment.lineWidth) &&
         working.postdata.params.fragment.lineWidth >= 0 ?
         working.postdata.params.fragment.lineWidth :
         1;

      ///////////////////////
      // Get the line colour
      let lineColour =
         Utilities.validColour(this._line.lineColour) ?
         this._line.lineColour :
         working.postdata.params && working.postdata.params.fragment &&
         Utilities.validColour(working.postdata.params.fragment.lineColour) ?
         working.postdata.params.fragment.lineColour :
         'rgb(0,0,0)';

      /////////////
      // Calculate height of fragment condition line
      let commentxy = null;
      let comment = null;
      let fragStartX = activeFrag.fragmentStartX;
      let fragEndX = activeFrag.fragmentEndX;
      if (this._line.comment != null) {
         comment = new Comment(ctx, this._line.comment);
         commentxy = comment.draw(working, fragStartX + working.globalSpacing, starty + working.globalSpacing, working.globalSpacing, working.globalSpacing, true);
      }
      let conditionLineY = (commentxy != null && Utilities.isObject(commentxy) && Utilities.isNumber(commentxy.y)) ? commentxy.y : starty + working.globalSpacing;

      /////////////////////////
      // Get the condition text
      let ctext = Array.isArray(this._line.condition) && Utilities.isString(this._line.condition[0]) ?
         this._line.condition[0] :
         Utilities.isString(this._line.condition) ?
         this._line.condition : "";
      let conditionxy = Utilities.drawTextRectangleNoBorderOrBg(ctx, ctext, conditionTmd, conditionLineY + lineWidth, fragStartX,
         null, null, true);
      let xy = Actor.drawTimelines(working, ctx, starty, conditionxy.y - starty, true);
      let finalHeightOfAllLine = xy.y - starty;


      ///////////////////////////////////
      // Height now calculated .. now draw the items in order
      // 1. Background fragments
      // 2. Current Fragment rectangle
      // 3. Type and Title rectangle
      // 4. Type and title text
      // 5. Condition text
      // 6. Time lines
      // 7. Comment  

      ///////////////////////////////////
      // 1. Background fragments

      Utilities.drawActiveFragments(working, this._ctx, starty, finalHeightOfAllLine, mimic);

      ///////////////////////////////////
      // 2. Time lines
      xy = Actor.drawTimelines(working, ctx, starty, finalHeightOfAllLine, mimic);

      ///////////////////////////////////
      // 3. Comment
      if (comment != null) {
         commentxy = comment.draw(working, fragStartX + working.globalSpacing, starty + working.globalSpacing, working.globalSpacing, working.globalSpacing, mimic);
      }

      ///////////////////////////////////
      // 4. Condition break
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(lineDash);
      ctx.strokeStyle = lineColour;
      ctx.beginPath();
      ctx.moveTo(fragStartX, conditionLineY);
      mimic ? ctx.moveTo(fragEndX, conditionLineY) : ctx.lineTo(fragEndX, conditionLineY);
      ctx.stroke();
      // Do not manage maxwidth on fragments

      ///////////////////////////////////
      // 5. Draw condition text
      conditionxy = Utilities.drawTextRectangleNoBorderOrBg(ctx, ctext, conditionTmd, conditionLineY + lineWidth, fragStartX,
         null, null, false);

      return working.manageMaxWidth(conditionxy.x, conditionxy.y);
   }

   /**
    *
    *
    * @static
    * @returns
    * @memberof Fragment
    */
   static getDefaultConditionTmd() {
      const defaultFragConditionTmd = {
         fontFamily: "sans-serif",
         fontSizePx: 12,
         fgColour: "rgb(0,0,0)",
         bgColour: "rgba(200,200,0,0)",
         padding: 10,
         spacing: 1,
         align: "left",
         borderColour: "rgba(255,255,255,0)",
         borderWidth: 0,
         borderDash: []
      }
      return defaultFragConditionTmd;
   }
}