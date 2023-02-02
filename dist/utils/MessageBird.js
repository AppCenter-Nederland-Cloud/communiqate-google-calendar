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
exports.sendSuggestionsMessage = exports.sendAppointmentMessage = exports.sendDaysMessage = exports.sendErrorMessage = void 0;
var Functions_1 = require("./Functions");
var Calendar_1 = require("./Calendar");
var axios = require('axios');
var url = 'https://conversations.messagebird.com/v1/conversations';
function sendErrorMessage(config, errorMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var conversationId, apiKey, MessageBirdMessages;
        return __generator(this, function (_a) {
            conversationId = config.conversationId, apiKey = config.apiKey;
            MessageBirdMessages = axios.create({
                baseURL: "".concat(url, "/").concat(conversationId),
                headers: {
                    Authorization: "AccessKey ".concat(apiKey),
                },
            });
            MessageBirdMessages.post('/messages', {
                type: 'interactive',
                content: {
                    interactive: {
                        type: 'button',
                        header: {
                            type: 'text',
                            text: 'Er is een fout opgetreden',
                        },
                        body: {
                            text: errorMessage,
                        },
                        action: {
                            buttons: [
                                {
                                    id: 'no-unique-id',
                                    type: 'reply',
                                    title: 'Opnieuw proberen',
                                },
                            ],
                        },
                    },
                },
            });
            return [2 /*return*/];
        });
    });
}
exports.sendErrorMessage = sendErrorMessage;
function sendDaysMessage(config, days, weekNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var conversationId, apiKey, MessageBirdMessages, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = config.conversationId, apiKey = config.apiKey;
                    MessageBirdMessages = axios.create({
                        baseURL: "".concat(url, "/").concat(conversationId),
                        headers: {
                            Authorization: "AccessKey ".concat(apiKey),
                        },
                    });
                    rows = [];
                    days.forEach(function (day) {
                        if (day.slots.length > 0) {
                            if (rows.length < 10) {
                                rows.push({
                                    id: day.start,
                                    title: (0, Functions_1.dateString)(day.start, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'short' }),
                                    description: (0, Functions_1.dateString)(day.start, 'nl-NL', 'Europe/Amsterdam', { dateStyle: 'full' }),
                                });
                            }
                        }
                    });
                    return [4 /*yield*/, MessageBirdMessages.post('/messages', {
                            type: 'interactive',
                            content: {
                                interactive: {
                                    type: 'list',
                                    body: {
                                        text: 'Hieronder kun je kiezen uit de beschikbare dagen voor de door jouw gekozen week.',
                                    },
                                    action: {
                                        sections: [
                                            {
                                                title: "Beschikbaarheid week ".concat(weekNumber),
                                                rows: rows,
                                            },
                                        ],
                                        button: 'Dag kiezen',
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
function sendAppointmentMessage(config, appointments, dateResponse) {
    return __awaiter(this, void 0, void 0, function () {
        var conversationId, apiKey, rows, MessageBirdMessages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = config.conversationId, apiKey = config.apiKey;
                    rows = [];
                    MessageBirdMessages = axios.create({
                        baseURL: "".concat(url, "/").concat(conversationId),
                        headers: {
                            Authorization: "AccessKey ".concat(apiKey),
                        },
                    });
                    appointments.forEach(function (appointment) {
                        var title = "".concat((0, Functions_1.dateString)(appointment.start, 'nl-NL', 'Europe/Amsterdam', {
                            timeStyle: 'short',
                        }), " - ").concat((0, Functions_1.dateString)(appointment.end, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' }));
                        if (rows.length < 10) {
                            rows.push({
                                id: appointment.start,
                                title: title,
                                description: (0, Functions_1.getAppointmentString)(appointment.start, appointment.end),
                            });
                        }
                    });
                    return [4 /*yield*/, MessageBirdMessages.post('/messages', {
                            type: 'interactive',
                            content: {
                                interactive: {
                                    type: 'list',
                                    body: {
                                        text: 'Hieronder kun je kiezen uit de beschikbare tijdstippen voor de door jouw gekozen dag.',
                                    },
                                    action: {
                                        sections: [
                                            {
                                                title: "".concat(dateResponse),
                                                rows: rows,
                                            },
                                        ],
                                        button: 'Tijdstip kiezen',
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
function sendSuggestionsMessage(config, weeks, sendMessage) {
    if (sendMessage === void 0) { sendMessage = true; }
    return __awaiter(this, void 0, void 0, function () {
        var conversationId, apiKey, MessageBirdMessages, slots, suggestionRows, weekRows, i, i, week, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = config.conversationId, apiKey = config.apiKey;
                    MessageBirdMessages = axios.create({
                        baseURL: "".concat(url, "/").concat(conversationId),
                        headers: {
                            Authorization: "AccessKey ".concat(apiKey),
                        },
                    });
                    slots = (0, Calendar_1.getSlotsFromWeek)(weeks);
                    suggestionRows = [];
                    weekRows = [];
                    if (slots.length === 0) {
                        //send alternative message (nothing available)
                        return [2 /*return*/, false];
                    }
                    if (slots.length > 9) {
                        // there are more than 10 slots. So, send 3 suggestions and (max 7) weeks.
                        //push the first 3 suggestions
                        for (i = 0; i < 3; i++) {
                            suggestionRows.push({
                                id: "Voorstel ".concat(i),
                                title: "Voorstel ".concat(i + 1),
                                description: slots[i].parsedString,
                            });
                        }
                        //only 7 weeks may be pushed, if less than 7 are available, push all the weeks.
                        if (weeks.length < 7) {
                            //push all the weeks
                            weeks.forEach(function (week) {
                                weekRows.push({
                                    id: "week ".concat(week.week),
                                    title: "week ".concat(week.week),
                                    description: week.weekString,
                                });
                            });
                        }
                        else {
                            //only push the first 7
                            for (i = 0; i < 7; i++) {
                                week = weeks[i];
                                weekRows.push({
                                    id: "week ".concat(week.week),
                                    title: "week ".concat(week.week),
                                    description: week.weekString,
                                });
                            }
                        }
                    }
                    else {
                        //only fill up the suggestions with all slots.
                        for (i = 0; i < slots.length; i++) {
                            suggestionRows.push({
                                id: "Voorstel ".concat(i),
                                title: "Voorstel ".concat(i + 1),
                                description: slots[i].parsedString,
                            });
                        }
                    }
                    if (!sendMessage) {
                        return [2 /*return*/, slots];
                    }
                    return [4 /*yield*/, MessageBirdMessages.post('/messages', {
                            type: 'interactive',
                            content: {
                                interactive: {
                                    type: 'list',
                                    header: {
                                        type: 'text',
                                        text: 'Laten we een afspraak plannen!',
                                    },
                                    body: {
                                        text: 'Ik kan een afspraak met je plannen. Druk op "Moment kiezen" om een geschikt moment voor je afspraak te kiezen.',
                                    },
                                    action: {
                                        sections: weekRows.length > 0
                                            ? [
                                                {
                                                    title: "Voorstellen",
                                                    rows: suggestionRows,
                                                },
                                                {
                                                    title: "Ander moment",
                                                    rows: weekRows,
                                                },
                                            ]
                                            : [
                                                {
                                                    title: "Voorstellen",
                                                    rows: suggestionRows,
                                                },
                                            ],
                                        button: 'Moment kiezen',
                                    },
                                },
                            },
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, slots];
            }
        });
    });
}
exports.sendSuggestionsMessage = sendSuggestionsMessage;
