"use strict";
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var OperativeBoard = function (_a) {
    var words = _a.words, team = _a.team, onSelectWord = _a.onSelectWord, canInteract = _a.canInteract, onEndTurn = _a.onEndTurn;
    var handleTileClick = function (index) {
        // Enhanced logging for card clicks
        console.log("\uD83C\uDFAF Card clicked - Index: " + index);
        console.log("\uD83C\uDFAE Can interact? " + (canInteract ? "Yes" : "No"));
        var clickedWord = words[index];
        console.log("\uD83D\uDCDD Clicked word details - Word: \"" + clickedWord.word + "\", Color: " + clickedWord.color + ", Revealed: " + clickedWord.revealed);
        // Don't allow clicking if it's not this player's turn
        if (!canInteract) {
            console.log("❌ Interaction blocked - Not player's turn");
            return;
        }
        // Don't allow clicking already revealed tiles
        if (clickedWord.revealed) {
            console.log("❌ Interaction blocked - Card already revealed");
            return;
        }
        console.log("\u2705 Valid card click - Sending to parent component");
        console.log("\uD83D\uDCCA Full word object being sent:", JSON.stringify(clickedWord, null, 2));
        // Call the parent component's handler
        onSelectWord(clickedWord, index);
    };
    // Handler for ending turn
    var handleEndTurn = function () {
        if (!canInteract) {
            console.log("❌ Cannot end turn - Not player's turn");
            return;
        }
        console.log("🔄 Player chose to end turn");
        if (onEndTurn) {
            onEndTurn();
        }
    };
    // Log the current board state on render
    console.log("\uD83C\uDFAE Rendering OperativeBoard - Team: " + team);
    console.log("\uD83D\uDCCA Words count: " + words.length);
    console.log("\uD83D\uDCCA Revealed words: " + words.filter(function (w) { return w.revealed; }).length);
    return (react_1["default"].createElement("div", { className: "flex flex-col items-center" },
        react_1["default"].createElement("h2", { className: "text-lg font-bold mb-4" },
            "Operative View - ",
            team,
            " Team"),
        !canInteract && (react_1["default"].createElement("div", { className: "mb-4 p-3 bg-yellow-100 rounded-lg text-center" },
            react_1["default"].createElement("p", { className: "font-medium" }, "Waiting for your turn to select a word"))),
        react_1["default"].createElement("div", { className: "grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg" }, words.map(function (tile, index) { return (react_1["default"].createElement("div", { key: index, className: "relative w-28 h-20 rounded-md font-bold " + (canInteract && !tile.revealed ? 'cursor-pointer hover:opacity-80' : ''), onClick: function () { return handleTileClick(index); }, "data-testid": "card-" + index + "-" + tile.word }, tile.revealed ? (react_1["default"].createElement("div", { className: "w-full h-full flex items-center justify-center rounded-md\n                " + (tile.color === "blue"
                ? "bg-blue-500 text-white"
                : tile.color === "red"
                    ? "bg-red-500 text-white"
                    : tile.color === "black"
                        ? "bg-black text-white"
                        : "bg-yellow-200 text-black") }, tile.word)) : (react_1["default"].createElement("div", { className: "w-full h-full flex items-center justify-center bg-gray-400 text-black" }, tile.word)))); })),
        canInteract && (react_1["default"].createElement("div", { className: "mt-4 w-full max-w-md" },
            react_1["default"].createElement("div", { className: "p-3 bg-green-100 rounded-lg text-center mb-3" },
                react_1["default"].createElement("p", { className: "font-medium text-green-800" }, "Your turn! Select a word card or end your turn.")),
            react_1["default"].createElement(button_1.Button, { onClick: handleEndTurn, className: "w-full bg-gray-700 hover:bg-gray-800 text-white py-2" }, "End Turn")))));
};
exports["default"] = OperativeBoard;
