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
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentHasPassed = exports.appointmentStringToDate = exports.getMinutesBetween = exports.getWeekString = exports.getTimeRange = exports.getAppointmentString = exports.getDateString = exports.dateString = void 0;
var dayjs = require("dayjs");
/**
 * Gets the date string as specified in the options
 */
function dateString(date, locale, timeZone, options) {
    if (locale === void 0) { locale = 'nl-NL'; }
    if (timeZone === void 0) { timeZone = 'Europe/Amsterdam'; }
    if (options === void 0) { options = undefined; }
    return new Intl.DateTimeFormat(locale, __assign(__assign({}, options), { timeZone: timeZone })).format(new Date(date));
}
exports.dateString = dateString;
/**
 * Gets the date string as example: "10 oktober 2022
 */
function getDateString(date, locale, timeZone) {
    if (locale === void 0) { locale = 'nl-NL'; }
    if (timeZone === void 0) { timeZone = 'Europe/Amsterdam'; }
    return dateString(date, locale, timeZone, { dateStyle: 'long' });
}
exports.getDateString = getDateString;
/**
 * gets the appointment string as "woensdag 18 januari 2023 tussen 16:00 en 16:30"
 */
function getAppointmentString(start, end, locale, timeZone) {
    if (locale === void 0) { locale = 'nl-NL'; }
    if (timeZone === void 0) { timeZone = 'Europe/Amsterdam'; }
    var date = dateString(start, locale, timeZone, {
        dateStyle: 'full',
    });
    var startTime = dateString(start, locale, timeZone, {
        timeStyle: 'short',
    });
    // const endTime = dateString(end, locale, timeZone, {
    //   timeStyle: 'short',
    // });
    return "".concat(date, " om ").concat(startTime);
}
exports.getAppointmentString = getAppointmentString;
/**
 * Gets a time range from 2 date strings
 */
function getTimeRange(startDate, endDate) {
    var startTime = dateString(startDate, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' });
    var endTime = dateString(endDate, 'nl-NL', 'Europe/Amsterdam', { timeStyle: 'short' });
    return "".concat(startTime, " - ").concat(endTime);
}
exports.getTimeRange = getTimeRange;
/**
 * Gets a week string as "24 Oktober 2022 - 30 Oktober 2022"
 * @param startDate
 * @param endDate
 * @param locale
 * @param timeZone
 */
function getWeekString(startDate, endDate, locale, timeZone) {
    if (locale === void 0) { locale = 'nl-NL'; }
    if (timeZone === void 0) { timeZone = 'Europe/amsterdam'; }
    return "".concat(getDateString(startDate, locale, timeZone), " - ").concat(getDateString(endDate, locale, timeZone));
}
exports.getWeekString = getWeekString;
/**
 * Get the minutes between 2 date strings
 */
function getMinutesBetween(first, second) {
    return dayjs(second).diff(first, 'minute');
}
exports.getMinutesBetween = getMinutesBetween;
function appointmentStringToDate(appointmentString) {
    return new Date(appointmentString.replace('om ', ''));
}
exports.appointmentStringToDate = appointmentStringToDate;
/**
 * Check if the given appointment is before the current date, if so return true else return fase
 */
function appointmentHasPassed(appointmentString) {
    var validAppointmentString = appointmentString.replace('om ', '');
    // UTC -> Europe/Amsterdam
    var currentDate = dateString(new Date(), 'nl-NL', 'Europe/Amsterdam', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
    // Europe/Amsterdam
    var appointmentDate = new Date(validAppointmentString);
    return {
        currentDate: currentDate,
        appointmentDate: appointmentDate,
        hasPassed: new Date(currentDate).getTime() > new Date(validAppointmentString).getTime(),
    };
}
exports.appointmentHasPassed = appointmentHasPassed;
