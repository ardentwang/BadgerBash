"use strict";
exports.__esModule = true;
// Updated TeamPanel.tsx
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var TeamPanel = function (_a) {
    var color = _a.color, players = _a.players, userId = _a.userId, score = _a.score;
    var bgColor = color === "red" ? "bg-red-700" : "bg-blue-700";
    var rolePrefix = color + "_";
    return (react_1["default"].createElement(card_1.Card, { className: "w-56 p-4 " + bgColor + " text-white rounded-lg" },
        react_1["default"].createElement("h3", { className: "text-xl font-bold" },
            color === "red" ? "Red" : "Blue",
            " Team ",
            score !== undefined && "(" + score + ")"),
        react_1["default"].createElement("div", { className: "mt-2" },
            react_1["default"].createElement("p", { className: "font-bold mt-2" }, "Operatives:"),
            players
                .filter(function (player) { return player.role === rolePrefix + "operative"; })
                .map(function (player, index) { return (react_1["default"].createElement("div", { key: index, className: "text-sm" }, player.user_id === userId ? 'You' : player.user_id.substring(0, 8))); }),
            players.filter(function (player) { return player.role === rolePrefix + "operative"; }).length === 0 &&
                react_1["default"].createElement("div", { className: "text-sm" }, "-"),
            react_1["default"].createElement("p", { className: "font-bold mt-2" }, "Spymaster:"),
            players
                .filter(function (player) { return player.role === rolePrefix + "spymaster"; })
                .map(function (player, index) { return (react_1["default"].createElement("div", { key: index, className: "text-sm" }, player.user_id === userId ? 'You' : player.user_id.substring(0, 8))); }),
            players.filter(function (player) { return player.role === rolePrefix + "spymaster"; }).length === 0 &&
                react_1["default"].createElement("div", { className: "text-sm" }, "-"))));
};
exports["default"] = TeamPanel;
