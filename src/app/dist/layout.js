"use strict";
exports.__esModule = true;
exports.metadata = void 0;
require("./globals.css");
var google_1 = require("next/font/google");
var local_1 = require("next/font/local");
var AuthContext_1 = require("@/context/AuthContext");
var sonner_1 = require("@/components/ui/sonner");
var pixelifySans = google_1.Pixelify_Sans({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-pixelify-sans'
});
// Add the Minecraftia font
var minecraftia = local_1["default"]({
    src: '../../fonts/Minecraftia-Regular.ttf',
    display: 'swap',
    variable: '--font-minecraftia'
});
exports.metadata = {
    title: "BadgerBash",
    description: "Play quick games with your friends! Uno, Monopoly, Codenames, multiplayer party games for a chill night gaming experience!"
};
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "en" },
        React.createElement("body", { className: pixelifySans.className + " " + pixelifySans.variable + " " + minecraftia.variable + " font-minecraft" },
            React.createElement(AuthContext_1.AuthProvider, null,
                children,
                React.createElement(sonner_1.Toaster, null)))));
}
exports["default"] = RootLayout;
