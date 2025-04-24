"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var WordsDebugPanel = function (_a) {
    var words = _a.words, playerRole = _a.playerRole;
    var _b = react_1.useState(false), isExpanded = _b[0], setIsExpanded = _b[1];
    // Sort words first by color, then by word
    var sortedWords = __spreadArrays(words).sort(function (a, b) {
        if (a.color !== b.color) {
            // Red first, then blue, then yellow, then black
            var colorOrder = { red: 0, blue: 1, yellow: 2, black: 3 };
            return colorOrder[a.color] - colorOrder[b.color];
        }
        return a.word.localeCompare(b.word);
    });
    var getColorClass = function (color) {
        switch (color) {
            case 'red': return 'bg-red-200 text-red-900';
            case 'blue': return 'bg-blue-200 text-blue-900';
            case 'yellow': return 'bg-yellow-200 text-yellow-900';
            case 'black': return 'bg-gray-800 text-white';
            default: return 'bg-gray-200';
        }
    };
    return (react_1["default"].createElement(card_1.Card, { className: "mt-4 p-3 bg-white rounded-lg shadow-md" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center mb-2" },
            react_1["default"].createElement("h3", { className: "text-md font-bold" },
                "Debug Panel (",
                playerRole,
                ")"),
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setIsExpanded(!isExpanded); } }, isExpanded ? "Hide Debug" : "Show Debug")),
        isExpanded && (react_1["default"].createElement("div", { className: "text-xs overflow-auto", style: { maxHeight: '200px' } },
            react_1["default"].createElement("table", { className: "w-full border-collapse" },
                react_1["default"].createElement("thead", null,
                    react_1["default"].createElement("tr", { className: "bg-gray-100" },
                        react_1["default"].createElement("th", { className: "border border-gray-300 px-2 py-1 text-left" }, "Word"),
                        react_1["default"].createElement("th", { className: "border border-gray-300 px-2 py-1 text-left" }, "Color"),
                        react_1["default"].createElement("th", { className: "border border-gray-300 px-2 py-1 text-left" }, "Revealed"),
                        react_1["default"].createElement("th", { className: "border border-gray-300 px-2 py-1 text-left" }, "Index"))),
                react_1["default"].createElement("tbody", null, sortedWords.map(function (word, index) { return (react_1["default"].createElement("tr", { key: index, className: getColorClass(word.color) + " " + (word.revealed ? 'opacity-70' : '') },
                    react_1["default"].createElement("td", { className: "border border-gray-300 px-2 py-1" }, word.word),
                    react_1["default"].createElement("td", { className: "border border-gray-300 px-2 py-1" }, word.color),
                    react_1["default"].createElement("td", { className: "border border-gray-300 px-2 py-1" }, word.revealed ? "Yes" : "No"),
                    react_1["default"].createElement("td", { className: "border border-gray-300 px-2 py-1" }, words.findIndex(function (w) { return w.word === word.word; })))); }))),
            react_1["default"].createElement("div", { className: "mt-2" },
                react_1["default"].createElement("p", null,
                    "Total words: ",
                    words.length),
                react_1["default"].createElement("p", null,
                    "Red words: ",
                    words.filter(function (w) { return w.color === 'red'; }).length),
                react_1["default"].createElement("p", null,
                    "Blue words: ",
                    words.filter(function (w) { return w.color === 'blue'; }).length),
                react_1["default"].createElement("p", null,
                    "Yellow words: ",
                    words.filter(function (w) { return w.color === 'yellow'; }).length),
                react_1["default"].createElement("p", null,
                    "Black words: ",
                    words.filter(function (w) { return w.color === 'black'; }).length),
                react_1["default"].createElement("p", null,
                    "Revealed words: ",
                    words.filter(function (w) { return w.revealed; }).length))))));
};
exports["default"] = WordsDebugPanel;
