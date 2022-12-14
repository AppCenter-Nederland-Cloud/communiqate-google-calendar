"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendar = void 0;
var googleapis_1 = require("googleapis");
/**
 * Google calendar client wrapper
 */
var GoogleCalendar = /** @class */ (function () {
    /**
     * @param googleClientEmail
     * @param googlePrivateKey
     * @param calendarId
     */
    function GoogleCalendar(googleClientEmail, googlePrivateKey, calendarId) {
        this.calendarId = calendarId;
        var jwtClient = new googleapis_1.google.auth.JWT(googleClientEmail, undefined, googlePrivateKey, 'https://www.googleapis.com/auth/calendar');
        this.client = googleapis_1.google.calendar({
            version: 'v3',
            auth: jwtClient,
        });
    }
    /**
     * Get the calendar events
     * @param timeZone
     * @param timeMin
     * @param timeMax
     * @param options
     */
    GoogleCalendar.prototype.getEvents = function (timeMin, timeMax, timeZone, options) {
        if (timeZone === void 0) { timeZone = 'UTC'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.events.list(__assign({ calendarId: this.calendarId, maxResults: 250, timeZone: timeZone, timeMin: timeMin, timeMax: timeMax, singleEvents: true, orderBy: 'startTime' }, options))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Create a new calendar event
     * @param event
     * @param options
     */
    GoogleCalendar.prototype.createEvent = function (event, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.events.insert(__assign({ calendarId: this.calendarId, requestBody: event }, options))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Deletes a calendar event
     * @param eventId
     */
    GoogleCalendar.prototype.deleteEvent = function (eventId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.events.delete({
                            calendarId: this.calendarId,
                            eventId: eventId,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * updates a calendar event
     * @param eventId
     * @param event
     */
    GoogleCalendar.prototype.updateEvent = function (eventId, event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.events.update({
                            calendarId: this.calendarId,
                            eventId: eventId,
                            requestBody: event,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves an event
     * @param eventId
     */
    GoogleCalendar.prototype.getEvent = function (eventId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.events.get({
                            calendarId: this.calendarId,
                            eventId: eventId,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return GoogleCalendar;
}());
exports.GoogleCalendar = GoogleCalendar;
