"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var AuthContext_1 = require("@/context/AuthContext");
var supabase_1 = require("@/lib/supabase");
var react_1 = require("react");
var avatarImages = [
    { file: 'party.png', label: 'Party' },
    { file: 'programmer.png', label: 'Programmer' },
    { file: 'student.png', label: 'Student' },
    { file: 'wizard.png', label: 'Wizard' },
];
function AvatarSelector(_a) {
    var _this = this;
    var currentAvatar = _a.currentAvatar, onSelect = _a.onSelect;
    var _b = AuthContext_1.useAuth(), user = _b.user, refreshUser = _b.refreshUser;
    var _c = react_1.useState(false), isUpdating = _c[0], setIsUpdating = _c[1];
    var handleAvatarSelect = function (avatarUrl) { return __awaiter(_this, void 0, void 0, function () {
        var error, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user || isUpdating)
                        return [2 /*return*/];
                    setIsUpdating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    // Update user metadata in auth
                    return [4 /*yield*/, supabase_1.supabase.auth.updateUser({
                            data: {
                                avatar_url: avatarUrl
                            }
                        })];
                case 2:
                    // Update user metadata in auth
                    _a.sent();
                    return [4 /*yield*/, supabase_1.supabase
                            .from('users')
                            .update({ avatar_url: avatarUrl })
                            .eq('id', user.id)];
                case 3:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error updating avatar in database:', error);
                        return [2 /*return*/];
                    }
                    // Call the onSelect callback to update UI
                    onSelect(avatarUrl);
                    // Refresh the user context to get updated metadata
                    return [4 /*yield*/, refreshUser()];
                case 4:
                    // Refresh the user context to get updated metadata
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error updating avatar:', error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setIsUpdating(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "grid grid-cols-2 gap-6 place-items-center" }, avatarImages.map(function (_a) {
        var file = _a.file, label = _a.label;
        var isSelected = currentAvatar.includes(file);
        return (React.createElement("div", { key: file, className: "flex flex-col items-center" },
            React.createElement("img", { src: "/avatars/" + file, alt: label, className: "w-20 h-20 rounded-full cursor-pointer border-4 transition " + (isUpdating ? 'opacity-50' : '') + " " + (isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-300'), onClick: function () { return handleAvatarSelect("/avatars/" + file); } }),
            React.createElement("span", { className: "mt-1 text-sm font-medium text-gray-700" }, label)));
    })));
}
exports["default"] = AvatarSelector;
