"use strict";
exports.__esModule = true;
var link_1 = require("next/link");
var button_1 = require("@/components/ui/button");
var navbar_1 = require("@/components/navbar/navbar");
var create_lobby_1 = require("@/components/ui/create-lobby");
function Home() {
    return (React.createElement("div", { className: "bg-background min-h-screen col-span-full relative" },
        React.createElement(navbar_1["default"], null),
        React.createElement("div", { className: "flex flex-col justify-center items-center min-h-screen" },
            React.createElement("svg", { viewBox: "0 -40 600 200", className: "w-full h-[250px] mb-2" },
                React.createElement("defs", null,
                    React.createElement("path", { id: "curve", d: "M 50,150 Q 300,20 550,150" }),
                    React.createElement("filter", { id: "shadow", x: "-50%", y: "-50%", width: "200%", height: "200%" },
                        React.createElement("feDropShadow", { dx: "0", dy: "4", stdDeviation: "4", floodColor: "black", floodOpacity: "0.6" }))),
                React.createElement("text", { fill: "currentColor", fontSize: "80", fontWeight: "800", textAnchor: "middle", className: "text-orange-300", filter: "url(#shadow)" },
                    React.createElement("textPath", { href: "#curve", startOffset: "50%" }, "Badger Bash"))),
            React.createElement("img", { src: "/animated/kawaiiBadgers3.gif", alt: "Cute badgers playing games", className: "w-[350px] mb-8" }),
            React.createElement("img", { src: "/animated/sparkle_background.gif", alt: "sparkles", className: "fixed top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none z-0" }),
            React.createElement("div", { className: "flex justify-center gap-8 mb-10" },
                React.createElement(button_1.Button, { className: "w-32 h-32 flex items-center justify-center text-center text-lg font-bold text-white bg-gradient-to-b from-purple-200 to-violet-200 border-[3px] border-black rounded-full shadow-lg hover:shadow-[0_0_25px_rgw-32 h-32 flex items-center justify-center text-center text-lg font-bold text-gray-800 bg-gradient-to-b from-[#FADADD] to-[#FADADD] border-[3px] border-black rounded-full shadow-lg hover:shadow-[0_0_35px_rgba(255,105,180,1),0_0_15px_rgba(255,255,255,0.8)] active:translate-y-1 active:shadow-md transition-all duration-200 ease-in-out cursor-pointerba(255,105,180,0.8)] active:translate-y-1 active:shadow-md transition-all duration-200 ease-in-out cursor-pointer", asChild: true },
                    React.createElement(link_1["default"], { href: "/join-lobby" },
                        "Join",
                        React.createElement("br", null),
                        " Game")),
                React.createElement("div", null,
                    React.createElement(create_lobby_1["default"], null))))));
}
exports["default"] = Home;
