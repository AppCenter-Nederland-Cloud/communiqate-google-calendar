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
exports.findDate = exports.getSlotsForDay = exports.sortEventByDay = exports.makeCalendarEvent = exports.getWeekEvents = exports.getAvailableWeeks = exports.checkWeekAvailable = void 0;
var Functions_1 = require("./Functions");
var api_1 = require("../api");
var dayjs = require('dayjs');
var isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);
/**
 * Get the minutes between 2 date strings
 */
function getMinutesBetween(first, second) {
    return dayjs(second).diff(first, 'minute');
}
/**
 * Check if the week is available
 * @param weekData
 */
function checkWeekAvailable(weekData) {
    var availableBool = false;
    weekData.forEach(function (day) {
        //foreach day in the week, check if that day is available, if one of them is true, then week is available. else week is not available
        var available = day.slots.length > 0;
        if (available) {
            availableBool = true;
        }
    });
    // else week is not available
    return availableBool;
}
exports.checkWeekAvailable = checkWeekAvailable;
/**
 * Get the 6 next available weeks
 */
function getAvailableWeeks(config, appointmentDuration, timeBetweenAppointments, timeInAdvance) {
    return __awaiter(this, void 0, void 0, function () {
        var currentWeek, weekIndex, availableWeeks, weekNum, weekEvents, weekAsDay, available, startOfWeek, endOfWeek;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentWeek = dayjs().isoWeek();
                    weekIndex = 0;
                    availableWeeks = [];
                    _a.label = 1;
                case 1:
                    if (!(availableWeeks.length < 8)) return [3 /*break*/, 3];
                    weekNum = dayjs()
                        .isoWeek(currentWeek + weekIndex)
                        .startOf('isoWeek')
                        .isoWeek();
                    return [4 /*yield*/, getWeekEvents(config, weekNum)];
                case 2:
                    weekEvents = _a.sent();
                    if (weekEvents) {
                        weekAsDay = sortEventByDay(weekEvents, appointmentDuration, timeBetweenAppointments, timeInAdvance);
                        available = checkWeekAvailable(weekAsDay);
                        if (available) {
                            startOfWeek = dayjs().isoWeek(weekNum).startOf('isoWeek').format();
                            endOfWeek = dayjs().isoWeek(weekNum).endOf('isoWeek').format();
                            availableWeeks.push({
                                weekString: (0, Functions_1.getWeekString)(startOfWeek, endOfWeek),
                                start: startOfWeek,
                                end: endOfWeek,
                                week: weekNum,
                                days: weekAsDay,
                            });
                        }
                        weekIndex++;
                        //else week is not available so continue
                    }
                    else {
                        console.error('no calendar events available');
                    }
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, availableWeeks];
            }
        });
    });
}
exports.getAvailableWeeks = getAvailableWeeks;
function getSortedEvents(calendar, weekNumber, passedDownEvents, pageToken) {
    if (passedDownEvents === void 0) { passedDownEvents = []; }
    if (pageToken === void 0) { pageToken = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var newEvents, timeMin, timeMax, nextPageToken, event;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newEvents = passedDownEvents ? passedDownEvents : [];
                    timeMin = dayjs().isoWeek(weekNumber).startOf('week').format();
                    timeMax = dayjs().isoWeek(weekNumber).endOf('week').format();
                    nextPageToken = null;
                    return [4 /*yield*/, calendar.getEvents(timeMin, timeMax, 'UTC', {
                            maxResults: 25,
                            pageToken: pageToken ? pageToken : '',
                        })];
                case 1:
                    event = _a.sent();
                    if (event.data.items) {
                        event.data.items.forEach(function (item) {
                            //if date is greater than current date
                            newEvents.push({
                                id: item.id,
                                title: item.summary,
                                description: item.description,
                                start: item.start,
                                end: item.end,
                            });
                        });
                    }
                    if (event.data.nextPageToken) {
                        nextPageToken = event.data.nextPageToken;
                    }
                    if (!nextPageToken) {
                        return [2 /*return*/, newEvents];
                    }
                    return [4 /*yield*/, getSortedEvents(calendar, weekNumber, newEvents, nextPageToken)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get the events from the Google Calendar that are in the given weekNumber
 * @param calendarConfig
 * @param weekNum
 */
function getWeekEvents(calendarConfig, weekNum) {
    return __awaiter(this, void 0, void 0, function () {
        var GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID, calendar;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    GOOGLE_CLIENT_EMAIL = calendarConfig.GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY = calendarConfig.GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID = calendarConfig.GOOGLE_CALENDAR_ID;
                    calendar = new api_1.GoogleCalendar(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID);
                    return [4 /*yield*/, getSortedEvents(calendar, weekNum)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getWeekEvents = getWeekEvents;
/**
 * Create calendar appointment
 */
function makeCalendarEvent(calendarConfig, startDate, endDate, title, description) {
    if (description === void 0) { description = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID, calendar, event, calEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    GOOGLE_CLIENT_EMAIL = calendarConfig.GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY = calendarConfig.GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID = calendarConfig.GOOGLE_CALENDAR_ID;
                    calendar = new api_1.GoogleCalendar(GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID);
                    event = {
                        summary: title,
                        description: description,
                        start: {
                            dateTime: dayjs(startDate).format(),
                        },
                        end: {
                            dateTime: dayjs(endDate).format(),
                        },
                    };
                    return [4 /*yield*/, calendar.createEvent(event)];
                case 1:
                    calEvent = _a.sent();
                    return [2 /*return*/, (0, Functions_1.getAppointmentString)(startDate, endDate, 'nl-NL')];
            }
        });
    });
}
exports.makeCalendarEvent = makeCalendarEvent;
/**
 * sort the event into a day object.
 */
function sortEventByDay(events, appointmentDuration, timeBetweenAppointments, timeInAdvance) {
    var timeSlots = [];
    var days = [];
    //returns array of days
    // sort the items
    events.forEach(function (event) {
        if ((event.title || '').toLowerCase() === 'Beschikbaar'.toLowerCase()) {
            timeSlots.push(event);
        }
    });
    timeSlots.forEach(function (timeSlot) {
        var _a, _b;
        //events => slots
        days.push({
            start: ((_a = timeSlot.start) === null || _a === void 0 ? void 0 : _a.dateTime) || '',
            end: ((_b = timeSlot.end) === null || _b === void 0 ? void 0 : _b.dateTime) || '',
            slots: getSlotsForDay(events, timeSlot, appointmentDuration, timeBetweenAppointments, timeInAdvance),
        });
    });
    return days;
}
exports.sortEventByDay = sortEventByDay;
/**
 * Returns the slots for a given timeSlot(day)
 */
function getSlotsForDay(appointments, timeSlot, appointmentDuration, timeBetweenAppointments, timeInAdvance) {
    var filtered = appointments.filter(function (appointment) {
        var _a, _b;
        return dayjs((_a = appointment.end) === null || _a === void 0 ? void 0 : _a.dateTime).format('DD/MM/YYYY') === dayjs((_b = timeSlot.start) === null || _b === void 0 ? void 0 : _b.dateTime).format('DD/MM/YYYY') &&
            appointment.title !== 'Beschikbaar';
    });
    var slots = getAvailableSlotsForDay(filtered, timeSlot, appointmentDuration, timeBetweenAppointments);
    return slots.filter(function (slot) { return dayjs(slot.start).isAfter(dayjs().add(timeInAdvance, 'minutes').format()); });
}
exports.getSlotsForDay = getSlotsForDay;
/**
 * Get the available time for that day
 * @param appointmentsToday
 * @param timeSlot
 * @param timeBetweenAppointments
 */
function getAvailableTimeForDay(appointmentsToday, timeSlot, timeBetweenAppointments) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var availableTimeToday = [];
    if (appointmentsToday.length > 0) {
        for (var i = 0; i < appointmentsToday.length; i++) {
            var selectedAppointment = appointmentsToday[i];
            var nextSelected = null;
            if (i === 0) {
                if (((_a = timeSlot.start) === null || _a === void 0 ? void 0 : _a.dateTime) && ((_b = selectedAppointment.start) === null || _b === void 0 ? void 0 : _b.dateTime)) {
                    var minutes = getMinutesBetween(timeSlot.start.dateTime, selectedAppointment.start.dateTime);
                    if (minutes > 0) {
                        availableTimeToday.push({
                            startTime: timeSlot.start.dateTime,
                            minutesBetween: minutes,
                            endTime: selectedAppointment.start.dateTime,
                        });
                    }
                }
            }
            if (appointmentsToday.length >= i + 1) {
                nextSelected = appointmentsToday[i + 1];
            }
            if (nextSelected) {
                if (((_c = nextSelected.start) === null || _c === void 0 ? void 0 : _c.dateTime) && ((_d = selectedAppointment.end) === null || _d === void 0 ? void 0 : _d.dateTime)) {
                    var minutes = getMinutesBetween(selectedAppointment.end.dateTime, nextSelected.start.dateTime);
                    if (minutes > 0) {
                        availableTimeToday.push({
                            startTime: dayjs(selectedAppointment.end.dateTime).add(timeBetweenAppointments, 'minute').format(),
                            minutesBetween: minutes - timeBetweenAppointments,
                            endTime: dayjs(nextSelected.start.dateTime).format(),
                        });
                    }
                }
            }
            else {
                if (((_e = selectedAppointment.end) === null || _e === void 0 ? void 0 : _e.dateTime) && ((_f = timeSlot.end) === null || _f === void 0 ? void 0 : _f.dateTime)) {
                    var minutes = getMinutesBetween(selectedAppointment.end.dateTime, timeSlot.end.dateTime);
                    if (minutes > 0) {
                        availableTimeToday.push({
                            startTime: selectedAppointment.end.dateTime,
                            minutesBetween: minutes,
                            endTime: timeSlot.end.dateTime,
                        });
                    }
                }
            }
        }
    }
    else {
        if (((_g = timeSlot.start) === null || _g === void 0 ? void 0 : _g.dateTime) && ((_h = timeSlot.end) === null || _h === void 0 ? void 0 : _h.dateTime)) {
            var minutes = getMinutesBetween(timeSlot.start.dateTime, timeSlot.end.dateTime);
            availableTimeToday.push({
                startTime: timeSlot.start.dateTime,
                getMinutesBetween: minutes,
                endTime: timeSlot.end.dateTime,
            });
        }
    }
    return availableTimeToday;
}
/**
 * Return all available slots for today
 */
function getAvailableSlotsForDay(appointmentsToday, timeSlot, appointmentDuration, timeBetweenAppointments) {
    var availableSlotsToday = [];
    var availableTimeToday = getAvailableTimeForDay(appointmentsToday, timeSlot, timeBetweenAppointments);
    availableTimeToday.forEach(function (availableTime) {
        var newAppointmentStartTime = dayjs(availableTime.startTime);
        var newAppointmentEndTime = dayjs(availableTime.startTime).add(appointmentDuration, 'minute');
        while (newAppointmentStartTime.isBefore(availableTime.endTime)) {
            if (newAppointmentEndTime.isBefore(availableTime.endTime)) {
                availableSlotsToday.push({
                    start: newAppointmentStartTime.format(),
                    end: newAppointmentEndTime.format(),
                });
            }
            newAppointmentStartTime = dayjs(newAppointmentStartTime).add(appointmentDuration + timeBetweenAppointments, 'minute');
            newAppointmentEndTime = dayjs(newAppointmentEndTime).add(appointmentDuration + timeBetweenAppointments, 'minute');
        }
    });
    return availableSlotsToday;
}
/**
 * Finds the corresponding date and returns it
 */
function findDate(weeks, date, timeRange) {
    var day = parseInt(date.split('-')[0]);
    var month = parseInt(date.split('-')[1]);
    var year = parseInt(date.split('-')[2]);
    var startTime = timeRange.split('-')[0];
    var endTime = timeRange.split('-')[1];
    var startTimeHour = parseInt(startTime.split(':')[0]);
    var startTimeMinute = parseInt(startTime.split(':')[1]);
    var endTimeHour = parseInt(endTime.split(':')[0]);
    var endTimeMinute = parseInt(endTime.split(':')[1]);
    var initialDate = new Date("".concat(month, "/").concat(day, "/").concat(year));
    var startDateTime = new Date(initialDate.setHours(startTimeHour, startTimeMinute));
    var endDateTime = new Date(initialDate.setHours(endTimeHour, endTimeMinute));
    var string = (0, Functions_1.getAppointmentString)(startDateTime.toString(), endDateTime.toString(), 'nl-NL');
    console.log('str', string);
    var slots = [];
    weeks.forEach(function (week) {
        week.days.forEach(function (day) {
            day.slots.forEach(function (slot) {
                slots.push({
                    parsedString: (0, Functions_1.getAppointmentString)(slot.start, slot.end, 'nl-NL'),
                    start: slot.start,
                    end: slot.end,
                });
            });
        });
    });
    var found = slots.find(function (slot) { return slot.parsedString === string; });
    if (found) {
        return {
            start: found.start,
            end: found.end,
        };
    }
    else {
        return {
            start: 'not_found',
            end: 'not_found',
        };
    }
}
exports.findDate = findDate;
