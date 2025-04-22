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
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var button_1 = require("@/components/ui/button");
var supabase_1 = require("@/lib/supabase");
function CreateLobby() {
    var _this = this;
    var router = navigation_1.useRouter();
    var _a = react_1.useState(false), isCreating = _a[0], setIsCreating = _a[1];
    var params = navigation_1.useParams();
    var lobby_code = params.code;
    var handleCreateLobby = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, lobbiesData, fetchError, existingCodes, code, firstPart, secondPart, insertError, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsCreating(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('lobbies')
                            .select('lobby_code')];
                case 2:
                    _a = _b.sent(), lobbiesData = _a.data, fetchError = _a.error;
                    if (fetchError) {
                        console.error('Error fetching existing lobbies:', fetchError);
                        throw fetchError;
                    }
                    existingCodes = (lobbiesData === null || lobbiesData === void 0 ? void 0 : lobbiesData.map(function (lobby) { return lobby.lobby_code; })) || [];
                    code = void 0;
                    do {
                        firstPart = Math.floor(100 + Math.random() * 900).toString();
                        secondPart = Math.floor(100 + Math.random() * 900).toString();
                        code = firstPart + secondPart;
                    } while (existingCodes.includes(parseInt(code)));
                    return [4 /*yield*/, supabase_1.supabase
                            .from('lobbies')
                            .insert([
                            {
                                name: 'New Lobby',
                                player_count: 0,
                                is_public: false,
                                lobby_code: parseInt(code)
                            }
                        ])];
                case 3:
                    insertError = (_b.sent()).error;
                    if (insertError) {
                        console.error('Error creating lobby:', insertError);
                        return [2 /*return*/];
                    }
                    // Immediately redirect to the lobby page
                    router.push("/lobby/" + lobby_code);
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _b.sent();
                    console.error('Error in lobby creation process:', err_1);
                    return [3 /*break*/, 6];
                case 5:
                    setIsCreating(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(button_1.Button, { className: "w-full text-md", size: "lg", onClick: handleCreateLobby, disabled: isCreating }, isCreating ? "Creating..." : "Create Lobby"));
}
exports["default"] = CreateLobby;
