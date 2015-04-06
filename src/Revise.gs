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
  var prefStr = function() {
    var s = "";
    for (var i = 0; i < this.depth; i++) {
      s += "    ";
    }
    return s;
  }

  var dbgCnt = 0;

  this.dbg = function(s) {
    if (++dbgCnt > 100) {
      runaway.app();
    }
    Logger.log(prefStr() + s);
    DocumentApp.getActiveDocument().appendParagraph(prefStr() + s);
  }

  function modifyTextNode(fn, attrFn, elem, range) {
    // elem is the Text element.
    // text is the text in the original node, not just the selected part.
    var text = elem.getText();
    var startIndex;
    var endIndex;
    if (range.isPartial()) {
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
    for (var r = 0; r < changes.length - 1; r++) {
      var start = changes[r];
      var end = changes[r+1] - 1;  // end is inclusive, just like endIndex
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

      var curAttrs = origAttrs[r]; // attrs for the entire old text
      var curText = text.substring(start, end + 1);
      var newText = fn(curText, curAttrs, elem, start, end, self);
      var newAttrs = [curAttrs];
      if (attrFn) {
        newAttrs = attrFn(curText, curAttrs);
        if (!newAttrs || newAttrs.length == 0) {
          newAttrs = [null];
        }
      }
      elem.deleteText(pos, pos + end - start);
      // inserting at length+1 is not allowed, must special-case an append
      elem.insertText(pos, newText);
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
    }
  }
  this._modify = function(fn, attrFn) {
    var doc = DocumentApp.getActiveDocument();
    var selection = doc.getSelection();
    var builder = doc.newRange();

    var processRange = function(ranges) {
      var hasText = false;
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        var element = range.getElement();

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
          if (numKids == 0) {
            continue;
          }
          var rb = DocumentApp.getActiveDocument().newRange();
          rb.addElementsBetween(element.getChild(0), element.getChild(numKids - 1));
          var newRanges = rb.build().getRangeElements();
          this.depth++;
          processRange(newRanges);
          this.depth--;
        } else {
          modifyTextNode(fn, attrFn, element, range);
        }
      }
      return hasText;
    }

    var hasText;
    if (selection) {
      hasText = processRange(selection.getRangeElements(), 0);
    } else {
      hasText = processRange(DocumentApp.getActiveDocument().getBody(), 0);
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
    var self = this;
    this.depth = 0;
    this._modify(fn, attrFn);
  };
}
