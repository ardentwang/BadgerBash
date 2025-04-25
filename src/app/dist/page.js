"use strict";
exports.__esModule = true;
// app/page.js - Server Component
var navbar_1 = require("@/components/navbar/navbar");
var game_description_1 = require("@/components/home/game-description");
var game_buttons_1 = require("@/components/home/game-buttons");
function Home() {
    return (React.createElement("div", { className: "bg-background min-h-screen col-span-full relative" },
        React.createElement(navbar_1["default"], null),
        React.createElement("div", { className: "flex flex-col justify-center items-center min-h-screen" },
            React.createElement("h1", { className: "text-foreground text-6xl font-bold mb-4" }, "BadgerBash"),
            React.createElement(game_description_1["default"], null),
            React.createElement(game_buttons_1["default"], null),
            React.createElement("img", { src: "/animated/kawaiiBadgers3.gif", alt: "Cute badgers playing games", className: "w-[200px] mt-8 rounded-lg" }))));
}
exports["default"] = Home;
