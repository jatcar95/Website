"use strict";

$(document).ready(function() {
	$(document).on("click", "#validate", validateCSS);
});

function validateCSS() {
	var resultDiv = $("#results");
	resultDiv.text("");

	var cssText = $("#text").val().split("\n");
	var lineCounts = new Array();
	var lineNum = 1;
	for (var i in cssText) {
		var trimmedLine = cssText[i].trim();
		if (trimmedLine != "" && trimmedLine != "}") {
			if (!(cssText[i] in lineCounts)) {
				lineCounts[cssText[i]] = new Array();
			}
			lineCounts[cssText[i]].push(lineNum);
		}
		lineNum++;
	}

	var foundError = false;
	for (var key in lineCounts) {
		if (lineCounts[key].length > 1) {
			foundError = true;
			var newResult = document.createElement("div");
			$(newResult).append("Duplicate lines: " + lineCounts[key]);
			$(newResult).append(document.createElement("br"));
			$(newResult).append(key);
			$(resultDiv).append(newResult);
		}
		if (key.indexOf("position") != -1) {
			foundError = true;
			var newResult = document.createElement("div");
			$(newResult).append("Positioning found on line(s): " + lineCounts[key]);
			$(newResult).append(document.createElement("br"));
			$(newResult).append(key);
			$(resultDiv).append(newResult);			
		}
		if (key.indexOf("100%") != -1) {
			foundError = true;
			var newResult = document.createElement("div");
			$(newResult).append("Setting something to 100% on line(s): " + lineCounts[key]);
			$(newResult).append(document.createElement("br"));
			$(newResult).append(key);
			$(resultDiv).append(newResult);						
		}
		if (key.indexOf("line-height") != -1) {
			foundError = true;
			var newResult = document.createElement("div");
			$(newResult).append("Setting line-height on line(s): " + lineCounts[key]);
			$(newResult).append(document.createElement("br"));
			$(newResult).append(key);
			$(resultDiv).append(newResult);						
		}
	}

	if (!foundError) {
		resultDiv.append("No duplicate lines found\n");
	}
}