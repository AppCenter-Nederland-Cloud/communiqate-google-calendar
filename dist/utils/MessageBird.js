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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAppointmentMessage = exports.sendDaysMessage = void 0;
var Functions_1 = require("./Functions");
var axios = require('axios');
function sendDaysMessage(conversationId, apiKey, days, weekNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var MessageBirdMessages, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    MessageBirdMessages = axios.create({
                        baseURL: "https://conversations.messagebird.com/v1/conversations/".concat(conversationId),
                        headers: {
                            Authorization: "AccessKey ".concat(apiKey),
                        },
                    });
                    rows = [];
                    days.forEach(function (day) {
                        rows.push({
                            id: day.actualDate,
                            title: day.actualDate,
                            description: day.parsedDate,
                        });
                    });
                    rows.push({
                        id: "anders",
                        title: "Andere week kiezen",
                        description: "Kies voor deze optie als u voor een andere week een afspraak wilt maken.",
                    });
                    return [4 /*yield*/, MessageBirdMessages.post("/messages", {
                            type: "interactive",
                            content: {
                                interactive: {
                                    type: "list",
                                    header: {
                                        type: "text",
                                        text: "Afspraak planner",
                                    },
                                    body: {
                                        text: "Dit zijn de dagen die beschikbaar zijn voor deze week, wil je toch een andere week kiezen? Kies dan voor Andere week kiezen.",
                                    },
                                    action: {
                                        sections: [
                                            {
                                                title: "Beschikbaarheid week ".concat(weekNumber),
                                                rows: rows,
                                            },
                                        ],
                                        button: "Datum kiezen",
                                    },
                                },
                            },
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.sendDaysMessage = sendDaysMessage;
function sendAppointmentMessage(conversationId, apiKey, appointments, date) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, MessageBirdMessages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rows = [];
                    MessageBirdMessages = axios.create({
                        baseURL: "https://conversations.messagebird.com/v1/conversations/".concat(conversationId),
                        headers: {
                            Authorization: "AccessKey ".concat(apiKey),
                        },
                    });
                    appointments.forEach(function (app) {
                        var title = "".concat((0, Functions_1.dateString)(app.startDate, "nl-NL", 'Europe/Amsterdam', {
                            timeStyle: "short",
                        }), " - ").concat((0, Functions_1.dateString)(app.endDate, "nl-NL", 'Europe/Amsterdam', { timeStyle: "short" }));
                        rows.push({
                            id: app.startDate,
                            title: title,
                            description: app.fullString,
                        });
                    });
                    rows.push({
                        id: "anders",
                        title: "Andere dag kiezen",
                        description: "Kies voor deze optie als u voor een andere dag een afspraak wilt maken.",
                    });
                    return [4 /*yield*/, MessageBirdMessages.post("/messages", {
                            type: "interactive",
                            content: {
                                interactive: {
                                    type: "list",
                                    header: {
                                        type: "text",
                                        text: "Afspraak planner",
                                    },
                                    body: {
                                        text: "Dit zijn de tijden die beschikbaar zijn voor deze dag, wil je toch een andere dag kiezen? Kies dan voor andere dag kiezen.",
                                    },
                                    action: {
                                        sections: [
                                            {
                                                title: "".concat(date),
                                                rows: rows,
                                            },
                                        ],
                                        button: "Tijdstip kiezen",
                                    },
                                },
                            },
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.sendAppointmentMessage = sendAppointmentMessage;
