"use strict";
exports.__esModule = true;
// app/page.js - Server Component
var navbar_1 = require("@/components/navbar/navbar");
var game_description_1 = require("@/components/home/game-description");
var game_buttons_1 = require("@/components/home/game-buttons");
var changelog_button_1 = require("@/components/home/changelog-button");
var image_1 = require("next/image");
function Home() {
    return (React.createElement("div", { className: "bg-background min-h-screen col-span-full relative" },
        React.createElement(navbar_1["default"], null),
        React.createElement("div", { className: "flex flex-col justify-center items-center min-h-screen" },
            React.createElement("h1", { className: "text-foreground text-6xl font-bold mb-4" }, "BadgerBash"),
            React.createElement(game_description_1["default"], null),
            React.createElement(game_buttons_1["default"], null),
            React.createElement(image_1["default"], { src: "/animated/kawaiiBadgers3.gif", alt: "Cute badgers playing games", width: 200, height: 200, className: "mt-8 rounded-lg", unoptimized: true }),
            React.createElement(changelog_button_1["default"], null))));
}
exports["default"] = Home;
