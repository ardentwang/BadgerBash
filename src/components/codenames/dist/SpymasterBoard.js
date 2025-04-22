// SpymasterBoard.tsx
"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var SpymasterBoard = function (_a) {
    var words = _a.words, team = _a.team, onGiveClue = _a.onGiveClue, canInteract = _a.canInteract;
    var _b = react_1.useState(''), clue = _b[0], setClue = _b[1];
    var _c = react_1.useState(''), clueNumber = _c[0], setClueNumber = _c[1];
    var _d = react_1.useState(null), error = _d[0], setError = _d[1];
    var _e = react_1.useState(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var handleSubmitClue = function (e) {
        e.preventDefault();
        // Check if it's the player's turn
        if (!canInteract) {
            setError("It's not your turn to give a clue");
            return;
        }
        // Validate input
        if (!clue.trim()) {
            setError("Please enter a clue");
            return;
        }
        if (!clueNumber) {
            setError("Please select a number");
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            console.log("\uD83C\uDFB2 Submitting clue: \"" + clue + "\" with number: " + clueNumber + " for team: " + team);
            // Call the parent component callback to handle the clue submission
            onGiveClue(clue, parseInt(clueNumber));
            // Reset form
            setClue('');
            setClueNumber('');
        }
        catch (err) {
            console.error('❌ Exception while submitting clue:', err);
            setError("An unexpected error occurred");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    var getColorClass = function (color) {
        switch (color) {
            case 'red': return 'bg-red-500 text-white';
            case 'blue': return 'bg-blue-500 text-white';
            case 'black': return 'bg-black text-white';
            case 'yellow': return 'bg-yellow-200';
            default: return 'bg-gray-200';
        }
    };
    if (!words) {
        return (react_1["default"].createElement("div", { className: "text-center p-4" },
            react_1["default"].createElement("p", null, "Loading words...")));
    }
    return (react_1["default"].createElement("div", { className: "flex flex-col w-full max-w-4xl" },
        react_1["default"].createElement("div", { className: "grid grid-cols-5 gap-2 mb-4" }, words.map(function (word, index) { return (react_1["default"].createElement("div", { key: index, className: getColorClass(word.color) + " p-4 h-20 flex items-center justify-center rounded shadow text-center font-semibold " + (word.revealed ? 'opacity-60' : '') },
            word.word,
            word.revealed && react_1["default"].createElement("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded text-white font-bold text-xs" }, "REVEALED"))); })),
        react_1["default"].createElement("div", { className: "mt-4 p-3 bg-white rounded-lg shadow-md" },
            error && (react_1["default"].createElement("div", { className: "text-red-500 text-sm p-2 mb-2 bg-red-50 rounded-md border border-red-200" }, error)),
            !canInteract && (react_1["default"].createElement("div", { className: "bg-yellow-100 p-2 mb-2 rounded-md text-center" },
                react_1["default"].createElement("p", { className: "font-medium" }, "Waiting for your turn to give a clue"))),
            react_1["default"].createElement("form", { onSubmit: handleSubmitClue, className: "flex items-end space-x-2" },
                react_1["default"].createElement("div", { className: "flex-grow" },
                    react_1["default"].createElement("label", { htmlFor: "clue", className: "block text-sm font-medium text-gray-700 mb-1" }, "One-word clue:"),
                    react_1["default"].createElement(input_1.Input, { id: "clue", value: clue, onChange: function (e) { return setClue(e.target.value); }, placeholder: "Enter clue", className: "w-full text-gray-800 bg-white", maxLength: 30, style: { color: '#1a202c' }, disabled: !canInteract })),
                react_1["default"].createElement("div", { className: "w-32" },
                    react_1["default"].createElement("label", { htmlFor: "clueNumber", className: "block text-sm font-medium text-gray-700 mb-1" }, "# of words:"),
                    react_1["default"].createElement(select_1.Select, { value: clueNumber, onValueChange: setClueNumber, disabled: !canInteract },
                        react_1["default"].createElement(select_1.SelectTrigger, { id: "clueNumber", className: "text-gray-800 bg-white", style: { color: '#1a202c' } },
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select", className: "text-gray-800" })),
                        react_1["default"].createElement(select_1.SelectContent, { className: "bg-white" }, [1, 2, 3, 4, 5, 6, 7, 8].map(function (num) { return (react_1["default"].createElement(select_1.SelectItem, { key: num, value: num.toString(), className: "text-gray-800" }, num)); })))),
                react_1["default"].createElement(button_1.Button, { type: "submit", className: "bg-" + team + "-500 hover:bg-" + team + "-600 text-white", disabled: isSubmitting || !clue.trim() || !clueNumber || !canInteract }, isSubmitting ? 'Sending...' : 'Give Clue')))));
};
exports["default"] = SpymasterBoard;
