"use client";
"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var image_1 = require("next/image");
function PlayerSlot(_a) {
    var player = _a.player, isCurrentUser = _a.isCurrentUser, _b = _a.isHost, isHost = _b === void 0 ? false : _b;
    if (!player) {
        // Empty player slot
        return (React.createElement(card_1.Card, { className: "h-24 flex items-center justify-center border-dashed border-2 border-gray-300 bg-gray-50" },
            React.createElement(card_1.CardContent, { className: "p-4 text-center text-gray-500" }, "Waiting for player...")));
    }
    return (React.createElement(card_1.Card, { className: "h-24 overflow-hidden " + (isCurrentUser ? 'ring-2 ring-blue-500' : '') },
        React.createElement(card_1.CardContent, { className: "p-4 flex items-center gap-3" },
            React.createElement("div", { className: "relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0" },
                React.createElement(image_1["default"], { src: player.avatar_url || '/avatars/student.png', alt: (player.username || 'Player') + "'s avatar", fill: true, className: "object-cover" })),
            React.createElement("div", { className: "flex-1 min-w-0" },
                React.createElement("div", { className: "font-medium truncate" }, player.username),
                React.createElement("div", { className: "flex items-center gap-2 mt-1" },
                    isHost && (React.createElement("span", { className: "text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full" }, "Host")),
                    isCurrentUser && (React.createElement("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full" }, "You")))))));
}
exports["default"] = PlayerSlot;
