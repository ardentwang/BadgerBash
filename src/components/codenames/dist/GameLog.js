"use strict";
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var GameLog = function (_a) {
    var logs = _a.logs;
    var logContainerRef = react_1.useRef(null);
    // Auto-scroll to the bottom when logs are updated
    react_1.useEffect(function () {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);
    return (react_1["default"].createElement(card_1.Card, { className: "w-full max-w-3xl mt-6 p-4 bg-gray-200 text-black rounded-lg mx-auto" },
        react_1["default"].createElement("h3", { className: "text-lg font-bold mb-2" }, "Game Log"),
        react_1["default"].createElement("div", { ref: logContainerRef, className: "text-sm text-gray-700 max-h-40 overflow-y-auto p-2 bg-white rounded" }, logs.length > 0 ? (logs.map(function (log, index) { return (react_1["default"].createElement("p", { key: index, className: "py-1 " + (index === 0 ? 'font-bold animate-pulse' : '') }, log)); })) : (react_1["default"].createElement("p", { className: "italic text-gray-500" }, "Game started. Waiting for Spymaster to give a clue...")))));
};
exports["default"] = GameLog;
