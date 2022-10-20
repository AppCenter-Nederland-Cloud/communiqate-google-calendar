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
exports.getTimeRange = exports.getAppointmentString = exports.getDateString = exports.dateString = void 0;
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
function getAppointmentString(start, end, locale) {
    if (locale === void 0) { locale = 'nl-NL'; }
    var date = dateString(start, locale, 'Europe/Amsterdam', {
        dateStyle: 'full',
    });
    var startTime = dateString(start, locale, 'Europe/Amsterdam', {
        timeStyle: 'short',
    });
    var endTime = dateString(end, locale, 'Europe/Amsterdam', {
        timeStyle: 'short',
    });
    return "".concat(date, " tussen ").concat(startTime, " en ").concat(endTime);
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
