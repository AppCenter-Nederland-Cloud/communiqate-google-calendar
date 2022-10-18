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
exports.getAppointmentsByDay = exports.getDaysByWeek = exports.getAvailableWeeks = exports.getAvailableSlotsTotal = exports.sortEvents = exports.makeCalendarEvent = exports.getCalendarEvents = void 0;
var googleapis_1 = require("googleapis");
var Functions_1 = require("./Functions");
var dayjs = require('dayjs');
var isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);
/**
 * Get all the events from the Google calendar
 */
function getCalendarEvents(calendarConfig, timeMin, timeMax) {
    return __awaiter(this, void 0, void 0, function () {
        var GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID, SCOPES, jwtClient, calendar, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    GOOGLE_CLIENT_EMAIL = calendarConfig.GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY = calendarConfig.GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID = calendarConfig.GOOGLE_CALENDAR_ID, SCOPES = calendarConfig.SCOPES;
                    jwtClient = new googleapis_1.google.auth.JWT(GOOGLE_CLIENT_EMAIL, undefined, GOOGLE_PRIVATE_KEY, SCOPES);
                    calendar = googleapis_1.google.calendar({
                        version: "v3",
                        auth: jwtClient,
                    });
                    return [4 /*yield*/, calendar.events.list({
                            calendarId: GOOGLE_CALENDAR_ID,
                            timeMin: timeMin,
                            timeMax: timeMax,
                            maxResults: 2500,
                            timeZone: "UTC",
                            singleEvents: true,
                            orderBy: "startTime",
                        })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data.items];
            }
        });
    });
}
exports.getCalendarEvents = getCalendarEvents;
/**
 * Create calendar appointment
 */
function makeCalendarEvent(calendarConfig, date, timeRange, displayName, phoneNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID, SCOPES, jwtClient, calendar, day, month, year, startTime, endTime, startTimeHour, startTimeMinute, endTimeHour, endTimeMinute, initialDate, startDateTime, endDateTime, event;
        return __generator(this, function (_a) {
            GOOGLE_CLIENT_EMAIL = calendarConfig.GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY = calendarConfig.GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID = calendarConfig.GOOGLE_CALENDAR_ID, SCOPES = calendarConfig.SCOPES;
            jwtClient = new googleapis_1.google.auth.JWT(GOOGLE_CLIENT_EMAIL, undefined, GOOGLE_PRIVATE_KEY, SCOPES);
            calendar = googleapis_1.google.calendar({
                version: "v3",
                auth: jwtClient,
            });
            day = parseInt(date.split("/")[0]);
            month = parseInt(date.split("/")[1]);
            year = parseInt(date.split("/")[2]);
            startTime = timeRange.split("-")[0];
            endTime = timeRange.split("-")[1];
            startTimeHour = parseInt(startTime.split(":")[0]);
            startTimeMinute = parseInt(startTime.split(":")[1]);
            endTimeHour = parseInt(endTime.split(":")[0]);
            endTimeMinute = parseInt(endTime.split(":")[1]);
            initialDate = new Date("".concat(month, "/").concat(day, "/").concat(year));
            startDateTime = new Date(initialDate.setHours(startTimeHour, startTimeMinute));
            endDateTime = new Date(initialDate.setHours(endTimeHour, endTimeMinute));
            event = {
                summary: "Afspraak met ".concat(displayName),
                start: {
                    //dateTime: dayjs(startDateTime).utc().tz("Europe/Amsterdam").format()
                    dateTime: dayjs(startDateTime).add(-2, "hour").format(),
                },
                end: {
                    //dateTime: dayjs(endDateTime).utc().tz("Europe/Amsterdam").format()
                    dateTime: dayjs(endDateTime).add(-2, "hour").format(),
                },
                description: "Afspraak gemaakt door ".concat(displayName, " met telefoonnummer ").concat(phoneNumber),
            };
            calendar.events.insert({
                'calendarId': GOOGLE_CALENDAR_ID,
                'requestBody': event
            });
            return [2 /*return*/, (0, Functions_1.getAppointmentString)(startDateTime.toISOString(), endDateTime.toISOString(), "nl-NL")];
        });
    });
}
exports.makeCalendarEvent = makeCalendarEvent;
/**
 * Sort the events into Slots and Appointments
 */
function sortEvents(events) {
    var timeSlots = [];
    var appointments = [];
    events.forEach(function (event) {
        if (event.summary.toLowerCase() === "Beschikbaar".toLowerCase()) {
            timeSlots.push({
                summary: event.summary,
                start: event.start.dateTime,
                end: event.end.dateTime,
            });
        }
        else {
            appointments.push({
                summary: event.summary,
                start: event.start.dateTime,
                end: event.end.dateTime,
            });
        }
    });
    return {
        timeSlots: timeSlots,
        appointments: appointments,
    };
}
exports.sortEvents = sortEvents;
/**
 * Returns the appointments for today (not available)
 */
function getAppointmentsForTimeSlot(appointments, timeSlot) {
    return appointments.filter(function (appointment) {
        return dayjs(appointment.end).format("DD/MM/YYYY") ===
            dayjs(timeSlot.start).format("DD/MM/YYYY");
    });
}
/**
 * Get the minutes between 2 date strings
 */
function getMinutesBetween(first, second) {
    return dayjs(second).diff(first, "minute");
}
/**
 * Get the available time for that day
 */
function getAvailableTimeToday(appointmentsToday, timeSlot, timeBetweenAppointments) {
    var availableTimeToday = [];
    if (appointmentsToday.length > 0) {
        for (var i = 0; i < appointmentsToday.length; i++) {
            var selectedAppointment = appointmentsToday[i];
            var nextSelected = null;
            if (i === 0) {
                var minutes = getMinutesBetween(timeSlot.start, selectedAppointment.start);
                if (minutes > 0) {
                    availableTimeToday.push({
                        startTime: timeSlot.start,
                        minutesBetween: minutes,
                        endTime: selectedAppointment.start,
                    });
                }
            }
            if (appointmentsToday.length >= i + 1) {
                nextSelected = appointmentsToday[i + 1];
            }
            if (nextSelected) {
                var minutes = getMinutesBetween(selectedAppointment.end, nextSelected.start);
                if (minutes > 0) {
                    availableTimeToday.push({
                        startTime: dayjs(selectedAppointment.end)
                            .add(timeBetweenAppointments, "minute")
                            .format(),
                        minutesBetween: minutes - timeBetweenAppointments,
                        endTime: dayjs(nextSelected.start).format(),
                    });
                }
            }
            else {
                var minutes = getMinutesBetween(selectedAppointment.end, timeSlot.end);
                if (minutes > 0) {
                    availableTimeToday.push({
                        startTime: selectedAppointment.end,
                        minutesBetween: minutes,
                        endTime: timeSlot.end,
                    });
                }
            }
        }
    }
    else {
        var minutes = getMinutesBetween(timeSlot.start, timeSlot.end);
        availableTimeToday.push({
            startTime: timeSlot.start,
            getMinutesBetween: minutes,
            endTime: timeSlot.end,
        });
    }
    return availableTimeToday;
}
/**
 * Return all available slots for today
 */
function getAvailableSlotsToday(availableTimeToday, appointmentDuration, timeBetweenAppointments) {
    var availableSlotsToday = [];
    availableTimeToday.forEach(function (availableTime) {
        var newAppointmentStartTime = dayjs(availableTime.startTime);
        var newAppointmentEndTime = dayjs(availableTime.startTime).add(appointmentDuration, "minute");
        while (newAppointmentStartTime.isBefore(availableTime.endTime)) {
            if (newAppointmentEndTime.isBefore(availableTime.endTime)) {
                availableSlotsToday.push({
                    startTime: newAppointmentStartTime.format(),
                    endTime: newAppointmentEndTime.format(),
                });
            }
            newAppointmentStartTime = dayjs(newAppointmentStartTime).add(appointmentDuration + timeBetweenAppointments, "minute");
            newAppointmentEndTime = dayjs(newAppointmentEndTime).add(appointmentDuration + timeBetweenAppointments, "minute");
        }
    });
    return availableSlotsToday;
}
/**
 * Returns all available slots
 */
function getAvailableSlotsTotal(timeSlots, appointments, timeBetweenAppointments, appointmentDuration) {
    var allSlots = [];
    timeSlots.forEach(function (timeSlot) {
        var appointmentsToday = getAppointmentsForTimeSlot(appointments, timeSlot);
        var availableTimeToday = getAvailableTimeToday(appointmentsToday, timeSlot, timeBetweenAppointments);
        var availableSlotsToday = getAvailableSlotsToday(availableTimeToday, appointmentDuration, timeBetweenAppointments);
        availableSlotsToday.forEach(function (slot) {
            if (dayjs(slot.startTime).isAfter(dayjs())) {
                allSlots.push({
                    fullString: (0, Functions_1.getAppointmentString)(slot.startTime, slot.endTime, "nl-NL"),
                    startDate: slot.startTime,
                    endDate: slot.endTime,
                });
            }
        });
    });
    return allSlots;
}
exports.getAvailableSlotsTotal = getAvailableSlotsTotal;
/**
 * Get the available weeks
 */
function getAvailableWeeks(allSlots) {
    var weeks = {};
    allSlots.forEach(function (slot) {
        var date = dayjs(slot.startDate);
        var weekNum = date.isoWeek();
        weeks[weekNum] = {
            title: "week ".concat(weekNum),
            startDate: date.startOf("isoWeek").format(),
            description: "".concat((0, Functions_1.getDateString)(date.startOf("isoWeek").format()), " tot ").concat((0, Functions_1.getDateString)(date.endOf("isoWeek").format())),
            number: weekNum,
        };
    });
    return weeks;
}
exports.getAvailableWeeks = getAvailableWeeks;
/**
 * Get the days of the week that are available
 */
function getDaysByWeek(allSlots, weekNumber) {
    var days = [];
    allSlots.forEach(function (slot) {
        var day = (0, Functions_1.dateString)(slot.startDate, "nl-NL", 'Europe/Amsterdam', { dateStyle: "full" });
        var weekNum = dayjs(slot.startDate).isoWeek();
        if (weekNum === weekNumber) {
            if (days.find(function (d) { return d.parsedDate === day; })) {
            }
            else {
                days.push({
                    parsedDate: day,
                    actualDate: dayjs(slot.startDate).format("DD/MM/YYYY"),
                });
            }
        }
    });
    return days;
}
exports.getDaysByWeek = getDaysByWeek;
/**
 * Get the appointments by day
 */
function getAppointmentsByDay(allSlots, date) {
    var days = [];
    allSlots.forEach(function (slot) {
        var day = dayjs(slot.startDate).format("DD/MM/YYYY");
        if (day === date) {
            if (days.length < 9) {
                days.push(slot);
            }
        }
    });
    return days;
}
exports.getAppointmentsByDay = getAppointmentsByDay;
