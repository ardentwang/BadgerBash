"use strict";
exports.__esModule = true;
var react_1 = require("react");
var OperativeBoard = function (_a) {
    var words = _a.words, team = _a.team, onSelectWord = _a.onSelectWord, canInteract = _a.canInteract;
    var handleTileClick = function (index) {
        // Don't allow clicking if it's not this player's turn
        if (!canInteract)
            return;
        // Don't allow clicking already revealed tiles
        if (words[index].revealed)
            return;
        // Call the parent component's handler
        onSelectWord(words[index], index);
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col items-center" },
        react_1["default"].createElement("h2", { className: "text-lg font-bold mb-4" },
            "Operative View - ",
            team,
            " Team"),
        !canInteract && (react_1["default"].createElement("div", { className: "mb-4 p-3 bg-yellow-100 rounded-lg text-center" },
            react_1["default"].createElement("p", { className: "font-medium" }, "Waiting for your turn to select a word"))),
        react_1["default"].createElement("div", { className: "grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg" }, words.map(function (tile, index) { return (react_1["default"].createElement("div", { key: index, className: "relative w-28 h-20 rounded-md font-bold " + (canInteract && !tile.revealed ? 'cursor-pointer hover:opacity-80' : ''), onClick: function () { return handleTileClick(index); } }, tile.revealed ? (react_1["default"].createElement("div", { className: "w-full h-full flex items-center justify-center rounded-md\n                " + (tile.color === "blue"
                ? "bg-blue-500 text-white"
                : tile.color === "red"
                    ? "bg-red-500 text-white"
                    : tile.color === "black"
                        ? "bg-black text-white"
                        : "bg-yellow-200 text-black") }, tile.word)) : (react_1["default"].createElement("div", { className: "w-full h-full flex items-center justify-center bg-gray-400 text-black" }, tile.word)))); })),
        canInteract && (react_1["default"].createElement("div", { className: "mt-4 p-2 bg-green-100 rounded-lg text-center" },
            react_1["default"].createElement("p", { className: "font-medium text-green-800" }, "Your turn! Select a word card.")))));
};
exports["default"] = OperativeBoard;
