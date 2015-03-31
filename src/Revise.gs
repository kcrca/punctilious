function Reviser() {
  // Change to modify if elements are eignored.
  this.ignoreElement = function(e) {
    return false;
  };
  // Change to modify how attributes are cleaned.
  this.cleanAttributes = function(attrs) {
    var cleaned = {};
    var value;

    for (var att in attrs) {
      value = attrs[att];

      if (value !== null) {
        cleaned[att] = value;
      }
    }

    return cleaned;
  };

  self = this;
  var prefStr = function(depth) {
    var s = "";
    for (var i = 0; i < depth; i++) {
      s += "    ";
    }
    return s;
  }

  this.dbg = function(depth, s) {
    return;
    DocumentApp.getActiveDocument().appendParagraph(prefStr(depth) + s);
  }

  function modifyTextNode(fn, attrFn, elem, range, depth) {
    // elem is the Text element.
    // text is the text in the original node, not just the selected part.
    var text = elem.getText();

    var partial = range.isPartial();
    var startIndex;
    var endIndex;

    if (partial) {
      startIndex = range.getStartOffset();
      endIndex = range.getEndOffsetInclusive();
    }
    else {
      startIndex = 0;
      endIndex = text.length - 1;
    }

    // Loop through the segments of the text that share the same attributes.

    // changes has the start of every attr range, and changes[i+1] is the end+1 of changes[i].
    var changes = elem.getTextAttributeIndices();
    var origAttrs = [];
    for (var r = 0; r < changes.length; r++) {
      origAttrs.push(elem.getAttributes(changes[r]));
    }
    changes.push(endIndex + 1);

    // start/end are the start/end (incl.) in the original of the segment.
    // pos is the position in the updated text node to put the next modified segment.
    // len is the length of the updated text node.
    var seenFirst = false;
    var pos = startIndex;
    var last = text.length - 1;
    for (var r = 0; r < changes.length - 1; r++) {
      self.dbg(depth, "--- r = " + r);
      var start = changes[r];
      var end = changes[r+1] - 1;  // end is inclusive, just like endIndex
      self.dbg(depth, "before: start..end: " + start + ".." + end);
      if (start > endIndex) {
        break;
      }
      if (end < startIndex) {
        continue;
      }
      if (!seenFirst) {
        start = startIndex;
        seenFirst = true;
      }
      if (end > endIndex) {
        end = endIndex;
      }
      self.dbg(depth, "after:  start..end: " + start + ".." + end);

      var curAttrs = origAttrs[r]; // attrs for the entire old text
      self.dbg(depth, "curAttrs: " + curAttrs);
      var curText = text.substring(start, end + 1);
      self.dbg(depth, "curText: " + curText);
      var newText = fn(curText, curAttrs);
      self.dbg(depth, "newText: " + newText);
      var newAttrs = [curAttrs];
      if (attrFn) {
        newAttrs = attrFn(curText, curAttrs);
        if (!newAttrs || newAttrs.length == 0) {
          newAttrs = [null];
        }
      }
      var curLast = end - start;
      self.dbg(depth, "pos: " + pos + ", last = " + last + ", curLast = " + curLast + ", tl = " + (elem.getText().length - 1) + ", curText = '" + curText + "', newText = '" + newText);
      elem.deleteText(pos, pos + curLast);
      // inserting at length+1 is not allowed, must special-case an append
      if (pos >= elem.getText().length/*pos + curLast >= last*/) {
        elem.appendText(newText);
      } else {
        elem.insertText(pos, newText);
      }
      if (newAttrs.length > newText.length) {
      newAttrs = newAttrs.slice(0, newText.length);
      }
      // Apply the first, char-specific attrs (if any)
      for (var a = 0; a < newAttrs.length - 1; a++) {
      var attrs = newAttrs[a];
      // null means "use default"
      if (attrs != null) {
        elem.setAttributes(pos + a, pos + a, attrs);
      }
      }
      // Apply the last attr to the remainder of the text.
      var attrs = newAttrs[newAttrs.length-1]
      if (attrs != null) {
        elem.setAttributes(pos + newAttrs.length - 1, pos + newText.length - 1, attrs);
      }

      pos += newText.length;
      last += newText.length - curText.length;
    }
  }
  this._modify = function(fn, attrFn) {
    Logger.log("modify");
    var doc = DocumentApp.getActiveDocument();
    var selection = doc.getSelection();
    var builder = doc.newRange();

    var processRange = function(ranges, depth) {
      self.dbg(depth, "processRange, len " + ranges.length);
      var hasText = false;
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        var element = range.getElement();
        self.dbg(depth, i + ": " + element.getType());

        if (self.ignoreElement(element)) {
          continue;
        }
        if (!element.editAsText) {
          continue;
        }

        // If it is editable as text and partial, it will be a Text element, so we
        // don't have to think about partial non-Text elements when recursing.
        if (element.getType() != DocumentApp.ElementType.TEXT) {
          var numKids = element.getNumChildren()
          self.dbg(depth, "numKids: " + numKids);
          if (numKids == 0) {
            continue;
          }
          var rb = DocumentApp.getActiveDocument().newRange();
          rb.addElementsBetween(element.getChild(0), element.getChild(numKids - 1));
          var newRanges = rb.build().getRangeElements();
          self.dbg(depth, "newRanges: " + newRanges + ": " + newRanges.length);
          processRange(newRanges, depth + 1);
        } else {
          modifyTextNode(fn, attrFn, element, range, depth);
        }
      }
      return hasText;
    }

    if (selection) {
      Logger.log("selected");
      var hasText = processRange(selection.getRangeElements(), 0);
    } else {
      Logger.log("!selected");
      var hasText = processRange(DocumentApp.getActiveDocument().getBody(), 0);
    }

    if (!hasText) {
      var ui = DocumentApp.getUi();
      ui.alert('No text selected', 'Please select the text you want to modify.', ui.ButtonSet.OK);
    }
    else {
      doc.setSelection(builder.build());
    }
  };
  this.reviseText = function (fn, attrFn) {
    Logger.log("reviseText");
    var self = this;
    this._modify(fn, attrFn);
  };
}
