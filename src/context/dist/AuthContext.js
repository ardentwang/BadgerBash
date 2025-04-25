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
exports.useAuth = exports.AuthProvider = void 0;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var uuid_1 = require("uuid");
var AuthContext = react_1.createContext(undefined);
function AuthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = react_1.useState(null), session = _b[0], setSession = _b[1];
    var _c = react_1.useState(null), user = _c[0], setUser = _c[1];
    var _d = react_1.useState(false), isGuest = _d[0], setIsGuest = _d[1];
    var _e = react_1.useState(true), isLoading = _e[0], setIsLoading = _e[1];
    // Function to fetch current session and user
    var refreshUser = function () { return __awaiter(_this, void 0, void 0, function () {
        var session;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.auth.getSession()];
                case 1:
                    session = (_e.sent()).data.session;
                    setSession(session);
                    setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
                    setIsGuest((_d = (_c = (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.user_metadata) === null || _c === void 0 ? void 0 : _c.is_guest) !== null && _d !== void 0 ? _d : false);
                    return [2 /*return*/];
            }
        });
    }); };
    // Function to create a guest user
    var createGuestUser = function () { return __awaiter(_this, void 0, void 0, function () {
        var guestUsername, _a, data, error, profileError, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    guestUsername = "Badger_" + uuid_1.v4().slice(0, 6);
                    return [4 /*yield*/, supabase_1.supabase.auth.signInAnonymously()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error signing in anonymously:', error);
                        return [2 /*return*/];
                    }
                    if (!data.user) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase_1.supabase.auth.updateUser({
                            data: {
                                username: guestUsername,
                                avatar_url: '/avatars/student.png',
                                is_guest: true
                            }
                        })
                        // Store user profile in database
                    ];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, supabase_1.supabase
                            .from('users')
                            .upsert({
                            id: data.user.id,
                            username: guestUsername,
                            avatar_url: '/avatars/student.png',
                            is_guest: true
                        }, { onConflict: 'id' })];
                case 3:
                    profileError = (_b.sent()).error;
                    if (profileError) {
                        console.error('Error creating user profile:', profileError);
                    }
                    _b.label = 4;
                case 4: 
                // Refresh user data
                return [4 /*yield*/, refreshUser()];
                case 5:
                    // Refresh user data
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _b.sent();
                    console.error('Error creating guest user:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        // Check if user is already logged in
        var initAuth = function () { return __awaiter(_this, void 0, void 0, function () {
            var session_1, error_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        setIsLoading(true);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        return [4 /*yield*/, supabase_1.supabase.auth.getSession()
                            // If no session, create a guest user
                        ];
                    case 2:
                        session_1 = (_d.sent()).data.session;
                        if (!!session_1) return [3 /*break*/, 4];
                        return [4 /*yield*/, createGuestUser()];
                    case 3:
                        _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        // If session exists, set the user
                        setSession(session_1);
                        setUser(session_1.user);
                        setIsGuest((_c = (_b = (_a = session_1.user) === null || _a === void 0 ? void 0 : _a.user_metadata) === null || _b === void 0 ? void 0 : _b.is_guest) !== null && _c !== void 0 ? _c : false);
                        _d.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        error_2 = _d.sent();
                        console.error('Error initializing auth:', error_2);
                        return [3 /*break*/, 8];
                    case 7:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        initAuth();
        // Subscribe to auth changes
        var subscription = supabase_1.supabase.auth.onAuthStateChange(function (event, session) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                setSession(session);
                setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
                setIsGuest((_d = (_c = (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.user_metadata) === null || _c === void 0 ? void 0 : _c.is_guest) !== null && _d !== void 0 ? _d : false);
                return [2 /*return*/];
            });
        }); }).data.subscription;
        return function () {
            subscription.unsubscribe();
        };
    }, []);
    return (React.createElement(AuthContext.Provider, { value: {
            session: session,
            user: user,
            isGuest: isGuest,
            isLoading: isLoading,
            refreshUser: refreshUser
        } }, children));
}
exports.AuthProvider = AuthProvider;
exports.useAuth = function () {
    var context = react_1.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
