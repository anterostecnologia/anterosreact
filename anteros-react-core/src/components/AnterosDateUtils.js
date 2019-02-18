/**
 * Date utility
 */

var MILLISECONDS_IN_HOUR = 3600000;
var MILLISECONDS_IN_MINUTE = 60000;
var MILLISECONDS_IN_MINUTE = 60000;
var MILLISECONDS_IN_DAY = 86400000;
var MILLISECONDS_IN_MINUTE = 60000;
var MILLISECONDS_IN_WEEK = 604800000;
var MILLISECONDS_IN_HOUR = 3600000;
var MILLISECONDS_IN_WEEK = 604800000;
var MINUTES_IN_DAY = 1440;
var MINUTES_IN_ALMOST_TWO_DAYS = 2520;
var MINUTES_IN_MONTH = 43200;
var MINUTES_IN_TWO_MONTHS = 86400;
var MINUTES_IN_DAY = 1440
var MINUTES_IN_MONTH = 43200
var MINUTES_IN_YEAR = 525600
var MINUTES_IN_DAY = 1440;
var MINUTES_IN_MONTH = 43200;
var MINUTES_IN_YEAR = 525600;
var MILLISECONDS_IN_WEEK = 604800000;
var MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

var MILLISECONDS_IN_HOUR = 3600000
var MILLISECONDS_IN_MINUTE = 60000
var DEFAULT_ADDITIONAL_DIGITS = 2

var parseTokenDateTimeDelimeter = /[T ]/
var parseTokenPlainTime = /:/

// year tokens
var parseTokenYY = /^(\d{2})$/
var parseTokensYYY = [
    /^([+-]\d{2})$/, // 0 additional digits
    /^([+-]\d{3})$/, // 1 additional digit
    /^([+-]\d{4})$/ // 2 additional digits
]

var parseTokenYYYY = /^(\d{4})/
var parseTokensYYYYY = [
    /^([+-]\d{4})/, // 0 additional digits
    /^([+-]\d{5})/, // 1 additional digit
    /^([+-]\d{6})/ // 2 additional digits
]

// date tokens
var parseTokenMM = /^-(\d{2})$/
var parseTokenDDD = /^-?(\d{3})$/
var parseTokenMMDD = /^-?(\d{2})-?(\d{2})$/
var parseTokenWww = /^-?W(\d{2})$/
var parseTokenWwwD = /^-?W(\d{2})-?(\d{1})$/

// time tokens
var parseTokenHH = /^(\d{2}([.,]\d*)?)$/
var parseTokenHHMM = /^(\d{2}):?(\d{2}([.,]\d*)?)$/
var parseTokenHHMMSS = /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/

// timezone tokens
var parseTokenTimezone = /([Z+-].*)$/
var parseTokenTimezoneZ = /^(Z)$/
var parseTokenTimezoneHH = /^([+-])(\d{2})$/
var parseTokenTimezoneHHMM = /^([+-])(\d{2}):?(\d{2})$/

var formatters = {
    // Month: 1, 2, ..., 12
    'M': function (date) {
        return date.getMonth() + 1
    },

    // Month: 01, 02, ..., 12
    'MM': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getMonth() + 1, 2)
    },

    // Quarter: 1, 2, 3, 4
    'Q': function (date) {
        return Math.ceil((date.getMonth() + 1) / 3)
    },

    // Day of month: 1, 2, ..., 31
    'D': function (date) {
        return date.getDate()
    },

    // Day of month: 01, 02, ..., 31
    'DD': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getDate(), 2)
    },

    // Day of year: 1, 2, ..., 366
    'DDD': function (date) {
        return new AnterosDateUtils().getDayOfYear(date)
    },

    // Day of year: 001, 002, ..., 366
    'DDDD': function (date) {
        return new AnterosDateUtils().addLeadingZeros(new AnterosDateUtils().getDayOfYear(date), 3)
    },

    // Day of week: 0, 1, ..., 6
    'd': function (date) {
        return date.getDay()
    },

    // Day of ISO week: 1, 2, ..., 7
    'E': function (date) {
        return date.getDay() || 7
    },

    // ISO week: 1, 2, ..., 53
    'W': function (date) {
        return getISOWeek(date)
    },

    // ISO week: 01, 02, ..., 53
    'WW': function (date) {
        return new AnterosDateUtils().addLeadingZeros(new AnterosDateUtils().getISOWeek(date), 2)
    },

    // Year: 00, 01, ..., 99
    'YY': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getFullYear(), 4).substr(2)
    },

    // Year: 1900, 1901, ..., 2099
    'YYYY': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getFullYear(), 4)
    },

    // ISO week-numbering year: 00, 01, ..., 99
    'GG': function (date) {
        return String(new AnterosDateUtils().getISOYear(date)).substr(2)
    },

    // ISO week-numbering year: 1900, 1901, ..., 2099
    'GGGG': function (date) {
        return new AnterosDateUtils().getISOYear(date)
    },

    // Hour: 0, 1, ... 23
    'H': function (date) {
        return date.getHours()
    },

    // Hour: 00, 01, ..., 23
    'HH': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getHours(), 2)
    },

    // Hour: 1, 2, ..., 12
    'h': function (date) {
        var hours = date.getHours()
        if (hours === 0) {
            return 12
        } else if (hours > 12) {
            return hours % 12
        } else {
            return hours
        }
    },

    // Hour: 01, 02, ..., 12
    'hh': function (date) {
        return new AnterosDateUtils().addLeadingZeros(formatters['h'](date), 2)
    },

    // Minute: 0, 1, ..., 59
    'm': function (date) {
        return date.getMinutes()
    },

    // Minute: 00, 01, ..., 59
    'mm': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getMinutes(), 2)
    },

    // Second: 0, 1, ..., 59
    's': function (date) {
        return date.getSeconds()
    },

    // Second: 00, 01, ..., 59
    'ss': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getSeconds(), 2)
    },

    // 1/10 of second: 0, 1, ..., 9
    'S': function (date) {
        return Math.floor(date.getMilliseconds() / 100)
    },

    // 1/100 of second: 00, 01, ..., 99
    'SS': function (date) {
        return new AnterosDateUtils().addLeadingZeros(Math.floor(date.getMilliseconds() / 10), 2)
    },

    // Millisecond: 000, 001, ..., 999
    'SSS': function (date) {
        return new AnterosDateUtils().addLeadingZeros(date.getMilliseconds(), 3)
    },

    // Timezone: -01:00, +00:00, ... +12:00
    'Z': function (date) {
        return new AnterosDateUtils().formatTimezone(date.getTimezoneOffset(), ':')
    },

    // Timezone: -0100, +0000, ... +1200
    'ZZ': function (date) {
        return new AnterosDateUtils().formatTimezone(date.getTimezoneOffset())
    },

    // Seconds timestamp: 512969520
    'X': function (date) {
        return Math.floor(date.getTime() / 1000)
    },

    // Milliseconds timestamp: 512969520900
    'x': function (date) {
        return date.getTime()
    }
}


var commonFormatterKeys = [
    'M', 'MM', 'Q', 'D', 'DD', 'DDD', 'DDDD', 'd',
    'E', 'W', 'WW', 'YY', 'YYYY', 'GG', 'GGGG',
    'H', 'HH', 'h', 'hh', 'm', 'mm',
    's', 'ss', 'S', 'SS', 'SSS',
    'Z', 'ZZ', 'X', 'x'
]






class AnterosDateUtils {
    constructor() {

    }
    /**
     * @summary Add the specified number of days to the given date.
     *
     * @description
     * Add the specified number of days to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of days to be added
     * @returns {Date} the new date with the days added
     *
     * @example
     * // Add 10 days to 1 September 2014:
     * var result = addDays(new Date(2014, 8, 1), 10)
     * //=> Thu Sep 11 2014 00:00:00
     */
    addDays(dirtyDate, dirtyAmount) {
        var date = this.parse(dirtyDate)
        var amount = Number(dirtyAmount)
        date.setDate(date.getDate() + amount)
        return date
    }



    /**
     * @summary Add the specified number of hours to the given date.
     *
     * @description
     * Add the specified number of hours to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of hours to be added
     * @returns {Date} the new date with the hours added
     *
     * @example
     * // Add 2 hours to 10 July 2014 23:00:00:
     * var result = addHours(new Date(2014, 6, 10, 23, 0), 2)
     * //=> Fri Jul 11 2014 01:00:00
     */
    addHours(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return addMilliseconds(dirtyDate, amount * MILLISECONDS_IN_HOUR)
    }

    /**
     * @summary Add the specified number of ISO week-numbering years to the given date.
     *
     * @description
     * Add the specified number of ISO week-numbering years to the given date.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of ISO week-numbering years to be added
     * @returns {Date} the new date with the ISO week-numbering years added
     *
     * @example
     * // Add 5 ISO week-numbering years to 2 July 2010:
     * var result = addISOYears(new Date(2010, 6, 2), 5)
     * //=> Fri Jun 26 2015 00:00:00
     */
    addISOYears(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return setISOYear(dirtyDate, getISOYear(dirtyDate) + amount)
    }

    /**
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added
     * @returns {Date} the new date with the milliseconds added
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * var result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */
    addMilliseconds(dirtyDate, dirtyAmount) {
        var timestamp = this.parse(dirtyDate).getTime()
        var amount = Number(dirtyAmount)
        return new Date(timestamp + amount)
    }



    /**
     * @summary Add the specified number of minutes to the given date.
     *
     * @description
     * Add the specified number of minutes to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of minutes to be added
     * @returns {Date} the new date with the minutes added
     *
     * @example
     * // Add 30 minutes to 10 July 2014 12:00:00:
     * var result = addMinutes(new Date(2014, 6, 10, 12, 0), 30)
     * //=> Thu Jul 10 2014 12:30:00
     */
    addMinutes(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addMilliseconds(dirtyDate, amount * MILLISECONDS_IN_MINUTE)
    }

    /**
     * @summary Add the specified number of months to the given date.
     *
     * @description
     * Add the specified number of months to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of months to be added
     * @returns {Date} the new date with the months added
     *
     * @example
     * // Add 5 months to 1 September 2014:
     * var result = addMonths(new Date(2014, 8, 1), 5)
     * //=> Sun Feb 01 2015 00:00:00
     */
    addMonths(dirtyDate, dirtyAmount) {
        var date = this.parse(dirtyDate)
        var amount = Number(dirtyAmount)
        var desiredMonth = date.getMonth() + amount
        var dateWithDesiredMonth = new Date(0)
        dateWithDesiredMonth.setFullYear(date.getFullYear(), desiredMonth, 1)
        dateWithDesiredMonth.setHours(0, 0, 0, 0)
        var daysInMonth = this.getDaysInMonth(dateWithDesiredMonth)
        // Set the last day of the new month
        // if the original date was the last day of the longer month
        date.setMonth(desiredMonth, Math.min(daysInMonth, date.getDate()))
        return date
    }

    /**
     * @summary Add the specified number of year quarters to the given date.
     *
     * @description
     * Add the specified number of year quarters to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of quarters to be added
     * @returns {Date} the new date with the quarters added
     *
     * @example
     * // Add 1 quarter to 1 September 2014:
     * var result = addQuarters(new Date(2014, 8, 1), 1)
     * //=> Mon Dec 01 2014 00:00:00
     */
    addQuarters(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        var months = amount * 3
        return this.addMonths(dirtyDate, months)
    }


    /**
     * @summary Add the specified number of seconds to the given date.
     *
     * @description
     * Add the specified number of seconds to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of seconds to be added
     * @returns {Date} the new date with the seconds added
     *
     * @example
     * // Add 30 seconds to 10 July 2014 12:45:00:
     * var result = addSeconds(new Date(2014, 6, 10, 12, 45, 0), 30)
     * //=> Thu Jul 10 2014 12:45:30
     */
    addSeconds(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addMilliseconds(dirtyDate, amount * 1000)
    }

    /**
     * @summary Add the specified number of weeks to the given date.
     *
     * @description
     * Add the specified number of week to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of weeks to be added
     * @returns {Date} the new date with the weeks added
     *
     * @example
     * // Add 4 weeks to 1 September 2014:
     * var result = addWeeks(new Date(2014, 8, 1), 4)
     * //=> Mon Sep 29 2014 00:00:00
     */
    addWeeks(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        var days = amount * 7
        return this.addDays(dirtyDate, days)
    }

    /**
     * @summary Add the specified number of years to the given date.
     *
     * @description
     * Add the specified number of years to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of years to be added
     * @returns {Date} the new date with the years added
     *
     * @example
     * // Add 5 years to 1 September 2014:
     * var result = addYears(new Date(2014, 8, 1), 5)
     * //=> Sun Sep 01 2019 00:00:00
     */
    addYears(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addMonths(dirtyDate, amount * 12)
    }

    /**
     * @summary Is the given date range overlapping with another date range?
     *
     * @description
     * Is the given date range overlapping with another date range?
     *
     * @param {Date|String|Number} initialRangeStartDate - the start of the initial range
     * @param {Date|String|Number} initialRangeEndDate - the end of the initial range
     * @param {Date|String|Number} comparedRangeStartDate - the start of the range to compare it with
     * @param {Date|String|Number} comparedRangeEndDate - the end of the range to compare it with
     * @returns {Boolean} whether the date ranges are overlapping
     * @throws {Error} startDate of a date range cannot be after its endDate
     *
     * @example
     * // For overlapping date ranges:
     * areRangesOverlapping(
     *   new Date(2014, 0, 10), new Date(2014, 0, 20), new Date(2014, 0, 17), new Date(2014, 0, 21)
     * )
     * //=> true
     *
     * @example
     * // For non-overlapping date ranges:
     * areRangesOverlapping(
     *   new Date(2014, 0, 10), new Date(2014, 0, 20), new Date(2014, 0, 21), new Date(2014, 0, 22)
     * )
     * //=> false
     */
    areRangesOverlapping(dirtyInitialRangeStartDate, dirtyInitialRangeEndDate, dirtyComparedRangeStartDate, dirtyComparedRangeEndDate) {
        var initialStartTime = this.parse(dirtyInitialRangeStartDate).getTime()
        var initialEndTime = this.parse(dirtyInitialRangeEndDate).getTime()
        var comparedStartTime = this.parse(dirtyComparedRangeStartDate).getTime()
        var comparedEndTime = this.parse(dirtyComparedRangeEndDate).getTime()

        if (initialStartTime > initialEndTime || comparedStartTime > comparedEndTime) {
            throw new Error('The start of the range cannot be after the end of the range')
        }

        return initialStartTime < comparedEndTime && comparedStartTime < initialEndTime
    }

    /**
     * @summary Return an index of the closest date from the array comparing to the given date.
     *
     * @description
     * Return an index of the closest date from the array comparing to the given date.
     *
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @param {Date[]|String[]|Number[]} datesArray - the array to search
     * @returns {Number} an index of the date closest to the given date
     * @throws {TypeError} the second argument must be an instance of Array
     *
     * @example
     * // Which date is closer to 6 September 2015?
     * var dateToCompare = new Date(2015, 8, 6)
     * var datesArray = [
     *   new Date(2015, 0, 1),
     *   new Date(2016, 0, 1),
     *   new Date(2017, 0, 1)
     * ]
     * var result = closestIndexTo(dateToCompare, datesArray)
     * //=> 1
     */
    closestIndexTo(dirtyDateToCompare, dirtyDatesArray) {
        if (!(dirtyDatesArray instanceof Array)) {
            throw new TypeError(toString.call(dirtyDatesArray) + ' is not an instance of Array')
        }

        var dateToCompare = this.parse(dirtyDateToCompare)
        var timeToCompare = dateToCompare.getTime()

        var result
        var minDistance

        dirtyDatesArray.forEach(function (dirtyDate, index) {
            var currentDate = this.parse(dirtyDate)
            var distance = Math.abs(timeToCompare - currentDate.getTime())
            if (result === undefined || distance < minDistance) {
                result = index
                minDistance = distance
            }
        })

        return result
    }

    /**
     * @summary Return a date from the array closest to the given date.
     *
     * @description
     * Return a date from the array closest to the given date.
     *
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @param {Date[]|String[]|Number[]} datesArray - the array to search
     * @returns {Date} the date from the array closest to the given date
     * @throws {TypeError} the second argument must be an instance of Array
     *
     * @example
     * // Which date is closer to 6 September 2015: 1 January 2000 or 1 January 2030?
     * var dateToCompare = new Date(2015, 8, 6)
     * var result = closestTo(dateToCompare, [
     *   new Date(2000, 0, 1),
     *   new Date(2030, 0, 1)
     * ])
     * //=> Tue Jan 01 2030 00:00:00
     */
    closestTo(dirtyDateToCompare, dirtyDatesArray) {
        if (!(dirtyDatesArray instanceof Array)) {
            throw new TypeError(toString.call(dirtyDatesArray) + ' is not an instance of Array')
        }

        var dateToCompare = this.parse(dirtyDateToCompare)
        var timeToCompare = dateToCompare.getTime()

        var result
        var minDistance

        dirtyDatesArray.forEach(function (dirtyDate) {
            var currentDate = this.parse(dirtyDate)
            var distance = Math.abs(timeToCompare - currentDate.getTime())
            if (result === undefined || distance < minDistance) {
                result = currentDate
                minDistance = distance
            }
        })

        return result
    }

    /**
     * @summary Compare the two dates and return -1, 0 or 1.
     *
     * @description
     * Compare the two dates and return 1 if the first date is after the second,
     * -1 if the first date is before the second or 0 if dates are equal.
     *
     * @param {Date|String|Number} dateLeft - the first date to compare
     * @param {Date|String|Number} dateRight - the second date to compare
     * @returns {Number} the result of the comparison
     *
     * @example
     * // Compare 11 February 1987 and 10 July 1989:
     * var result = compareAsc(
     *   new Date(1987, 1, 11),
     *   new Date(1989, 6, 10)
     * )
     * //=> -1
     *
     * @example
     * // Sort the array of dates:
     * var result = [
     *   new Date(1995, 6, 2),
     *   new Date(1987, 1, 11),
     *   new Date(1989, 6, 10)
     * ].sort(compareAsc)
     * //=> [
     * //   Wed Feb 11 1987 00:00:00,
     * //   Mon Jul 10 1989 00:00:00,
     * //   Sun Jul 02 1995 00:00:00
     * // ]
     */
    compareAsc(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var timeLeft = dateLeft.getTime()
        var dateRight = this.parse(dirtyDateRight)
        var timeRight = dateRight.getTime()

        if (timeLeft < timeRight) {
            return -1
        } else if (timeLeft > timeRight) {
            return 1
        } else {
            return 0
        }
    }

    /**
     * @summary Compare the two dates reverse chronologically and return -1, 0 or 1.
     *
     * @description
     * Compare the two dates and return -1 if the first date is after the second,
     * 1 if the first date is before the second or 0 if dates are equal.
     *
     * @param {Date|String|Number} dateLeft - the first date to compare
     * @param {Date|String|Number} dateRight - the second date to compare
     * @returns {Number} the result of the comparison
     *
     * @example
     * // Compare 11 February 1987 and 10 July 1989 reverse chronologically:
     * var result = compareDesc(
     *   new Date(1987, 1, 11),
     *   new Date(1989, 6, 10)
     * )
     * //=> 1
     *
     * @example
     * // Sort the array of dates in reverse chronological order:
     * var result = [
     *   new Date(1995, 6, 2),
     *   new Date(1987, 1, 11),
     *   new Date(1989, 6, 10)
     * ].sort(compareDesc)
     * //=> [
     * //   Sun Jul 02 1995 00:00:00,
     * //   Mon Jul 10 1989 00:00:00,
     * //   Wed Feb 11 1987 00:00:00
     * // ]
     */
    compareDesc(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var timeLeft = dateLeft.getTime()
        var dateRight = this.parse(dirtyDateRight)
        var timeRight = dateRight.getTime()

        if (timeLeft > timeRight) {
            return -1
        } else if (timeLeft < timeRight) {
            return 1
        } else {
            return 0
        }
    }




    /**
     * @summary Get the number of calendar days between the given dates.
     *
     * @description
     * Get the number of calendar days between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of calendar days
     *
     * @example
     * // How many calendar days are between
     * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
     * var result = differenceInCalendarDays(
     *   new Date(2012, 6, 2, 0, 0),
     *   new Date(2011, 6, 2, 23, 0)
     * )
     * //=> 366
     */
    differenceInCalendarDays(dirtyDateLeft, dirtyDateRight) {
        var startOfDayLeft = this.startOfDay(dirtyDateLeft)
        var startOfDayRight = this.startOfDay(dirtyDateRight)

        var timestampLeft = startOfDayLeft.getTime() -
            startOfDayLeft.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
        var timestampRight = startOfDayRight.getTime() -
            startOfDayRight.getTimezoneOffset() * MILLISECONDS_IN_MINUTE

        // Round the number of days to the nearest integer
        // because the number of milliseconds in a day is not constant
        // (e.g. it's different in the day of the daylight saving time clock shift)
        return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_DAY)
    }



    /**
     * @summary Get the number of calendar ISO weeks between the given dates.
     *
     * @description
     * Get the number of calendar ISO weeks between the given dates.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of calendar ISO weeks
     *
     * @example
     * // How many calendar ISO weeks are between 6 July 2014 and 21 July 2014?
     * var result = differenceInCalendarISOWeeks(
     *   new Date(2014, 6, 21),
     *   new Date(2014, 6, 6)
     * )
     * //=> 3
     */
    differenceInCalendarISOWeeks(dirtyDateLeft, dirtyDateRight) {
        var startOfISOWeekLeft = this.startOfISOWeek(dirtyDateLeft)
        var startOfISOWeekRight = this.startOfISOWeek(dirtyDateRight)

        var timestampLeft = startOfISOWeekLeft.getTime() -
            startOfISOWeekLeft.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
        var timestampRight = startOfISOWeekRight.getTime() -
            startOfISOWeekRight.getTimezoneOffset() * MILLISECONDS_IN_MINUTE

        // Round the number of days to the nearest integer
        // because the number of milliseconds in a week is not constant
        // (e.g. it's different in the week of the daylight saving time clock shift)
        return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_WEEK)
    }

    /**
     * @summary Get the number of calendar ISO week-numbering years between the given dates.
     *
     * @description
     * Get the number of calendar ISO week-numbering years between the given dates.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of calendar ISO week-numbering years
     *
     * @example
     * // How many calendar ISO week-numbering years are 1 January 2010 and 1 January 2012?
     * var result = differenceInCalendarISOYears(
     *   new Date(2012, 0, 1),
     *   new Date(2010, 0, 1)
     * )
     * //=> 2
     */
    differenceInCalendarISOYears(dirtyDateLeft, dirtyDateRight) {
        return this.getISOYear(dirtyDateLeft) - this.getISOYear(dirtyDateRight)
    }


    /**
     * @summary Get the number of calendar months between the given dates.
     *
     * @description
     * Get the number of calendar months between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of calendar months
     *
     * @example
     * // How many calendar months are between 31 January 2014 and 1 September 2014?
     * var result = differenceInCalendarMonths(
     *   new Date(2014, 8, 1),
     *   new Date(2014, 0, 31)
     * )
     * //=> 8
     */
    differenceInCalendarMonths(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)

        var yearDiff = dateLeft.getFullYear() - dateRight.getFullYear()
        var monthDiff = dateLeft.getMonth() - dateRight.getMonth()

        return yearDiff * 12 + monthDiff
    }

    /**
     * @summary Get the number of calendar quarters between the given dates.
     *
     * @description
     * Get the number of calendar quarters between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of calendar quarters
     *
     * @example
     * // How many calendar quarters are between 31 December 2013 and 2 July 2014?
     * var result = differenceInCalendarQuarters(
     *   new Date(2014, 6, 2),
     *   new Date(2013, 11, 31)
     * )
     * //=> 3
     */
    differenceInCalendarQuarters(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)

        var yearDiff = dateLeft.getFullYear() - dateRight.getFullYear()
        var quarterDiff = this.getQuarter(dateLeft) - this.getQuarter(dateRight)

        return yearDiff * 4 + quarterDiff
    }



    /**
     * @summary Get the number of calendar weeks between the given dates.
     *
     * @description
     * Get the number of calendar weeks between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Number} the number of calendar weeks
     *
     * @example
     * // How many calendar weeks are between 5 July 2014 and 20 July 2014?
     * var result = differenceInCalendarWeeks(
     *   new Date(2014, 6, 20),
     *   new Date(2014, 6, 5)
     * )
     * //=> 3
     *
     * @example
     * // If the week starts on Monday,
     * // how many calendar weeks are between 5 July 2014 and 20 July 2014?
     * var result = differenceInCalendarWeeks(
     *   new Date(2014, 6, 20),
     *   new Date(2014, 6, 5),
     *   {weekStartsOn: 1}
     * )
     * //=> 2
     */
    differenceInCalendarWeeks(dirtyDateLeft, dirtyDateRight, dirtyOptions) {
        var startOfWeekLeft = this.startOfWeek(dirtyDateLeft, dirtyOptions)
        var startOfWeekRight = this.startOfWeek(dirtyDateRight, dirtyOptions)

        var timestampLeft = startOfWeekLeft.getTime() -
            startOfWeekLeft.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
        var timestampRight = startOfWeekRight.getTime() -
            startOfWeekRight.getTimezoneOffset() * MILLISECONDS_IN_MINUTE

        // Round the number of days to the nearest integer
        // because the number of milliseconds in a week is not constant
        // (e.g. it's different in the week of the daylight saving time clock shift)
        return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_WEEK)
    }


    /**
     * @summary Get the number of calendar years between the given dates.
     *
     * @description
     * Get the number of calendar years between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of calendar years
     *
     * @example
     * // How many calendar years are between 31 December 2013 and 11 February 2015?
     * var result = differenceInCalendarYears(
     *   new Date(2015, 1, 11),
     *   new Date(2013, 11, 31)
     * )
     * //=> 2
     */
    differenceInCalendarYears(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)

        return dateLeft.getFullYear() - dateRight.getFullYear()
    }

    /**
     * @summary Get the number of full days between the given dates.
     *
     * @description
     * Get the number of full days between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of full days
     *
     * @example
     * // How many full days are between
     * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
     * var result = differenceInDays(
     *   new Date(2012, 6, 2, 0, 0),
     *   new Date(2011, 6, 2, 23, 0)
     * )
     * //=> 365
     */
    differenceInDays(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)

        var sign = this.compareAsc(dateLeft, dateRight)
        var difference = Math.abs(this.differenceInCalendarDays(dateLeft, dateRight))
        dateLeft.setDate(dateLeft.getDate() - sign * difference)

        // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
        // If so, result must be decreased by 1 in absolute value
        var isLastDayNotFull = this.compareAsc(dateLeft, dateRight) === -sign
        return sign * (difference - isLastDayNotFull)
    }



    /**
     * @summary Get the number of hours between the given dates.
     *
     * @description
     * Get the number of hours between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of hours
     *
     * @example
     * // How many hours are between 2 July 2014 06:50:00 and 2 July 2014 19:00:00?
     * var result = differenceInHours(
     *   new Date(2014, 6, 2, 19, 0),
     *   new Date(2014, 6, 2, 6, 50)
     * )
     * //=> 12
     */
    differenceInHours(dirtyDateLeft, dirtyDateRight) {
        var diff = this.differenceInMilliseconds(dirtyDateLeft, dirtyDateRight) / MILLISECONDS_IN_HOUR
        return diff > 0 ? Math.floor(diff) : Math.ceil(diff)
    }

    /**
     * @summary Get the number of full ISO week-numbering years between the given dates.
     *
     * @description
     * Get the number of full ISO week-numbering years between the given dates.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of full ISO week-numbering years
     *
     * @example
     * // How many full ISO week-numbering years are between 1 January 2010 and 1 January 2012?
     * var result = differenceInISOYears(
     *   new Date(2012, 0, 1),
     *   new Date(2010, 0, 1)
     * )
     * //=> 1
     */
    differenceInISOYears(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)

        var sign = this.compareAsc(dateLeft, dateRight)
        var difference = Math.abs(this.differenceInCalendarISOYears(dateLeft, dateRight))
        dateLeft = this.subISOYears(dateLeft, sign * difference)

        // Math.abs(diff in full ISO years - diff in calendar ISO years) === 1
        // if last calendar ISO year is not full
        // If so, result must be decreased by 1 in absolute value
        var isLastISOYearNotFull = this.compareAsc(dateLeft, dateRight) === -sign
        return sign * (difference - isLastISOYearNotFull)
    }

    /**
     * @summary Get the number of milliseconds between the given dates.
     *
     * @description
     * Get the number of milliseconds between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of milliseconds
     *
     * @example
     * // How many milliseconds are between
     * // 2 July 2014 12:30:20.600 and 2 July 2014 12:30:21.700?
     * var result = differenceInMilliseconds(
     *   new Date(2014, 6, 2, 12, 30, 21, 700),
     *   new Date(2014, 6, 2, 12, 30, 20, 600)
     * )
     * //=> 1100
     */
    differenceInMilliseconds(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)
        return dateLeft.getTime() - dateRight.getTime()
    }




    /**
     * @summary Get the number of minutes between the given dates.
     *
     * @description
     * Get the number of minutes between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of minutes
     *
     * @example
     * // How many minutes are between 2 July 2014 12:07:59 and 2 July 2014 12:20:00?
     * var result = differenceInMinutes(
     *   new Date(2014, 6, 2, 12, 20, 0),
     *   new Date(2014, 6, 2, 12, 7, 59)
     * )
     * //=> 12
     */
    differenceInMinutes(dirtyDateLeft, dirtyDateRight) {
        var diff = this.differenceInMilliseconds(dirtyDateLeft, dirtyDateRight) / MILLISECONDS_IN_MINUTE
        return diff > 0 ? Math.floor(diff) : Math.ceil(diff)
    }


    /**
     * @summary Get the number of full months between the given dates.
     *
     * @description
     * Get the number of full months between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of full months
     *
     * @example
     * // How many full months are between 31 January 2014 and 1 September 2014?
     * var result = differenceInMonths(
     *   new Date(2014, 8, 1),
     *   new Date(2014, 0, 31)
     * )
     * //=> 7
     */
    differenceInMonths(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)

        var sign = this.compareAsc(dateLeft, dateRight)
        var difference = Math.abs(this.differenceInCalendarMonths(dateLeft, dateRight))
        dateLeft.setMonth(dateLeft.getMonth() - sign * difference)

        // Math.abs(diff in full months - diff in calendar months) === 1 if last calendar month is not full
        // If so, result must be decreased by 1 in absolute value
        var isLastMonthNotFull = this.compareAsc(dateLeft, dateRight) === -sign
        return sign * (difference - isLastMonthNotFull)
    }


    /**
     * @summary Get the number of full quarters between the given dates.
     *
     * @description
     * Get the number of full quarters between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of full quarters
     *
     * @example
     * // How many full quarters are between 31 December 2013 and 2 July 2014?
     * var result = differenceInQuarters(
     *   new Date(2014, 6, 2),
     *   new Date(2013, 11, 31)
     * )
     * //=> 2
     */
    differenceInQuarters(dirtyDateLeft, dirtyDateRight) {
        var diff = this.differenceInMonths(dirtyDateLeft, dirtyDateRight) / 3
        return diff > 0 ? Math.floor(diff) : Math.ceil(diff)
    }

    /**
     * @summary Get the number of seconds between the given dates.
     *
     * @description
     * Get the number of seconds between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of seconds
     *
     * @example
     * // How many seconds are between
     * // 2 July 2014 12:30:07.999 and 2 July 2014 12:30:20.000?
     * var result = differenceInSeconds(
     *   new Date(2014, 6, 2, 12, 30, 20, 0),
     *   new Date(2014, 6, 2, 12, 30, 7, 999)
     * )
     * //=> 12
     */
    differenceInSeconds(dirtyDateLeft, dirtyDateRight) {
        var diff = this.differenceInMilliseconds(dirtyDateLeft, dirtyDateRight) / 1000
        return diff > 0 ? Math.floor(diff) : Math.ceil(diff)
    }

    /**
     * @summary Get the number of full weeks between the given dates.
     *
     * @description
     * Get the number of full weeks between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of full weeks
     *
     * @example
     * // How many full weeks are between 5 July 2014 and 20 July 2014?
     * var result = differenceInWeeks(
     *   new Date(2014, 6, 20),
     *   new Date(2014, 6, 5)
     * )
     * //=> 2
     */
    differenceInWeeks(dirtyDateLeft, dirtyDateRight) {
        var diff = this.differenceInDays(dirtyDateLeft, dirtyDateRight) / 7
        return diff > 0 ? Math.floor(diff) : Math.ceil(diff)
    }

    /**
     * @summary Get the number of full years between the given dates.
     *
     * @description
     * Get the number of full years between the given dates.
     *
     * @param {Date|String|Number} dateLeft - the later date
     * @param {Date|String|Number} dateRight - the earlier date
     * @returns {Number} the number of full years
     *
     * @example
     * // How many full years are between 31 December 2013 and 11 February 2015?
     * var result = differenceInYears(
     *   new Date(2015, 1, 11),
     *   new Date(2013, 11, 31)
     * )
     * //=> 1
     */
    differenceInYears(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)

        var sign = this.compareAsc(dateLeft, dateRight)
        var difference = Math.abs(this.differenceInCalendarYears(dateLeft, dateRight))
        dateLeft.setFullYear(dateLeft.getFullYear() - sign * difference)

        // Math.abs(diff in full years - diff in calendar years) === 1 if last calendar year is not full
        // If so, result must be decreased by 1 in absolute value
        var isLastYearNotFull = this.compareAsc(dateLeft, dateRight) === -sign
        return sign * (difference - isLastYearNotFull)
    }




    /**
     * @summary Return the distance between the given dates in words.
     *
     * @description
     * Return the distance between the given dates in words.
     *
     * | Distance between dates                                            | Result              |
     * |-------------------------------------------------------------------|---------------------|
     * | 0 ... 30 secs                                                     | less than a minute  |
     * | 30 secs ... 1 min 30 secs                                         | 1 minute            |
     * | 1 min 30 secs ... 44 mins 30 secs                                 | [2..44] minutes     |
     * | 44 mins ... 30 secs ... 89 mins 30 secs                           | about 1 hour        |
     * | 89 mins 30 secs ... 23 hrs 59 mins 30 secs                        | about [2..24] hours |
     * | 23 hrs 59 mins 30 secs ... 41 hrs 59 mins 30 secs                 | 1 day               |
     * | 41 hrs 59 mins 30 secs ... 29 days 23 hrs 59 mins 30 secs         | [2..30] days        |
     * | 29 days 23 hrs 59 mins 30 secs ... 44 days 23 hrs 59 mins 30 secs | about 1 month       |
     * | 44 days 23 hrs 59 mins 30 secs ... 59 days 23 hrs 59 mins 30 secs | about 2 months      |
     * | 59 days 23 hrs 59 mins 30 secs ... 1 yr                           | [2..12] months      |
     * | 1 yr ... 1 yr 3 months                                            | about 1 year        |
     * | 1 yr 3 months ... 1 yr 9 month s                                  | over 1 year         |
     * | 1 yr 9 months ... 2 yrs                                           | almost 2 years      |
     * | N yrs ... N yrs 3 months                                          | about N years       |
     * | N yrs 3 months ... N yrs 9 months                                 | over N years        |
     * | N yrs 9 months ... N+1 yrs                                        | almost N+1 years    |
     *
     * With `options.includeSeconds == true`:
     * | Distance between dates | Result               |
     * |------------------------|----------------------|
     * | 0 secs ... 5 secs      | less than 5 seconds  |
     * | 5 secs ... 10 secs     | less than 10 seconds |
     * | 10 secs ... 20 secs    | less than 20 seconds |
     * | 20 secs ... 40 secs    | half a minute        |
     * | 40 secs ... 60 secs    | less than a minute   |
     * | 60 secs ... 90 secs    | 1 minute             |
     *
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @param {Date|String|Number} date - the other date
     * @param {Object} [options] - the object with options
     * @param {Boolean} [options.includeSeconds=false] - distances less than a minute are more detailed
     * @param {Boolean} [options.addSuffix=false] - result indicates if the second date is earlier or later than the first
     * @param {Object} [options.locale=enLocale] - the locale object
     * @returns {String} the distance in words
     *
     * @example
     * // What is the distance between 2 July 2014 and 1 January 2015?
     * var result = distanceInWords(
     *   new Date(2014, 6, 2),
     *   new Date(2015, 0, 1)
     * )
     * //=> '6 months'
     *
     * @example
     * // What is the distance between 1 January 2015 00:00:15
     * // and 1 January 2015 00:00:00, including seconds?
     * var result = distanceInWords(
     *   new Date(2015, 0, 1, 0, 0, 15),
     *   new Date(2015, 0, 1, 0, 0, 0),
     *   {includeSeconds: true}
     * )
     * //=> 'less than 20 seconds'
     *
     * @example
     * // What is the distance from 1 January 2016
     * // to 1 January 2015, with a suffix?
     * var result = distanceInWords(
     *   new Date(2016, 0, 1),
     *   new Date(2015, 0, 1),
     *   {addSuffix: true}
     * )
     * //=> 'about 1 year ago'
     *
     * @example
     * // What is the distance between 1 August 2016 and 1 January 2015 in Esperanto?
     * var eoLocale = require('date-fns/locale/eo')
     * var result = distanceInWords(
     *   new Date(2016, 7, 1),
     *   new Date(2015, 0, 1),
     *   {locale: eoLocale}
     * )
     * //=> 'pli ol 1 jaro'
     */
    distanceInWords(dirtyDateToCompare, dirtyDate, dirtyOptions) {
        var options = dirtyOptions || {}

        var comparison = this.compareDesc(dirtyDateToCompare, dirtyDate)

        var locale = options.locale
        var localize = this.buildDistanceInWordsLocale().localize
        if (locale && locale.distanceInWords && locale.distanceInWords.localize) {
            localize = locale.distanceInWords.localize
        }

        var localizeOptions = {
            addSuffix: Boolean(options.addSuffix),
            comparison: comparison
        }

        var dateLeft, dateRight
        if (comparison > 0) {
            dateLeft = this.parse(dirtyDateToCompare)
            dateRight = this.parse(dirtyDate)
        } else {
            dateLeft = this.parse(dirtyDate)
            dateRight = this.parse(dirtyDateToCompare)
        }

        var seconds = this.differenceInSeconds(dateRight, dateLeft)
        var offset = dateRight.getTimezoneOffset() - dateLeft.getTimezoneOffset()
        var minutes = Math.round(seconds / 60) - offset
        var months

        // 0 up to 2 mins
        if (minutes < 2) {
            if (options.includeSeconds) {
                if (seconds < 5) {
                    return this.localize('lessThanXSeconds', 5, localizeOptions)
                } else if (seconds < 10) {
                    return this.localize('lessThanXSeconds', 10, localizeOptions)
                } else if (seconds < 20) {
                    return this.localize('lessThanXSeconds', 20, localizeOptions)
                } else if (seconds < 40) {
                    return this.localize('halfAMinute', null, localizeOptions)
                } else if (seconds < 60) {
                    return this.localize('lessThanXMinutes', 1, localizeOptions)
                } else {
                    return this.localize('xMinutes', 1, localizeOptions)
                }
            } else {
                if (minutes === 0) {
                    return this.localize('lessThanXMinutes', 1, localizeOptions)
                } else {
                    return this.localize('xMinutes', minutes, localizeOptions)
                }
            }

            // 2 mins up to 0.75 hrs
        } else if (minutes < 45) {
            return this.localize('xMinutes', minutes, localizeOptions)

            // 0.75 hrs up to 1.5 hrs
        } else if (minutes < 90) {
            return this.localize('aboutXHours', 1, localizeOptions)

            // 1.5 hrs up to 24 hrs
        } else if (minutes < MINUTES_IN_DAY) {
            var hours = Math.round(minutes / 60)
            return this.localize('aboutXHours', hours, localizeOptions)

            // 1 day up to 1.75 days
        } else if (minutes < MINUTES_IN_ALMOST_TWO_DAYS) {
            return this.localize('xDays', 1, localizeOptions)

            // 1.75 days up to 30 days
        } else if (minutes < MINUTES_IN_MONTH) {
            var days = Math.round(minutes / MINUTES_IN_DAY)
            return this.localize('xDays', days, localizeOptions)

            // 1 month up to 2 months
        } else if (minutes < MINUTES_IN_TWO_MONTHS) {
            months = Math.round(minutes / MINUTES_IN_MONTH)
            return this.localize('aboutXMonths', months, localizeOptions)
        }

        months = this.differenceInMonths(dateRight, dateLeft)

        // 2 months up to 12 months
        if (months < 12) {
            var nearestMonth = Math.round(minutes / MINUTES_IN_MONTH)
            return this.localize('xMonths', nearestMonth, localizeOptions)

            // 1 year up to max Date
        } else {
            var monthsSinceStartOfYear = months % 12
            var years = Math.floor(months / 12)

            // N years up to 1 years 3 months
            if (monthsSinceStartOfYear < 3) {
                return this.localize('aboutXYears', years, localizeOptions)

                // N years 3 months up to N years 9 months
            } else if (monthsSinceStartOfYear < 9) {
                return this.localize('overXYears', years, localizeOptions)

                // N years 9 months up to N year 12 months
            } else {
                return this.localize('almostXYears', years + 1, localizeOptions)
            }
        }
    }



    /**
     * @summary Return the distance between the given dates in words.
     *
     * @description
     * Return the distance between the given dates in words, using strict units.
     * This is like `distanceInWords`, but does not use helpers like 'almost', 'over',
     * 'less than' and the like.
     *
     * | Distance between dates | Result              |
     * |------------------------|---------------------|
     * | 0 ... 59 secs          | [0..59] seconds     |
     * | 1 ... 59 mins          | [1..59] minutes     |
     * | 1 ... 23 hrs           | [1..23] hours       |
     * | 1 ... 29 days          | [1..29] days        |
     * | 1 ... 11 months        | [1..11] months      |
     * | 1 ... N years          | [1..N]  years       |
     *
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @param {Date|String|Number} date - the other date
     * @param {Object} [options] - the object with options
     * @param {Boolean} [options.addSuffix=false] - result indicates if the second date is earlier or later than the first
     * @param {'s'|'m'|'h'|'d'|'M'|'Y'} [options.unit] - if specified, will force a unit
     * @param {'floor'|'ceil'|'round'} [options.partialMethod='floor'] - which way to round partial units
     * @param {Object} [options.locale=enLocale] - the locale object
     * @returns {String} the distance in words
     *
     * @example
     * // What is the distance between 2 July 2014 and 1 January 2015?
     * var result = distanceInWordsStrict(
     *   new Date(2014, 6, 2),
     *   new Date(2015, 0, 2)
     * )
     * //=> '6 months'
     *
     * @example
     * // What is the distance between 1 January 2015 00:00:15
     * // and 1 January 2015 00:00:00?
     * var result = distanceInWordsStrict(
     *   new Date(2015, 0, 1, 0, 0, 15),
     *   new Date(2015, 0, 1, 0, 0, 0),
     * )
     * //=> '15 seconds'
     *
     * @example
     * // What is the distance from 1 January 2016
     * // to 1 January 2015, with a suffix?
     * var result = distanceInWordsStrict(
     *   new Date(2016, 0, 1),
     *   new Date(2015, 0, 1),
     *   {addSuffix: true}
     * )
     * //=> '1 year ago'
     *
     * @example
     * // What is the distance from 1 January 2016
     * // to 1 January 2015, in minutes?
     * var result = distanceInWordsStrict(
     *   new Date(2016, 0, 1),
     *   new Date(2015, 0, 1),
     *   {unit: 'm'}
     * )
     * //=> '525600 minutes'
     *
     * @example
     * // What is the distance from 1 January 2016
     * // to 28 January 2015, in months, rounded up?
     * var result = distanceInWordsStrict(
     *   new Date(2015, 0, 28),
     *   new Date(2015, 0, 1),
     *   {unit: 'M', partialMethod: 'ceil'}
     * )
     * //=> '1 month'
     *
     * @example
     * // What is the distance between 1 August 2016 and 1 January 2015 in Esperanto?
     * var eoLocale = require('date-fns/locale/eo')
     * var result = distanceInWordsStrict(
     *   new Date(2016, 7, 1),
     *   new Date(2015, 0, 1),
     *   {locale: eoLocale}
     * )
     * //=> '1 jaro'
     */
    distanceInWordsStrict(dirtyDateToCompare, dirtyDate, dirtyOptions) {
        var options = dirtyOptions || {}

        var comparison = this.compareDesc(dirtyDateToCompare, dirtyDate)

        var locale = options.locale
        var localize = this.buildDistanceInWordsLocale().localize
        if (locale && locale.distanceInWords && locale.distanceInWords.localize) {
            localize = locale.distanceInWords.localize
        }

        var localizeOptions = {
            addSuffix: Boolean(options.addSuffix),
            comparison: comparison
        }

        var dateLeft, dateRight
        if (comparison > 0) {
            dateLeft = this.parse(dirtyDateToCompare)
            dateRight = this.parse(dirtyDate)
        } else {
            dateLeft = this.parse(dirtyDate)
            dateRight = this.parse(dirtyDateToCompare)
        }

        var unit
        var mathPartial = Math[options.partialMethod ? String(options.partialMethod) : 'floor']
        var seconds = this.differenceInSeconds(dateRight, dateLeft)
        var offset = dateRight.getTimezoneOffset() - dateLeft.getTimezoneOffset()
        var minutes = this.mathPartial(seconds / 60) - offset
        var hours, days, months, years

        if (options.unit) {
            unit = String(options.unit)
        } else {
            if (minutes < 1) {
                unit = 's'
            } else if (minutes < 60) {
                unit = 'm'
            } else if (minutes < MINUTES_IN_DAY) {
                unit = 'h'
            } else if (minutes < MINUTES_IN_MONTH) {
                unit = 'd'
            } else if (minutes < MINUTES_IN_YEAR) {
                unit = 'M'
            } else {
                unit = 'Y'
            }
        }

        // 0 up to 60 seconds
        if (unit === 's') {
            return this.localize('xSeconds', seconds, localizeOptions)

            // 1 up to 60 mins
        } else if (unit === 'm') {
            return this.localize('xMinutes', minutes, localizeOptions)

            // 1 up to 24 hours
        } else if (unit === 'h') {
            hours = this.mathPartial(minutes / 60)
            return this.localize('xHours', hours, localizeOptions)

            // 1 up to 30 days
        } else if (unit === 'd') {
            days = this.mathPartial(minutes / MINUTES_IN_DAY)
            return this.localize('xDays', days, localizeOptions)

            // 1 up to 12 months
        } else if (unit === 'M') {
            months = this.mathPartial(minutes / MINUTES_IN_MONTH)
            return this.localize('xMonths', months, localizeOptions)

            // 1 year up to max Date
        } else if (unit === 'Y') {
            years = this.mathPartial(minutes / MINUTES_IN_YEAR)
            return this.localize('xYears', years, localizeOptions)
        }

        throw new Error('Unknown unit: ' + unit)
    }



    /**
     * @summary Return the distance between the given date and now in words.
     *
     * @description
     * Return the distance between the given date and now in words.
     *
     * | Distance to now                                                   | Result              |
     * |-------------------------------------------------------------------|---------------------|
     * | 0 ... 30 secs                                                     | less than a minute  |
     * | 30 secs ... 1 min 30 secs                                         | 1 minute            |
     * | 1 min 30 secs ... 44 mins 30 secs                                 | [2..44] minutes     |
     * | 44 mins ... 30 secs ... 89 mins 30 secs                           | about 1 hour        |
     * | 89 mins 30 secs ... 23 hrs 59 mins 30 secs                        | about [2..24] hours |
     * | 23 hrs 59 mins 30 secs ... 41 hrs 59 mins 30 secs                 | 1 day               |
     * | 41 hrs 59 mins 30 secs ... 29 days 23 hrs 59 mins 30 secs         | [2..30] days        |
     * | 29 days 23 hrs 59 mins 30 secs ... 44 days 23 hrs 59 mins 30 secs | about 1 month       |
     * | 44 days 23 hrs 59 mins 30 secs ... 59 days 23 hrs 59 mins 30 secs | about 2 months      |
     * | 59 days 23 hrs 59 mins 30 secs ... 1 yr                           | [2..12] months      |
     * | 1 yr ... 1 yr 3 months                                            | about 1 year        |
     * | 1 yr 3 months ... 1 yr 9 month s                                  | over 1 year         |
     * | 1 yr 9 months ... 2 yrs                                           | almost 2 years      |
     * | N yrs ... N yrs 3 months                                          | about N years       |
     * | N yrs 3 months ... N yrs 9 months                                 | over N years        |
     * | N yrs 9 months ... N+1 yrs                                        | almost N+1 years    |
     *
     * With `options.includeSeconds == true`:
     * | Distance to now     | Result               |
     * |---------------------|----------------------|
     * | 0 secs ... 5 secs   | less than 5 seconds  |
     * | 5 secs ... 10 secs  | less than 10 seconds |
     * | 10 secs ... 20 secs | less than 20 seconds |
     * | 20 secs ... 40 secs | half a minute        |
     * | 40 secs ... 60 secs | less than a minute   |
     * | 60 secs ... 90 secs | 1 minute             |
     *
     * @param {Date|String|Number} date - the given date
     * @param {Object} [options] - the object with options
     * @param {Boolean} [options.includeSeconds=false] - distances less than a minute are more detailed
     * @param {Boolean} [options.addSuffix=false] - result specifies if the second date is earlier or later than the first
     * @param {Object} [options.locale=enLocale] - the locale object
     * @returns {String} the distance in words
     *
     * @example
     * // If today is 1 January 2015, what is the distance to 2 July 2014?
     * var result = distanceInWordsToNow(
     *   new Date(2014, 6, 2)
     * )
     * //=> '6 months'
     *
     * @example
     * // If now is 1 January 2015 00:00:00,
     * // what is the distance to 1 January 2015 00:00:15, including seconds?
     * var result = distanceInWordsToNow(
     *   new Date(2015, 0, 1, 0, 0, 15),
     *   {includeSeconds: true}
     * )
     * //=> 'less than 20 seconds'
     *
     * @example
     * // If today is 1 January 2015,
     * // what is the distance to 1 January 2016, with a suffix?
     * var result = distanceInWordsToNow(
     *   new Date(2016, 0, 1),
     *   {addSuffix: true}
     * )
     * //=> 'in about 1 year'
     *
     * @example
     * // If today is 1 January 2015,
     * // what is the distance to 1 August 2016 in Esperanto?
     * var eoLocale = require('date-fns/locale/eo')
     * var result = distanceInWordsToNow(
     *   new Date(2016, 7, 1),
     *   {locale: eoLocale}
     * )
     * //=> 'pli ol 1 jaro'
     */
    distanceInWordsToNow(dirtyDate, dirtyOptions) {
        return this.distanceInWords(Date.now(), dirtyDate, dirtyOptions)
    }


    /**
     * @summary Return the array of dates within the specified range.
     *
     * @description
     * Return the array of dates within the specified range.
     *
     * @param {Date|String|Number} startDate - the first date
     * @param {Date|String|Number} endDate - the last date
     * @returns {Date[]} the array with starts of days from the day of startDate to the day of endDate
     * @throws {Error} startDate cannot be after endDate
     *
     * @example
     * // Each day between 6 October 2014 and 10 October 2014:
     * var result = eachDay(
     *   new Date(2014, 9, 6),
     *   new Date(2014, 9, 10)
     * )
     * //=> [
     * //   Mon Oct 06 2014 00:00:00,
     * //   Tue Oct 07 2014 00:00:00,
     * //   Wed Oct 08 2014 00:00:00,
     * //   Thu Oct 09 2014 00:00:00,
     * //   Fri Oct 10 2014 00:00:00
     * // ]
     */
    eachDay(dirtyStartDate, dirtyEndDate) {
        var startDate = this.parse(dirtyStartDate)
        var endDate = this.parse(dirtyEndDate)

        var endTime = endDate.getTime()

        if (startDate.getTime() > endTime) {
            throw new Error('The first date cannot be after the second date')
        }

        var dates = []

        var currentDate = startDate
        currentDate.setHours(0, 0, 0, 0)

        while (currentDate.getTime() <= endTime) {
            dates.push(parse(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return dates
    }


    /**
     * @summary Return the end of a day for the given date.
     *
     * @description
     * Return the end of a day for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of a day
     *
     * @example
     * // The end of a day for 2 September 2014 11:55:00:
     * var result = endOfDay(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 02 2014 23:59:59.999
     */
    endOfDay(dirtyDate) {
        var date = this.parse(dirtyDate)
        date.setHours(23, 59, 59, 999)
        return date
    }


    /**
     * @summary Return the end of an hour for the given date.
     *
     * @description
     * Return the end of an hour for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of an hour
     *
     * @example
     * // The end of an hour for 2 September 2014 11:55:00:
     * var result = endOfHour(new Date(2014, 8, 2, 11, 55))
     * //=> Tue Sep 02 2014 11:59:59.999
     */
    endOfHour(dirtyDate) {
        var date = this.parse(dirtyDate)
        date.setMinutes(59, 59, 999)
        return date
    }

    /**
     * @summary Return the end of an ISO week for the given date.
     *
     * @description
     * Return the end of an ISO week for the given date.
     * The result will be in the local timezone.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of an ISO week
     *
     * @example
     * // The end of an ISO week for 2 September 2014 11:55:00:
     * var result = endOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Sun Sep 07 2014 23:59:59.999
     */
    endOfISOWeek(dirtyDate) {
        return this.endOfWeek(dirtyDate, { weekStartsOn: 1 })
    }


    /**
     * @summary Return the end of an ISO week-numbering year for the given date.
     *
     * @description
     * Return the end of an ISO week-numbering year,
     * which always starts 3 days before the year's first Thursday.
     * The result will be in the local timezone.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of an ISO week-numbering year
     *
     * @example
     * // The end of an ISO week-numbering year for 2 July 2005:
     * var result = endOfISOYear(new Date(2005, 6, 2))
     * //=> Sun Jan 01 2006 23:59:59.999
     */
    endOfISOYear(dirtyDate) {
        var year = this.getISOYear(dirtyDate)
        var fourthOfJanuaryOfNextYear = new Date(0)
        fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4)
        fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0)
        var date = this.startOfISOWeek(fourthOfJanuaryOfNextYear)
        date.setMilliseconds(date.getMilliseconds() - 1)
        return date
    }

    /**
     * @summary Return the end of a minute for the given date.
     *
     * @description
     * Return the end of a minute for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of a minute
     *
     * @example
     * // The end of a minute for 1 December 2014 22:15:45.400:
     * var result = endOfMinute(new Date(2014, 11, 1, 22, 15, 45, 400))
     * //=> Mon Dec 01 2014 22:15:59.999
     */
    endOfMinute(dirtyDate) {
        var date = this.parse(dirtyDate)
        date.setSeconds(59, 999)
        return date
    }


    /**
     * @summary Return the end of a month for the given date.
     *
     * @description
     * Return the end of a month for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of a month
     *
     * @example
     * // The end of a month for 2 September 2014 11:55:00:
     * var result = endOfMonth(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 30 2014 23:59:59.999
     */
    endOfMonth(dirtyDate) {
        var date = this.parse(dirtyDate)
        var month = date.getMonth()
        date.setFullYear(date.getFullYear(), month + 1, 0)
        date.setHours(23, 59, 59, 999)
        return date
    }


    /**
     * @summary Return the end of a year quarter for the given date.
     *
     * @description
     * Return the end of a year quarter for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of a quarter
     *
     * @example
     * // The end of a quarter for 2 September 2014 11:55:00:
     * var result = endOfQuarter(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 30 2014 23:59:59.999
     */
    endOfQuarter(dirtyDate) {
        var date = this.parse(dirtyDate)
        var currentMonth = date.getMonth()
        var month = currentMonth - currentMonth % 3 + 3
        date.setMonth(month, 0)
        date.setHours(23, 59, 59, 999)
        return date
    }


    /**
     * @summary Return the end of a second for the given date.
     *
     * @description
     * Return the end of a second for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of a second
     *
     * @example
     * // The end of a second for 1 December 2014 22:15:45.400:
     * var result = endOfSecond(new Date(2014, 11, 1, 22, 15, 45, 400))
     * //=> Mon Dec 01 2014 22:15:45.999
     */
    endOfSecond(dirtyDate) {
        var date = this.parse(dirtyDate)
        date.setMilliseconds(999)
        return date
    }



    /**
     * @summary Return the end of today.
     *
     * @description
     * Return the end of today.
     *
     * @returns {Date} the end of today
     *
     * @example
     * // If today is 6 October 2014:
     * var result = endOfToday()
     * //=> Mon Oct 6 2014 23:59:59.999
     */
    endOfToday() {
        return this.endOfDay(new Date())
    }


    /**
     * @summary Return the end of tomorrow.
     *
     * @description
     * Return the end of tomorrow.
     *
     * @returns {Date} the end of tomorrow
     *
     * @example
     * // If today is 6 October 2014:
     * var result = endOfTomorrow()
     * //=> Tue Oct 7 2014 23:59:59.999
     */
    endOfTomorrow() {
        var now = new Date()
        var year = now.getFullYear()
        var month = now.getMonth()
        var day = now.getDate()

        var date = new Date(0)
        date.setFullYear(year, month, day + 1)
        date.setHours(23, 59, 59, 999)
        return date
    }

    /**
     * @summary Return the end of a week for the given date.
     *
     * @description
     * Return the end of a week for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Date} the end of a week
     *
     * @example
     * // The end of a week for 2 September 2014 11:55:00:
     * var result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Sat Sep 06 2014 23:59:59.999
     *
     * @example
     * // If the week starts on Monday, the end of the week for 2 September 2014 11:55:00:
     * var result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0), {weekStartsOn: 1})
     * //=> Sun Sep 07 2014 23:59:59.999
     */
    endOfWeek(dirtyDate, dirtyOptions) {
        var weekStartsOn = dirtyOptions ? (Number(dirtyOptions.weekStartsOn) || 0) : 0

        var date = this.parse(dirtyDate)
        var day = date.getDay()
        var diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn)

        date.setDate(date.getDate() + diff)
        date.setHours(23, 59, 59, 999)
        return date
    }

    /**
     * @summary Return the end of a year for the given date.
     *
     * @description
     * Return the end of a year for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of a year
     *
     * @example
     * // The end of a year for 2 September 2014 11:55:00:
     * var result = endOfYear(new Date(2014, 8, 2, 11, 55, 00))
     * //=> Wed Dec 31 2014 23:59:59.999
     */
    endOfYear(dirtyDate) {
        var date = this.parse(dirtyDate)
        var year = date.getFullYear()
        date.setFullYear(year + 1, 0, 0)
        date.setHours(23, 59, 59, 999)
        return date
    }



    /**
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format.
     *
     * Accepted tokens:
     * | Unit                    | Token | Result examples                  |
     * |-------------------------|-------|----------------------------------|
     * | Month                   | M     | 1, 2, ..., 12                    |
     * |                         | Mo    | 1st, 2nd, ..., 12th              |
     * |                         | MM    | 01, 02, ..., 12                  |
     * |                         | MMM   | Jan, Feb, ..., Dec               |
     * |                         | MMMM  | January, February, ..., December |
     * | Quarter                 | Q     | 1, 2, 3, 4                       |
     * |                         | Qo    | 1st, 2nd, 3rd, 4th               |
     * | Day of month            | D     | 1, 2, ..., 31                    |
     * |                         | Do    | 1st, 2nd, ..., 31st              |
     * |                         | DD    | 01, 02, ..., 31                  |
     * | Day of year             | DDD   | 1, 2, ..., 366                   |
     * |                         | DDDo  | 1st, 2nd, ..., 366th             |
     * |                         | DDDD  | 001, 002, ..., 366               |
     * | Day of week             | d     | 0, 1, ..., 6                     |
     * |                         | do    | 0th, 1st, ..., 6th               |
     * |                         | dd    | Su, Mo, ..., Sa                  |
     * |                         | ddd   | Sun, Mon, ..., Sat               |
     * |                         | dddd  | Sunday, Monday, ..., Saturday    |
     * | Day of ISO week         | E     | 1, 2, ..., 7                     |
     * | ISO week                | W     | 1, 2, ..., 53                    |
     * |                         | Wo    | 1st, 2nd, ..., 53rd              |
     * |                         | WW    | 01, 02, ..., 53                  |
     * | Year                    | YY    | 00, 01, ..., 99                  |
     * |                         | YYYY  | 1900, 1901, ..., 2099            |
     * | ISO week-numbering year | GG    | 00, 01, ..., 99                  |
     * |                         | GGGG  | 1900, 1901, ..., 2099            |
     * | AM/PM                   | A     | AM, PM                           |
     * |                         | a     | am, pm                           |
     * |                         | aa    | a.m., p.m.                       |
     * | Hour                    | H     | 0, 1, ... 23                     |
     * |                         | HH    | 00, 01, ... 23                   |
     * |                         | h     | 1, 2, ..., 12                    |
     * |                         | hh    | 01, 02, ..., 12                  |
     * | Minute                  | m     | 0, 1, ..., 59                    |
     * |                         | mm    | 00, 01, ..., 59                  |
     * | Second                  | s     | 0, 1, ..., 59                    |
     * |                         | ss    | 00, 01, ..., 59                  |
     * | 1/10 of second          | S     | 0, 1, ..., 9                     |
     * | 1/100 of second         | SS    | 00, 01, ..., 99                  |
     * | Millisecond             | SSS   | 000, 001, ..., 999               |
     * | Timezone                | Z     | -01:00, +00:00, ... +12:00       |
     * |                         | ZZ    | -0100, +0000, ..., +1200         |
     * | Seconds timestamp       | X     | 512969520                        |
     * | Milliseconds timestamp  | x     | 512969520900                     |
     *
     * The characters wrapped in square brackets are escaped.
     *
     * The result may vary by locale.
     *
     * @param {Date|String|Number} date - the original date
     * @param {String} [format='YYYY-MM-DDTHH:mm:ss.SSSZ'] - the string of tokens
     * @param {Object} [options] - the object with options
     * @param {Object} [options.locale=enLocale] - the locale object
     * @returns {String} the formatted date string
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(
     *   new Date(2014, 1, 11),
     *   'MM/DD/YYYY'
     * )
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * var eoLocale = require('date-fns/locale/eo')
     * var result = format(
     *   new Date(2014, 6, 2),
     *   'Do [de] MMMM YYYY',
     *   {locale: eoLocale}
     * )
     * //=> '2-a de julio 2014'
     */
    formatDate(dirtyDate, dirtyFormatStr, dirtyOptions) {
        var formatStr = dirtyFormatStr ? String(dirtyFormatStr) : 'YYYY-MM-DDTHH:mm:ss.SSSZ'
        var options = dirtyOptions || {}

        var locale = options.locale
        var localeFormatters = this.buildFormatLocale().formatters
        var formattingTokensRegExp = this.buildFormatLocale().formattingTokensRegExp
        if (locale && locale.format && locale.format.formatters) {
            localeFormatters = locale.format.formatters

            if (locale.format.formattingTokensRegExp) {
                formattingTokensRegExp = locale.format.formattingTokensRegExp
            }
        }
        var date = dirtyDate;
        if (!(date instanceof Date)) {
            if (dirtyFormatStr) {
                date = this.parseDateWithFormat(dirtyDate, dirtyFormatStr);
            } else {
                date = this.parse(dirtyDate);
            }
        }

        if (!this.isValid(date)) {
            return 'Invalid Date'
        }

        var formatFn = this.buildFormatFn(formatStr, localeFormatters, formattingTokensRegExp)

        return formatFn(date)
    }



    isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    buildFormatFn(formatStr, localeFormatters, formattingTokensRegExp) {
        var array = formatStr.match(formattingTokensRegExp)
        var length = array.length

        var i
        var formatter
        for (i = 0; i < length; i++) {
            formatter = localeFormatters[array[i]] || formatters[array[i]]
            if (formatter) {
                array[i] = formatter
            } else {
                array[i] = this.removeFormattingTokens(array[i])
            }
        }
        let _this = this;

        return function (date) {
            var output = ''
            for (var i = 0; i < length; i++) {
                if (_this.isFunction(array[i])) {
                    output += array[i](date, formatters)
                } else {
                    output += array[i]
                }
            }
            return output
        }
    }



    removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|]$/g, '')
        }
        return input.replace(/\\/g, '')
    }

    formatTimezone(offset, delimeter) {
        delimeter = delimeter || ''
        var sign = offset > 0 ? '-' : '+'
        var absOffset = Math.abs(offset)
        var hours = Math.floor(absOffset / 60)
        var minutes = absOffset % 60
        return sign + this.addLeadingZeros(hours, 2) + delimeter + this.addLeadingZeros(minutes, 2)
    }

    addLeadingZeros(number, targetLength) {
        var output = Math.abs(number).toString()
        while (output.length < targetLength) {
            output = '0' + output
        }
        return output
    }



    /**
     * @summary Get the day of the month of the given date.
     *
     * @description
     * Get the day of the month of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the day of month
     *
     * @example
     * // Which day of the month is 29 February 2012?
     * var result = getDate(new Date(2012, 1, 29))
     * //=> 29
     */
    getDate(dirtyDate) {
        var date = this.parse(dirtyDate)
        var dayOfMonth = date.getDate()
        return dayOfMonth
    }


    /**
     * @summary Get the day of the week of the given date.
     *
     * @description
     * Get the day of the week of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the day of week
     *
     * @example
     * // Which day of the week is 29 February 2012?
     * var result = getDay(new Date(2012, 1, 29))
     * //=> 3
     */
    getDay(dirtyDate) {
        var date = this.parse(dirtyDate)
        var day = date.getDay()
        return day
    }



    /**
     * @summary Get the day of the year of the given date.
     *
     * @description
     * Get the day of the year of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the day of year
     *
     * @example
     * // Which day of the year is 2 July 2014?
     * var result = getDayOfYear(new Date(2014, 6, 2))
     * //=> 183
     */
    getDayOfYear(dirtyDate) {
        var date = this.parse(dirtyDate)
        var diff = this.differenceInCalendarDays(date, this.startOfYear(date))
        var dayOfYear = diff + 1
        return dayOfYear
    }


    /**
     * @summary Get the number of days in a month of the given date.
     *
     * @description
     * Get the number of days in a month of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the number of days in a month
     *
     * @example
     * // How many days are in February 2000?
     * var result = getDaysInMonth(new Date(2000, 1))
     * //=> 29
     */
    getDaysInMonth(dirtyDate) {
        var date = this.parse(dirtyDate)
        var year = date.getFullYear()
        var monthIndex = date.getMonth()
        var lastDayOfMonth = new Date(0)
        lastDayOfMonth.setFullYear(year, monthIndex + 1, 0)
        lastDayOfMonth.setHours(0, 0, 0, 0)
        return lastDayOfMonth.getDate()
    }


    /**
     * @summary Get the number of days in a year of the given date.
     *
     * @description
     * Get the number of days in a year of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the number of days in a year
     *
     * @example
     * // How many days are in 2012?
     * var result = getDaysInYear(new Date(2012, 0, 1))
     * //=> 366
     */
    getDaysInYear(dirtyDate) {
        return this.isLeapYear(dirtyDate) ? 366 : 365
    }


    /**
     * @summary Get the hours of the given date.
     *
     * @description
     * Get the hours of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the hours
     *
     * @example
     * // Get the hours of 29 February 2012 11:45:00:
     * var result = getHours(new Date(2012, 1, 29, 11, 45))
     * //=> 11
     */
    getHours(dirtyDate) {
        var date = this.parse(dirtyDate)
        var hours = date.getHours()
        return hours
    }

    /**
     * @summary Get the day of the ISO week of the given date.
     *
     * @description
     * Get the day of the ISO week of the given date,
     * which is 7 for Sunday, 1 for Monday etc.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the day of ISO week
     *
     * @example
     * // Which day of the ISO week is 26 February 2012?
     * var result = getISODay(new Date(2012, 1, 26))
     * //=> 7
     */
    getISODay(dirtyDate) {
        var date = this.parse(dirtyDate)
        var day = date.getDay()

        if (day === 0) {
            day = 7
        }

        return day
    }




    /**
     * @summary Get the ISO week of the given date.
     *
     * @description
     * Get the ISO week of the given date.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the ISO week
     *
     * @example
     * // Which week of the ISO-week numbering year is 2 January 2005?
     * var result = getISOWeek(new Date(2005, 0, 2))
     * //=> 53
     */
    getISOWeek(dirtyDate) {
        var date = this.parse(dirtyDate)
        var diff = this.startOfISOWeek(date).getTime() - this.startOfISOYear(date).getTime()

        // Round the number of days to the nearest integer
        // because the number of milliseconds in a week is not constant
        // (e.g. it's different in the week of the daylight saving time clock shift)
        return Math.round(diff / MILLISECONDS_IN_WEEK) + 1
    }




    /**
     * @summary Get the number of weeks in an ISO week-numbering year of the given date.
     *
     * @description
     * Get the number of weeks in an ISO week-numbering year of the given date.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the number of ISO weeks in a year
     *
     * @example
     * // How many weeks are in ISO week-numbering year 2015?
     * var result = getISOWeeksInYear(new Date(2015, 1, 11))
     * //=> 53
     */
    getISOWeeksInYear(dirtyDate) {
        var thisYear = this.startOfISOYear(dirtyDate)
        var nextYear = this.startOfISOYear(this.addWeeks(thisYear, 60))
        var diff = nextYear.valueOf() - thisYear.valueOf()
        // Round the number of weeks to the nearest integer
        // because the number of milliseconds in a week is not constant
        // (e.g. it's different in the week of the daylight saving time clock shift)
        return Math.round(diff / MILLISECONDS_IN_WEEK)
    }


    /**
     * @summary Get the ISO week-numbering year of the given date.
     *
     * @description
     * Get the ISO week-numbering year of the given date,
     * which always starts 3 days before the year's first Thursday.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the ISO week-numbering year
     *
     * @example
     * // Which ISO-week numbering year is 2 January 2005?
     * var result = getISOYear(new Date(2005, 0, 2))
     * //=> 2004
     */
    getISOYear(dirtyDate) {
        var date = this.parse(dirtyDate)
        var year = date.getFullYear()

        var fourthOfJanuaryOfNextYear = new Date(0)
        fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4)
        fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0)
        var startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear)

        var fourthOfJanuaryOfThisYear = new Date(0)
        fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4)
        fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0)
        var startOfThisYear = this.startOfISOWeek(fourthOfJanuaryOfThisYear)

        if (date.getTime() >= startOfNextYear.getTime()) {
            return year + 1
        } else if (date.getTime() >= startOfThisYear.getTime()) {
            return year
        } else {
            return year - 1
        }
    }

    /**
     * @summary Get the milliseconds of the given date.
     *
     * @description
     * Get the milliseconds of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the milliseconds
     *
     * @example
     * // Get the milliseconds of 29 February 2012 11:45:05.123:
     * var result = getMilliseconds(new Date(2012, 1, 29, 11, 45, 5, 123))
     * //=> 123
     */
    getMilliseconds(dirtyDate) {
        var date = this.parse(dirtyDate)
        var milliseconds = date.getMilliseconds()
        return milliseconds
    }

    /**
     * @summary Get the minutes of the given date.
     *
     * @description
     * Get the minutes of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the minutes
     *
     * @example
     * // Get the minutes of 29 February 2012 11:45:05:
     * var result = getMinutes(new Date(2012, 1, 29, 11, 45, 5))
     * //=> 45
     */
    getMinutes(dirtyDate) {
        var date = this.parse(dirtyDate)
        var minutes = date.getMinutes()
        return minutes
    }


    /**
     * @summary Get the month of the given date.
     *
     * @description
     * Get the month of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the month
     *
     * @example
     * // Which month is 29 February 2012?
     * var result = getMonth(new Date(2012, 1, 29))
     * //=> 1
     */
    getMonth(dirtyDate) {
        var date = this.parse(dirtyDate)
        var month = date.getMonth()
        return month
    }




    /**
     * @summary Get the number of days that overlap in two date ranges
     *
     * @description
     * Get the number of days that overlap in two date ranges
     *
     * @param {Date|String|Number} initialRangeStartDate - the start of the initial range
     * @param {Date|String|Number} initialRangeEndDate - the end of the initial range
     * @param {Date|String|Number} comparedRangeStartDate - the start of the range to compare it with
     * @param {Date|String|Number} comparedRangeEndDate - the end of the range to compare it with
     * @returns {Number} the number of days that overlap in two date ranges
     * @throws {Error} startDate of a date range cannot be after its endDate
     *
     * @example
     * // For overlapping date ranges adds 1 for each started overlapping day:
     * getOverlappingDaysInRanges(
     *   new Date(2014, 0, 10), new Date(2014, 0, 20), new Date(2014, 0, 17), new Date(2014, 0, 21)
     * )
     * //=> 3
     *
     * @example
     * // For non-overlapping date ranges returns 0:
     * getOverlappingDaysInRanges(
     *   new Date(2014, 0, 10), new Date(2014, 0, 20), new Date(2014, 0, 21), new Date(2014, 0, 22)
     * )
     * //=> 0
     */
    getOverlappingDaysInRanges(dirtyInitialRangeStartDate, dirtyInitialRangeEndDate, dirtyComparedRangeStartDate, dirtyComparedRangeEndDate) {
        var initialStartTime = this.parse(dirtyInitialRangeStartDate).getTime()
        var initialEndTime = this.parse(dirtyInitialRangeEndDate).getTime()
        var comparedStartTime = this.parse(dirtyComparedRangeStartDate).getTime()
        var comparedEndTime = this.parse(dirtyComparedRangeEndDate).getTime()

        if (initialStartTime > initialEndTime || comparedStartTime > comparedEndTime) {
            throw new Error('The start of the range cannot be after the end of the range')
        }

        var isOverlapping = initialStartTime < comparedEndTime && comparedStartTime < initialEndTime

        if (!isOverlapping) {
            return 0
        }

        var overlapStartDate = comparedStartTime < initialStartTime
            ? initialStartTime
            : comparedStartTime

        var overlapEndDate = comparedEndTime > initialEndTime
            ? initialEndTime
            : comparedEndTime

        var differenceInMs = overlapEndDate - overlapStartDate

        return Math.ceil(differenceInMs / MILLISECONDS_IN_DAY)
    }


    /**
     * @summary Get the year quarter of the given date.
     *
     * @description
     * Get the year quarter of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the quarter
     *
     * @example
     * // Which quarter is 2 July 2014?
     * var result = getQuarter(new Date(2014, 6, 2))
     * //=> 3
     */
    getQuarter(dirtyDate) {
        var date = this.parse(dirtyDate)
        var quarter = Math.floor(date.getMonth() / 3) + 1
        return quarter
    }


    /**
     * @summary Get the seconds of the given date.
     *
     * @description
     * Get the seconds of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the seconds
     *
     * @example
     * // Get the seconds of 29 February 2012 11:45:05.123:
     * var result = getSeconds(new Date(2012, 1, 29, 11, 45, 5, 123))
     * //=> 5
     */
    getSeconds(dirtyDate) {
        var date = this.parse(dirtyDate)
        var seconds = date.getSeconds()
        return seconds
    }

    /**
     * @summary Get the milliseconds timestamp of the given date.
     *
     * @description
     * Get the milliseconds timestamp of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the timestamp
     *
     * @example
     * // Get the timestamp of 29 February 2012 11:45:05.123:
     * var result = getTime(new Date(2012, 1, 29, 11, 45, 5, 123))
     * //=> 1330515905123
     */
    getTime(dirtyDate) {
        var date = this.parse(dirtyDate)
        var timestamp = date.getTime()
        return timestamp
    }


    /**
     * @summary Get the year of the given date.
     *
     * @description
     * Get the year of the given date.
     *
     * @param {Date|String|Number} date - the given date
     * @returns {Number} the year
     *
     * @example
     * // Which year is 2 July 2014?
     * var result = getYear(new Date(2014, 6, 2))
     * //=> 2014
     */
    getYear(dirtyDate) {
        var date = this.parse(dirtyDate)
        var year = date.getFullYear()
        return year
    }

    /**
     * @category Common Helpers
     * @summary Is the first date after the second one?
     *
     * @description
     * Is the first date after the second one?
     *
     * @param {Date|String|Number} date - the date that should be after the other one to return true
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @returns {Boolean} the first date is after the second date
     *
     * @example
     * // Is 10 July 1989 after 11 February 1987?
     * var result = isAfter(new Date(1989, 6, 10), new Date(1987, 1, 11))
     * //=> true
     */
    isAfter(dirtyDate, dirtyDateToCompare) {
        var date = this.parse(dirtyDate)
        var dateToCompare = this.parse(dirtyDateToCompare)
        return date.getTime() > dateToCompare.getTime()
    }


    /**
     * @summary Is the first date before the second one?
     *
     * @description
     * Is the first date before the second one?
     *
     * @param {Date|String|Number} date - the date that should be before the other one to return true
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @returns {Boolean} the first date is before the second date
     *
     * @example
     * // Is 10 July 1989 before 11 February 1987?
     * var result = isBefore(new Date(1989, 6, 10), new Date(1987, 1, 11))
     * //=> false
     */
    isBefore(dirtyDate, dirtyDateToCompare) {
        var date = this.parse(dirtyDate)
        var dateToCompare = this.parse(dirtyDateToCompare)
        return date.getTime() < dateToCompare.getTime()
    }


    /**
     * @summary Is the given argument an instance of Date?
     *
     * @description
     * Is the given argument an instance of Date?
     *
     * @param {*} argument - the argument to check
     * @returns {Boolean} the given argument is an instance of Date
     *
     * @example
     * // Is 'mayonnaise' a Date?
     * var result = isDate('mayonnaise')
     * //=> false
     */
    isDate(argument) {
        return argument instanceof Date
    }

    /**
     * @summary Are the given dates equal?
     *
     * @description
     * Are the given dates equal?
     *
     * @param {Date|String|Number} dateLeft - the first date to compare
     * @param {Date|String|Number} dateRight - the second date to compare
     * @returns {Boolean} the dates are equal
     *
     * @example
     * // Are 2 July 2014 06:30:45.000 and 2 July 2014 06:30:45.500 equal?
     * var result = isEqual(
     *   new Date(2014, 6, 2, 6, 30, 45, 0)
     *   new Date(2014, 6, 2, 6, 30, 45, 500)
     * )
     * //=> false
     */
    isEqual(dirtyLeftDate, dirtyRightDate) {
        var dateLeft = this.parse(dirtyLeftDate)
        var dateRight = this.parse(dirtyRightDate)
        return dateLeft.getTime() === dateRight.getTime()
    }

    /**
     * @summary Is the given date the first day of a month?
     *
     * @description
     * Is the given date the first day of a month?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is the first day of a month
     *
     * @example
     * // Is 1 September 2014 the first day of a month?
     * var result = isFirstDayOfMonth(new Date(2014, 8, 1))
     * //=> true
     */
    isFirstDayOfMonth(dirtyDate) {
        return this.parse(dirtyDate).getDate() === 1
    }


    /**
     * @summary Is the given date Friday?
     *
     * @description
     * Is the given date Friday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is Friday
     *
     * @example
     * // Is 26 September 2014 Friday?
     * var result = isFriday(new Date(2014, 8, 26))
     * //=> true
     */
    isFriday(dirtyDate) {
        return this.parse(dirtyDate).getDay() === 5
    }


    /**
     * @summary Is the given date in the future?
     *
     * @description
     * Is the given date in the future?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in the future
     *
     * @example
     * // If today is 6 October 2014, is 31 December 2014 in the future?
     * var result = isFuture(new Date(2014, 11, 31))
     * //=> true
     */
    isFuture(dirtyDate) {
        return this.parse(dirtyDate).getTime() > new Date().getTime()
    }

    /**
     * @summary Is the given date the last day of a month?
     *
     * @description
     * Is the given date the last day of a month?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is the last day of a month
     *
     * @example
     * // Is 28 February 2014 the last day of a month?
     * var result = isLastDayOfMonth(new Date(2014, 1, 28))
     * //=> true
     */
    isLastDayOfMonth(dirtyDate) {
        var date = this.parse(dirtyDate)
        return this.endOfDay(date).getTime() === this.endOfMonth(date).getTime()
    }


    /**
     * @summary Is the given date in the leap year?
     *
     * @description
     * Is the given date in the leap year?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in the leap year
     *
     * @example
     * // Is 1 September 2012 in the leap year?
     * var result = isLeapYear(new Date(2012, 8, 1))
     * //=> true
     */
    isLeapYear(dirtyDate) {
        var date = this.parse(dirtyDate)
        var year = date.getFullYear()
        return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0
    }



    /**
     * @summary Is the given date Monday?
     *
     * @description
     * Is the given date Monday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is Monday
     *
     * @example
     * // Is 22 September 2014 Monday?
     * var result = isMonday(new Date(2014, 8, 22))
     * //=> true
     */
    isMonday(dirtyDate) {
        return this.parse(dirtyDate).getDay() === 1
    }

    /**
     * @category Common Helpers
     * @summary Is the given date in the past?
     *
     * @description
     * Is the given date in the past?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in the past
     *
     * @example
     * // If today is 6 October 2014, is 2 July 2014 in the past?
     * var result = isPast(new Date(2014, 6, 2))
     * //=> true
     */
    isPast(dirtyDate) {
        return this.parse(dirtyDate).getTime() < new Date().getTime()
    }

    /**
     * @summary Are the given dates in the same day?
     *
     * @description
     * Are the given dates in the same day?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same day
     *
     * @example
     * // Are 4 September 06:00:00 and 4 September 18:00:00 in the same day?
     * var result = isSameDay(
     *   new Date(2014, 8, 4, 6, 0),
     *   new Date(2014, 8, 4, 18, 0)
     * )
     * //=> true
     */
    isSameDay(dirtyDateLeft, dirtyDateRight) {
        var dateLeftStartOfDay = this.startOfDay(dirtyDateLeft)
        var dateRightStartOfDay = this.startOfDay(dirtyDateRight)

        return dateLeftStartOfDay.getTime() === dateRightStartOfDay.getTime()
    }

    /**
     * @summary Are the given dates in the same hour?
     *
     * @description
     * Are the given dates in the same hour?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same hour
     *
     * @example
     * // Are 4 September 2014 06:00:00 and 4 September 06:30:00 in the same hour?
     * var result = isSameHour(
     *   new Date(2014, 8, 4, 6, 0),
     *   new Date(2014, 8, 4, 6, 30)
     * )
     * //=> true
     */
    isSameHour(dirtyDateLeft, dirtyDateRight) {
        var dateLeftStartOfHour = this.startOfHour(dirtyDateLeft)
        var dateRightStartOfHour = this.startOfHour(dirtyDateRight)

        return dateLeftStartOfHour.getTime() === dateRightStartOfHour.getTime()
    }

    /**
     * @summary Are the given dates in the same ISO week?
     *
     * @description
     * Are the given dates in the same ISO week?
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same ISO week
     *
     * @example
     * // Are 1 September 2014 and 7 September 2014 in the same ISO week?
     * var result = isSameISOWeek(
     *   new Date(2014, 8, 1),
     *   new Date(2014, 8, 7)
     * )
     * //=> true
     */
    isSameISOWeek(dirtyDateLeft, dirtyDateRight) {
        return this.isSameWeek(dirtyDateLeft, dirtyDateRight, { weekStartsOn: 1 })
    }


    /**
     * @summary Are the given dates in the same ISO week-numbering year?
     *
     * @description
     * Are the given dates in the same ISO week-numbering year?
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same ISO week-numbering year
     *
     * @example
     * // Are 29 December 2003 and 2 January 2005 in the same ISO week-numbering year?
     * var result = isSameISOYear(
     *   new Date(2003, 11, 29),
     *   new Date(2005, 0, 2)
     * )
     * //=> true
     */
    isSameISOYear(dirtyDateLeft, dirtyDateRight) {
        var dateLeftStartOfYear = this.startOfISOYear(dirtyDateLeft)
        var dateRightStartOfYear = this.startOfISOYear(dirtyDateRight)

        return dateLeftStartOfYear.getTime() === dateRightStartOfYear.getTime()
    }


    /**
     * @summary Are the given dates in the same minute?
     *
     * @description
     * Are the given dates in the same minute?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same minute
     *
     * @example
     * // Are 4 September 2014 06:30:00 and 4 September 2014 06:30:15
     * // in the same minute?
     * var result = isSameMinute(
     *   new Date(2014, 8, 4, 6, 30),
     *   new Date(2014, 8, 4, 6, 30, 15)
     * )
     * //=> true
     */
    isSameMinute(dirtyDateLeft, dirtyDateRight) {
        var dateLeftStartOfMinute = this.startOfMinute(dirtyDateLeft)
        var dateRightStartOfMinute = this.startOfMinute(dirtyDateRight)

        return dateLeftStartOfMinute.getTime() === dateRightStartOfMinute.getTime()
    }


    /**
     * @summary Are the given dates in the same month?
     *
     * @description
     * Are the given dates in the same month?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same month
     *
     * @example
     * // Are 2 September 2014 and 25 September 2014 in the same month?
     * var result = isSameMonth(
     *   new Date(2014, 8, 2),
     *   new Date(2014, 8, 25)
     * )
     * //=> true
     */
    isSameMonth(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)
        return dateLeft.getFullYear() === dateRight.getFullYear() &&
            dateLeft.getMonth() === dateRight.getMonth()
    }


    /**
     * @summary Are the given dates in the same year quarter?
     *
     * @description
     * Are the given dates in the same year quarter?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same quarter
     *
     * @example
     * // Are 1 January 2014 and 8 March 2014 in the same quarter?
     * var result = isSameQuarter(
     *   new Date(2014, 0, 1),
     *   new Date(2014, 2, 8)
     * )
     * //=> true
     */
    isSameQuarter(dirtyDateLeft, dirtyDateRight) {
        var dateLeftStartOfQuarter = this.startOfQuarter(dirtyDateLeft)
        var dateRightStartOfQuarter = this.startOfQuarter(dirtyDateRight)

        return dateLeftStartOfQuarter.getTime() === dateRightStartOfQuarter.getTime()
    }

    /**
     * @summary Are the given dates in the same second?
     *
     * @description
     * Are the given dates in the same second?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same second
     *
     * @example
     * // Are 4 September 2014 06:30:15.000 and 4 September 2014 06:30.15.500
     * // in the same second?
     * var result = isSameSecond(
     *   new Date(2014, 8, 4, 6, 30, 15),
     *   new Date(2014, 8, 4, 6, 30, 15, 500)
     * )
     * //=> true
     */
    isSameSecond(dirtyDateLeft, dirtyDateRight) {
        var dateLeftStartOfSecond = this.startOfSecond(dirtyDateLeft)
        var dateRightStartOfSecond = this.startOfSecond(dirtyDateRight)

        return dateLeftStartOfSecond.getTime() === dateRightStartOfSecond.getTime()
    }


    /**
     * @summary Are the given dates in the same week?
     *
     * @description
     * Are the given dates in the same week?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Boolean} the dates are in the same week
     *
     * @example
     * // Are 31 August 2014 and 4 September 2014 in the same week?
     * var result = isSameWeek(
     *   new Date(2014, 7, 31),
     *   new Date(2014, 8, 4)
     * )
     * //=> true
     *
     * @example
     * // If week starts with Monday,
     * // are 31 August 2014 and 4 September 2014 in the same week?
     * var result = isSameWeek(
     *   new Date(2014, 7, 31),
     *   new Date(2014, 8, 4),
     *   {weekStartsOn: 1}
     * )
     * //=> false
     */
    isSameWeek(dirtyDateLeft, dirtyDateRight, dirtyOptions) {
        var dateLeftStartOfWeek = this.startOfWeek(dirtyDateLeft, dirtyOptions)
        var dateRightStartOfWeek = this.startOfWeek(dirtyDateRight, dirtyOptions)

        return dateLeftStartOfWeek.getTime() === dateRightStartOfWeek.getTime()
    }



    /**
     * @summary Are the given dates in the same year?
     *
     * @description
     * Are the given dates in the same year?
     *
     * @param {Date|String|Number} dateLeft - the first date to check
     * @param {Date|String|Number} dateRight - the second date to check
     * @returns {Boolean} the dates are in the same year
     *
     * @example
     * // Are 2 September 2014 and 25 September 2014 in the same year?
     * var result = isSameYear(
     *   new Date(2014, 8, 2),
     *   new Date(2014, 8, 25)
     * )
     * //=> true
     */
    isSameYear(dirtyDateLeft, dirtyDateRight) {
        var dateLeft = this.parse(dirtyDateLeft)
        var dateRight = this.parse(dirtyDateRight)
        return dateLeft.getFullYear() === dateRight.getFullYear()
    }



    /**
     * @summary Is the given date Saturday?
     *
     * @description
     * Is the given date Saturday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is Saturday
     *
     * @example
     * // Is 27 September 2014 Saturday?
     * var result = isSaturday(new Date(2014, 8, 27))
     * //=> true
     */
    isSaturday(dirtyDate) {
        return this.parse(dirtyDate).getDay() === 6
    }


    /**
     * @summary Is the given date so last week?
     *
     * @description
     * Is the given date so last week?
     *
     * @param {Date|String|Number} date - the date to check
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Boolean} so last week
     *
     * @example
     * // Is 7 December 2016 so last week?
     * var result = isSoLastWeek(
     *   new Date(2016, 12, 7)
     * )
     * //=> true
     */
    isSoLastWeek(dirtyDate, dirtyOptions) {
        return this.isSameWeek(new Date(), this.addWeeks(dirtyDate, 1), dirtyOptions)
    }


    /**
     * @summary Is the given date Sunday?
     *
     * @description
     * Is the given date Sunday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is Sunday
     *
     * @example
     * // Is 21 September 2014 Sunday?
     * var result = isSunday(new Date(2014, 8, 21))
     * //=> true
     */
    isSunday(dirtyDate) {
        return this.parse(dirtyDate).getDay() === 0
    }


    /**
     * @summary Is the given date in the same hour as the current date?
     *
     * @description
     * Is the given date in the same hour as the current date?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this hour
     *
     * @example
     * // If now is 25 September 2014 18:30:15.500,
     * // is 25 September 2014 18:00:00 in this hour?
     * var result = isThisHour(new Date(2014, 8, 25, 18))
     * //=> true
     */
    isThisHour(dirtyDate) {
        return this.isSameHour(new Date(), dirtyDate)
    }


    /**
     * @summary Is the given date in the same ISO week as the current date?
     *
     * @description
     * Is the given date in the same ISO week as the current date?
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this ISO week
     *
     * @example
     * // If today is 25 September 2014, is 22 September 2014 in this ISO week?
     * var result = isThisISOWeek(new Date(2014, 8, 22))
     * //=> true
     */
    isThisISOWeek(dirtyDate) {
        return this.isSameISOWeek(new Date(), dirtyDate)
    }


    /**
     * @summary Is the given date in the same ISO week-numbering year as the current date?
     *
     * @description
     * Is the given date in the same ISO week-numbering year as the current date?
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this ISO week-numbering year
     *
     * @example
     * // If today is 25 September 2014,
     * // is 30 December 2013 in this ISO week-numbering year?
     * var result = isThisISOYear(new Date(2013, 11, 30))
     * //=> true
     */
    isThisISOYear(dirtyDate) {
        return this.isSameISOYear(new Date(), dirtyDate)
    }

    /**
     * @summary Is the given date in the same minute as the current date?
     *
     * @description
     * Is the given date in the same minute as the current date?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this minute
     *
     * @example
     * // If now is 25 September 2014 18:30:15.500,
     * // is 25 September 2014 18:30:00 in this minute?
     * var result = isThisMinute(new Date(2014, 8, 25, 18, 30))
     * //=> true
     */
    isThisMinute(dirtyDate) {
        return this.isSameMinute(new Date(), dirtyDate)
    }

    /**
     * @summary Is the given date in the same month as the current date?
     *
     * @description
     * Is the given date in the same month as the current date?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this month
     *
     * @example
     * // If today is 25 September 2014, is 15 September 2014 in this month?
     * var result = isThisMonth(new Date(2014, 8, 15))
     * //=> true
     */
    isThisMonth(dirtyDate) {
        return this.isSameMonth(new Date(), dirtyDate)
    }


    /**
     * @summary Is the given date in the same quarter as the current date?
     *
     * @description
     * Is the given date in the same quarter as the current date?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this quarter
     *
     * @example
     * // If today is 25 September 2014, is 2 July 2014 in this quarter?
     * var result = isThisQuarter(new Date(2014, 6, 2))
     * //=> true
     */
    isThisQuarter(dirtyDate) {
        return this.isSameQuarter(new Date(), dirtyDate)
    }


    /**
     * @summary Is the given date in the same second as the current date?
     *
     * @description
     * Is the given date in the same second as the current date?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this second
     *
     * @example
     * // If now is 25 September 2014 18:30:15.500,
     * // is 25 September 2014 18:30:15.000 in this second?
     * var result = isThisSecond(new Date(2014, 8, 25, 18, 30, 15))
     * //=> true
     */
    isThisSecond(dirtyDate) {
        return this.isSameSecond(new Date(), dirtyDate)
    }



    /**
     * @summary Is the given date in the same week as the current date?
     *
     * @description
     * Is the given date in the same week as the current date?
     *
     * @param {Date|String|Number} date - the date to check
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Boolean} the date is in this week
     *
     * @example
     * // If today is 25 September 2014, is 21 September 2014 in this week?
     * var result = isThisWeek(new Date(2014, 8, 21))
     * //=> true
     *
     * @example
     * // If today is 25 September 2014 and week starts with Monday
     * // is 21 September 2014 in this week?
     * var result = isThisWeek(new Date(2014, 8, 21), {weekStartsOn: 1})
     * //=> false
     */
    isThisWeek(dirtyDate, dirtyOptions) {
        return this.isSameWeek(new Date(), dirtyDate, dirtyOptions)
    }



    /**
     * @summary Is the given date in the same year as the current date?
     *
     * @description
     * Is the given date in the same year as the current date?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is in this year
     *
     * @example
     * // If today is 25 September 2014, is 2 July 2014 in this year?
     * var result = isThisYear(new Date(2014, 6, 2))
     * //=> true
     */
    isThisYear(dirtyDate) {
        return this.isSameYear(new Date(), dirtyDate)
    }

    /**
     * @summary Is the given date Thursday?
     *
     * @description
     * Is the given date Thursday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is Thursday
     *
     * @example
     * // Is 25 September 2014 Thursday?
     * var result = isThursday(new Date(2014, 8, 25))
     * //=> true
     */
    isThursday(dirtyDate) {
        return this.parse(dirtyDate).getDay() === 4
    }


    /**
     * @summary Is the given date today?
     *
     * @description
     * Is the given date today?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is today
     *
     * @example
     * // If today is 6 October 2014, is 6 October 14:00:00 today?
     * var result = isToday(new Date(2014, 9, 6, 14, 0))
     * //=> true
     */
    isToday(dirtyDate) {
        return this.startOfDay(dirtyDate).getTime() === this.startOfDay(new Date()).getTime()
    }



    /**
     * @summary Is the given date tomorrow?
     *
     * @description
     * Is the given date tomorrow?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is tomorrow
     *
     * @example
     * // If today is 6 October 2014, is 7 October 14:00:00 tomorrow?
     * var result = isTomorrow(new Date(2014, 9, 7, 14, 0))
     * //=> true
     */
    isTomorrow(dirtyDate) {
        var tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return this.startOfDay(dirtyDate).getTime() === this.startOfDay(tomorrow).getTime()
    }


    /**
     * @summary Is the given date Tuesday?
     *
     * @description
     * Is the given date Tuesday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is Tuesday
     *
     * @example
     * // Is 23 September 2014 Tuesday?
     * var result = isTuesday(new Date(2014, 8, 23))
     * //=> true
     */
    isTuesday(dirtyDate) {
        return this.parse(dirtyDate).getDay() === 2
    }

    /**
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * @param {Date} date - the date to check
     * @returns {Boolean} the date is valid
     * @throws {TypeError} argument must be an instance of Date
     *
     * @example
     * // For the valid date:
     * var result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the invalid date:
     * var result = isValid(new Date(''))
     * //=> false
     */
    isValid(dirtyDate) {
        if (this.isDate(dirtyDate)) {
            return !isNaN(dirtyDate)
        } else {
            throw new TypeError(toString.call(dirtyDate) + ' is not an instance of Date')
        }
    }

    /**
     * @summary Is the given date Wednesday?
     *
     * @description
     * Is the given date Wednesday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is Wednesday
     *
     * @example
     * // Is 24 September 2014 Wednesday?
     * var result = isWednesday(new Date(2014, 8, 24))
     * //=> true
     */
    isWednesday(dirtyDate) {
        return this.parse(dirtyDate).getDay() === 3
    }


    /**
     * @summary Does the given date fall on a weekend?
     *
     * @description
     * Does the given date fall on a weekend?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date falls on a weekend
     *
     * @example
     * // Does 5 October 2014 fall on a weekend?
     * var result = isWeekend(new Date(2014, 9, 5))
     * //=> true
     */
    isWeekend(dirtyDate) {
        var date = this.parse(dirtyDate)
        var day = date.getDay()
        return day === 0 || day === 6
    }



    /**
     * @summary Is the given date within the range?
     *
     * @description
     * Is the given date within the range?
     *
     * @param {Date|String|Number} date - the date to check
     * @param {Date|String|Number} startDate - the start of range
     * @param {Date|String|Number} endDate - the end of range
     * @returns {Boolean} the date is within the range
     * @throws {Error} startDate cannot be after endDate
     *
     * @example
     * // For the date within the range:
     * isWithinRange(
     *   new Date(2014, 0, 3), new Date(2014, 0, 1), new Date(2014, 0, 7)
     * )
     * //=> true
     *
     * @example
     * // For the date outside of the range:
     * isWithinRange(
     *   new Date(2014, 0, 10), new Date(2014, 0, 1), new Date(2014, 0, 7)
     * )
     * //=> false
     */
    isWithinRange(dirtyDate, dirtyStartDate, dirtyEndDate) {
        var time = this.parse(dirtyDate).getTime()
        var startTime = this.parse(dirtyStartDate).getTime()
        var endTime = this.parse(dirtyEndDate).getTime()

        if (startTime > endTime) {
            throw new Error('The start of the range cannot be after the end of the range')
        }

        return time >= startTime && time <= endTime
    }


    /**
     * @summary Is the given date yesterday?
     *
     * @description
     * Is the given date yesterday?
     *
     * @param {Date|String|Number} date - the date to check
     * @returns {Boolean} the date is yesterday
     *
     * @example
     * // If today is 6 October 2014, is 5 October 14:00:00 yesterday?
     * var result = isYesterday(new Date(2014, 9, 5, 14, 0))
     * //=> true
     */
    isYesterday(dirtyDate) {
        var yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return this.startOfDay(dirtyDate).getTime() === this.startOfDay(yesterday).getTime()
    }


    /**
     * @summary Return the last day of an ISO week for the given date.
     *
     * @description
     * Return the last day of an ISO week for the given date.
     * The result will be in the local timezone.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the last day of an ISO week
     *
     * @example
     * // The last day of an ISO week for 2 September 2014 11:55:00:
     * var result = lastDayOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Sun Sep 07 2014 00:00:00
     */
    lastDayOfISOWeek(dirtyDate) {
        return this.lastDayOfWeek(dirtyDate, { weekStartsOn: 1 })
    }


    /**
     * @summary Return the last day of an ISO week-numbering year for the given date.
     *
     * @description
     * Return the last day of an ISO week-numbering year,
     * which always starts 3 days before the year's first Thursday.
     * The result will be in the local timezone.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the end of an ISO week-numbering year
     *
     * @example
     * // The last day of an ISO week-numbering year for 2 July 2005:
     * var result = lastDayOfISOYear(new Date(2005, 6, 2))
     * //=> Sun Jan 01 2006 00:00:00
     */
    lastDayOfISOYear(dirtyDate) {
        var year = this.getISOYear(dirtyDate)
        var fourthOfJanuary = new Date(0)
        fourthOfJanuary.setFullYear(year + 1, 0, 4)
        fourthOfJanuary.setHours(0, 0, 0, 0)
        var date = this.startOfISOWeek(fourthOfJanuary)
        date.setDate(date.getDate() - 1)
        return date
    }



    /**
     * @summary Return the last day of a month for the given date.
     *
     * @description
     * Return the last day of a month for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the last day of a month
     *
     * @example
     * // The last day of a month for 2 September 2014 11:55:00:
     * var result = lastDayOfMonth(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 30 2014 00:00:00
     */
    lastDayOfMonth(dirtyDate) {
        var date = this.parse(dirtyDate)
        var month = date.getMonth()
        date.setFullYear(date.getFullYear(), month + 1, 0)
        date.setHours(0, 0, 0, 0)
        return date
    }



    /**
     * @summary Return the last day of a year quarter for the given date.
     *
     * @description
     * Return the last day of a year quarter for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the last day of a quarter
     *
     * @example
     * // The last day of a quarter for 2 September 2014 11:55:00:
     * var result = lastDayOfQuarter(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 30 2014 00:00:00
     */
    lastDayOfQuarter(dirtyDate) {
        var date = this.parse(dirtyDate)
        var currentMonth = date.getMonth()
        var month = currentMonth - currentMonth % 3 + 3
        date.setMonth(month, 0)
        date.setHours(0, 0, 0, 0)
        return date
    }

    /**
     * @summary Return the last day of a week for the given date.
     *
     * @description
     * Return the last day of a week for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Date} the last day of a week
     *
     * @example
     * // The last day of a week for 2 September 2014 11:55:00:
     * var result = lastDayOfWeek(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Sat Sep 06 2014 00:00:00
     *
     * @example
     * // If the week starts on Monday, the last day of the week for 2 September 2014 11:55:00:
     * var result = lastDayOfWeek(new Date(2014, 8, 2, 11, 55, 0), {weekStartsOn: 1})
     * //=> Sun Sep 07 2014 00:00:00
     */
    lastDayOfWeek(dirtyDate, dirtyOptions) {
        var weekStartsOn = dirtyOptions ? (Number(dirtyOptions.weekStartsOn) || 0) : 0

        var date = this.parse(dirtyDate)
        var day = date.getDay()
        var diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn)

        date.setHours(0, 0, 0, 0)
        date.setDate(date.getDate() + diff)
        return date
    }


    /**
     * @summary Return the last day of a year for the given date.
     *
     * @description
     * Return the last day of a year for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the last day of a year
     *
     * @example
     * // The last day of a year for 2 September 2014 11:55:00:
     * var result = lastDayOfYear(new Date(2014, 8, 2, 11, 55, 00))
     * //=> Wed Dec 31 2014 00:00:00
     */
    lastDayOfYear(dirtyDate) {
        var date = this.parse(dirtyDate)
        var year = date.getFullYear()
        date.setFullYear(year + 1, 0, 0)
        date.setHours(0, 0, 0, 0)
        return date
    }


    /**
     * @summary Return the latest of the given dates.
     *
     * @description
     * Return the latest of the given dates.
     *
     * @param {...(Date|String|Number)} dates - the dates to compare
     * @returns {Date} the latest of the dates
     *
     * @example
     * // Which of these dates is the latest?
     * var result = max(
     *   new Date(1989, 6, 10),
     *   new Date(1987, 1, 11),
     *   new Date(1995, 6, 2),
     *   new Date(1990, 0, 1)
     * )
     * //=> Sun Jul 02 1995 00:00:00
     */
    max() {
        var dirtyDates = Array.prototype.slice.call(arguments)
        var dates = dirtyDates.map(function (dirtyDate) {
            return this.parse(dirtyDate)
        })
        var latestTimestamp = Math.max.apply(null, dates)
        return new Date(latestTimestamp)
    }


    /**
     * @summary Return the earliest of the given dates.
     *
     * @description
     * Return the earliest of the given dates.
     *
     * @param {...(Date|String|Number)} dates - the dates to compare
     * @returns {Date} the earliest of the dates
     *
     * @example
     * // Which of these dates is the earliest?
     * var result = min(
     *   new Date(1989, 6, 10),
     *   new Date(1987, 1, 11),
     *   new Date(1995, 6, 2),
     *   new Date(1990, 0, 1)
     * )
     * //=> Wed Feb 11 1987 00:00:00
     */
    min() {
        var dirtyDates = Array.prototype.slice.call(arguments)
        var dates = dirtyDates.map(function (dirtyDate) {
            return this.parse(dirtyDate)
        })
        var earliestTimestamp = Math.min.apply(null, dates)
        return new Date(earliestTimestamp)
    }



    /**
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the  returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If an argument is a string, the  tries to this.parse it.
     *  accepts complete ISO 8601 formats as well as partial implementations.
     * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
     *
     * If all above fails, the  passes the given argument to Date constructor.
     *
     * @param {Date|String|Number} argument - the value to convert
     * @param {Object} [options] - the object with options
     * @param {0 | 1 | 2} [options.additionalDigits=2] - the additional number of digits in the extended year format
     * @returns {Date} the this.parsed date in the local time zone
     *
     * @example
     * // Convert string '2014-02-11T11:30:30' to date:
     * var result = this.parse('2014-02-11T11:30:30')
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // this.parse string '+02014101',
     * // if the additional number of digits in the extended year format is 1:
     * var result = this.parse('+02014101', {additionalDigits: 1})
     * //=> Fri Apr 11 2014 00:00:00
     */
    parse(argument, dirtyOptions) {
        if (this.isDate(argument)) {
            // Prevent the date to lose the milliseconds when passed to new Date() in IE10
            return new Date(argument.getTime())
        } else if (typeof argument !== 'string') {
            return new Date(argument)
        }

        var options = dirtyOptions || {}
        var additionalDigits = options.additionalDigits
        if (additionalDigits == null) {
            additionalDigits = DEFAULT_ADDITIONAL_DIGITS
        } else {
            additionalDigits = Number(additionalDigits)
        }

        var dateStrings = splitDateString(argument)

        var parseYearResult = this.parseYear(dateStrings.date, additionalDigits)
        var year = this.parseYearResult.year
        var restDateString = this.parseYearResult.restDateString

        var date = this.parseDate(restDateString, year)

        if (date) {
            var timestamp = date.getTime()
            var time = 0
            var offset

            if (dateStrings.time) {
                time = this.parseTime(dateStrings.time)
            }

            if (dateStrings.timezone) {
                offset = this.parseTimezone(dateStrings.timezone)
            } else {
                // get offset accurate to hour in timezones that change offset
                offset = new Date(timestamp + time).getTimezoneOffset()
                offset = new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE).getTimezoneOffset()
            }

            return new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE)
        } else {
            return new Date(argument)
        }
    }

    splitDateString(dateString) {
        var dateStrings = {}
        var array = dateString.split(parseTokenDateTimeDelimeter)
        var timeString

        if (parseTokenPlainTime.test(array[0])) {
            dateStrings.date = null
            timeString = array[0]
        } else {
            dateStrings.date = array[0]
            timeString = array[1]
        }

        if (timeString) {
            var token = parseTokenTimezone.exec(timeString)
            if (token) {
                dateStrings.time = timeString.replace(token[1], '')
                dateStrings.timezone = token[1]
            } else {
                dateStrings.time = timeString
            }
        }

        return dateStrings
    }

    parseYear(dateString, additionalDigits) {
        var parseTokenYYY = parseTokensYYY[additionalDigits]
        var parseTokenYYYYY = parseTokensYYYYY[additionalDigits]

        var token

        // YYYY or ±YYYYY
        token = parseTokenYYYY.exec(dateString) || parseTokenYYYYY.exec(dateString)
        if (token) {
            var yearString = token[1]
            return {
                year: this.parseInt(yearString, 10),
                restDateString: dateString.slice(yearString.length)
            }
        }

        // YY or ±YYY
        token = parseTokenYY.exec(dateString) || parseTokenYYY.exec(dateString)
        if (token) {
            var centuryString = token[1]
            return {
                year: this.parseInt(centuryString, 10) * 100,
                restDateString: dateString.slice(centuryString.length)
            }
        }

        // Invalid ISO-formatted year
        return {
            year: null
        }
    }

    parseDate(dateString, year) {
        // Invalid ISO-formatted year
        if (year === null) {
            return null
        }

        var token
        var date
        var month
        var week

        // YYYY
        if (!dateString || dateString.length === 0) {
            date = new Date(0)
            date.setUTCFullYear(year)
            return date
        }

        // YYYY-MM
        token = parseTokenMM.exec(dateString)
        if (token) {
            date = new Date(0)
            month = this.parseInt(token[1], 10) - 1
            date.setUTCFullYear(year, month)
            return date
        }

        // YYYY-DDD or YYYYDDD
        token = parseTokenDDD.exec(dateString)
        if (token) {
            date = new Date(0)
            var dayOfYear = this.parseInt(token[1], 10)
            date.setUTCFullYear(year, 0, dayOfYear)
            return date
        }

        // YYYY-MM-DD or YYYYMMDD
        token = parseTokenMMDD.exec(dateString)
        if (token) {
            date = new Date(0)
            month = this.parseInt(token[1], 10) - 1
            var day = this.parseInt(token[2], 10)
            date.setUTCFullYear(year, month, day)
            return date
        }

        // YYYY-Www or YYYYWww
        token = parseTokenWww.exec(dateString)
        if (token) {
            week = this.parseInt(token[1], 10) - 1
            return dayOfISOYear(year, week)
        }

        // YYYY-Www-D or YYYYWwwD
        token = parseTokenWwwD.exec(dateString)
        if (token) {
            week = this.parseInt(token[1], 10) - 1
            var dayOfWeek = this.parseInt(token[2], 10) - 1
            return dayOfISOYear(year, week, dayOfWeek)
        }

        // Invalid ISO-formatted date
        return null
    }

    parseTime(timeString) {
        var token
        var hours
        var minutes

        // hh
        token = parseTokenHH.exec(timeString)
        if (token) {
            hours = this.parseFloat(token[1].replace(',', '.'))
            return (hours % 24) * MILLISECONDS_IN_HOUR
        }

        // hh:mm or hhmm
        token = parseTokenHHMM.exec(timeString)
        if (token) {
            hours = this.parseInt(token[1], 10)
            minutes = this.parseFloat(token[2].replace(',', '.'))
            return (hours % 24) * MILLISECONDS_IN_HOUR +
                minutes * MILLISECONDS_IN_MINUTE
        }

        // hh:mm:ss or hhmmss
        token = parseTokenHHMMSS.exec(timeString)
        if (token) {
            hours = this.parseInt(token[1], 10)
            minutes = this.parseInt(token[2], 10)
            var seconds = this.parseFloat(token[3].replace(',', '.'))
            return (hours % 24) * MILLISECONDS_IN_HOUR +
                minutes * MILLISECONDS_IN_MINUTE +
                seconds * 1000
        }

        // Invalid ISO-formatted time
        return null
    }

    parseTimezone(timezoneString) {
        var token
        var absoluteOffset

        // Z
        token = parseTokenTimezoneZ.exec(timezoneString)
        if (token) {
            return 0
        }

        // ±hh
        token = parseTokenTimezoneHH.exec(timezoneString)
        if (token) {
            absoluteOffset = this.parseInt(token[2], 10) * 60
            return (token[1] === '+') ? -absoluteOffset : absoluteOffset
        }

        // ±hh:mm or ±hhmm
        token = parseTokenTimezoneHHMM.exec(timezoneString)
        if (token) {
            absoluteOffset = this.parseInt(token[2], 10) * 60 + this.parseInt(token[3], 10)
            return (token[1] === '+') ? -absoluteOffset : absoluteOffset
        }

        return 0
    }

    dayOfISOYear(isoYear, week, day) {
        week = week || 0
        day = day || 0
        var date = new Date(0)
        date.setUTCFullYear(isoYear, 0, 4)
        var fourthOfJanuaryDay = date.getUTCDay() || 7
        var diff = week * 7 + day + 1 - fourthOfJanuaryDay
        date.setUTCDate(date.getUTCDate() + diff)
        return date
    }

    /**
     * @summary Set the day of the month to the given date.
     *
     * @description
     * Set the day of the month to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} dayOfMonth - the day of the month of the new date
     * @returns {Date} the new date with the day of the month setted
     *
     * @example
     * // Set the 30th day of the month to 1 September 2014:
     * var result = setDate(new Date(2014, 8, 1), 30)
     * //=> Tue Sep 30 2014 00:00:00
     */
    setDate(dirtyDate, dirtyDayOfMonth) {
        var date = this.parse(dirtyDate)
        var dayOfMonth = Number(dirtyDayOfMonth)
        date.setDate(dayOfMonth)
        return date
    }


    /**
     * @summary Set the day of the week to the given date.
     *
     * @description
     * Set the day of the week to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} day - the day of the week of the new date
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Date} the new date with the day of the week setted
     *
     * @example
     * // Set Sunday to 1 September 2014:
     * var result = setDay(new Date(2014, 8, 1), 0)
     * //=> Sun Aug 31 2014 00:00:00
     *
     * @example
     * // If week starts with Monday, set Sunday to 1 September 2014:
     * var result = setDay(new Date(2014, 8, 1), 0, {weekStartsOn: 1})
     * //=> Sun Sep 07 2014 00:00:00
     */
    setDay(dirtyDate, dirtyDay, dirtyOptions) {
        var weekStartsOn = dirtyOptions ? (Number(dirtyOptions.weekStartsOn) || 0) : 0
        var date = this.parse(dirtyDate)
        var day = Number(dirtyDay)
        var currentDay = date.getDay()

        var remainder = day % 7
        var dayIndex = (remainder + 7) % 7

        var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay
        return this.addDays(date, diff)
    }

    /**
     * @summary Set the day of the year to the given date.
     *
     * @description
     * Set the day of the year to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} dayOfYear - the day of the year of the new date
     * @returns {Date} the new date with the day of the year setted
     *
     * @example
     * // Set the 2nd day of the year to 2 July 2014:
     * var result = setDayOfYear(new Date(2014, 6, 2), 2)
     * //=> Thu Jan 02 2014 00:00:00
     */
    setDayOfYear(dirtyDate, dirtyDayOfYear) {
        var date = this.parse(dirtyDate)
        var dayOfYear = Number(dirtyDayOfYear)
        date.setMonth(0)
        date.setDate(dayOfYear)
        return date
    }

    /**
     * @summary Set the hours to the given date.
     *
     * @description
     * Set the hours to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} hours - the hours of the new date
     * @returns {Date} the new date with the hours setted
     *
     * @example
     * // Set 4 hours to 1 September 2014 11:30:00:
     * var result = setHours(new Date(2014, 8, 1, 11, 30), 4)
     * //=> Mon Sep 01 2014 04:30:00
     */
    setHours(dirtyDate, dirtyHours) {
        var date = this.parse(dirtyDate)
        var hours = Number(dirtyHours)
        date.setHours(hours)
        return date
    }



    /**
     * @summary Set the day of the ISO week to the given date.
     *
     * @description
     * Set the day of the ISO week to the given date.
     * ISO week starts with Monday.
     * 7 is the index of Sunday, 1 is the index of Monday etc.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} day - the day of the ISO week of the new date
     * @returns {Date} the new date with the day of the ISO week setted
     *
     * @example
     * // Set Sunday to 1 September 2014:
     * var result = setISODay(new Date(2014, 8, 1), 7)
     * //=> Sun Sep 07 2014 00:00:00
     */
    setISODay(dirtyDate, dirtyDay) {
        var date = this.parse(dirtyDate)
        var day = Number(dirtyDay)
        var currentDay = getISODay(date)
        var diff = day - currentDay
        return this.addDays(date, diff)
    }


    /**
     * @summary Set the ISO week to the given date.
     *
     * @description
     * Set the ISO week to the given date, saving the weekday number.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} isoWeek - the ISO week of the new date
     * @returns {Date} the new date with the ISO week setted
     *
     * @example
     * // Set the 53rd ISO week to 7 August 2004:
     * var result = setISOWeek(new Date(2004, 7, 7), 53)
     * //=> Sat Jan 01 2005 00:00:00
     */
    setISOWeek(dirtyDate, dirtyISOWeek) {
        var date = this.parse(dirtyDate)
        var isoWeek = Number(dirtyISOWeek)
        var diff = this.getISOWeek(date) - isoWeek
        date.setDate(date.getDate() - diff * 7)
        return date
    }


    /**
     * @summary Return the start of an ISO week-numbering year for the given date.
     *
     * @description
     * Return the start of an ISO week-numbering year,
     * which always starts 3 days before the year's first Thursday.
     * The result will be in the local timezone.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the start of an ISO year
     *
     * @example
     * // The start of an ISO week-numbering year for 2 July 2005:
     * var result = startOfISOYear(new Date(2005, 6, 2))
     * //=> Mon Jan 03 2005 00:00:00
     */
    startOfISOYear(dirtyDate) {
        var year = this.getISOYear(dirtyDate)
        var fourthOfJanuary = new Date(0)
        fourthOfJanuary.setFullYear(year, 0, 4)
        fourthOfJanuary.setHours(0, 0, 0, 0)
        var date = this.startOfISOWeek(fourthOfJanuary)
        return date
    }


    /**
     * @summary Return the start of a minute for the given date.
     *
     * @description
     * Return the start of a minute for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the start of a minute
     *
     * @example
     * // The start of a minute for 1 December 2014 22:15:45.400:
     * var result = startOfMinute(new Date(2014, 11, 1, 22, 15, 45, 400))
     * //=> Mon Dec 01 2014 22:15:00
     */
    startOfMinute(dirtyDate) {
        var date = this.parse(dirtyDate)
        date.setSeconds(0, 0)
        return date
    }


    /**
     * @category Month Helpers
     * @summary Return the start of a month for the given date.
     *
     * @description
     * Return the start of a month for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the start of a month
     *
     * @example
     * // The start of a month for 2 September 2014 11:55:00:
     * var result = startOfMonth(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Mon Sep 01 2014 00:00:00
     */
    startOfMonth(dirtyDate) {
        var date = this.parse(dirtyDate)
        date.setDate(1)
        date.setHours(0, 0, 0, 0)
        return date
    }


    /**
     * @summary Return the start of a year quarter for the given date.
     *
     * @description
     * Return the start of a year quarter for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the start of a quarter
     *
     * @example
     * // The start of a quarter for 2 September 2014 11:55:00:
     * var result = startOfQuarter(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Jul 01 2014 00:00:00
     */
    startOfQuarter(dirtyDate) {
        var date = this.parse(dirtyDate)
        var currentMonth = date.getMonth()
        var month = currentMonth - currentMonth % 3
        date.setMonth(month, 1)
        date.setHours(0, 0, 0, 0)
        return date
    }


    /**
     * @summary Return the start of a second for the given date.
     *
     * @description
     * Return the start of a second for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @returns {Date} the start of a second
     *
     * @example
     * // The start of a second for 1 December 2014 22:15:45.400:
     * var result = startOfSecond(new Date(2014, 11, 1, 22, 15, 45, 400))
     * //=> Mon Dec 01 2014 22:15:45.000
     */
    startOfSecond(dirtyDate) {
        var date = this.parse(dirtyDate)
        date.setMilliseconds(0)
        return date
    }


    /**
     * @summary Return the start of today.
     *
     * @description
     * Return the start of today.
     *
     * @returns {Date} the start of today
     *
     * @example
     * // If today is 6 October 2014:
     * var result = startOfToday()
     * //=> Mon Oct 6 2014 00:00:00
     */
    startOfToday() {
        return this.startOfDay(new Date())
    }


    /**
     * @summary Return the start of tomorrow.
     *
     * @description
     * Return the start of tomorrow.
     *
     * @returns {Date} the start of tomorrow
     *
     * @example
     * // If today is 6 October 2014:
     * var result = startOfTomorrow()
     * //=> Tue Oct 7 2014 00:00:00
     */
    startOfTomorrow() {
        var now = new Date()
        var year = now.getFullYear()
        var month = now.getMonth()
        var day = now.getDate()

        var date = new Date(0)
        date.setFullYear(year, month, day + 1)
        date.setHours(0, 0, 0, 0)
        return date
    }


    /**
     * @summary Return the start of a week for the given date.
     *
     * @description
     * Return the start of a week for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @param {Object} [options] - the object with options
     * @param {Number} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Date} the start of a week
     *
     * @example
     * // The start of a week for 2 September 2014 11:55:00:
     * var result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Sun Aug 31 2014 00:00:00
     *
     * @example
     * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
     * var result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), {weekStartsOn: 1})
     * //=> Mon Sep 01 2014 00:00:00
     */
    startOfWeek(dirtyDate, dirtyOptions) {
        var weekStartsOn = dirtyOptions ? (Number(dirtyOptions.weekStartsOn) || 0) : 0

        var date = this.parse(dirtyDate)
        var day = date.getDay()
        var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn

        date.setDate(date.getDate() - diff)
        date.setHours(0, 0, 0, 0)
        return date
    }

    /**
     * @summary Return the start of yesterday.
     *
     * @description
     * Return the start of yesterday.
     *
     * @returns {Date} the start of yesterday
     *
     * @example
     * // If today is 6 October 2014:
     * var result = startOfYesterday()
     * //=> Sun Oct 5 2014 00:00:00
     */
    startOfYesterday() {
        var now = new Date()
        var year = now.getFullYear()
        var month = now.getMonth()
        var day = now.getDate()

        var date = new Date(0)
        date.setFullYear(year, month, day - 1)
        date.setHours(0, 0, 0, 0)
        return date
    }

    /**
     * @name startOfDay
     * @category Day Helpers
     * @summary Return the start of a day for the given date.
     *
     * @description
     * Return the start of a day for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|String|Number} date - the original date
     * @param {Options} [options] - the object with options. See [Options]
     * @param {0|1|2} [options.additionalDigits=2] - passed to `parse`. See [parse]
     * @returns {Date} the start of a day
     * @throws {TypeError} 1 argument required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // The start of a day for 2 September 2014 11:55:00:
     * var result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 02 2014 00:00:00
     */
    startOfDay(dirtyDate, dirtyOptions) {
        if (arguments.length < 1) {
            throw new TypeError('1 argument required, but only ' + arguments.length + ' present')
        }

        var date = this.parse(dirtyDate, dirtyOptions)
        date.setHours(0, 0, 0, 0)
        return date
    }

    /**
     * @summary Subtract the specified number of days from the given date.
     *
     * @description
     * Subtract the specified number of days from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of days to be subtracted
     * @returns {Date} the new date with the days subtracted
     *
     * @example
     * // Subtract 10 days from 1 September 2014:
     * var result = subDays(new Date(2014, 8, 1), 10)
     * //=> Fri Aug 22 2014 00:00:00
     */
    subDays(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addDays(dirtyDate, -amount)
    }

    /**
     * @summary Subtract the specified number of hours from the given date.
     *
     * @description
     * Subtract the specified number of hours from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of hours to be subtracted
     * @returns {Date} the new date with the hours subtracted
     *
     * @example
     * // Subtract 2 hours from 11 July 2014 01:00:00:
     * var result = subHours(new Date(2014, 6, 11, 1, 0), 2)
     * //=> Thu Jul 10 2014 23:00:00
     */
    subHours(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addHours(dirtyDate, -amount)
    }


    /**
     * @summary Subtract the specified number of ISO week-numbering years from the given date.
     *
     * @description
     * Subtract the specified number of ISO week-numbering years from the given date.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of ISO week-numbering years to be subtracted
     * @returns {Date} the new date with the ISO week-numbering years subtracted
     *
     * @example
     * // Subtract 5 ISO week-numbering years from 1 September 2014:
     * var result = subISOYears(new Date(2014, 8, 1), 5)
     * //=> Mon Aug 31 2009 00:00:00
     */
    subISOYears(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addISOYears(dirtyDate, -amount)
    }


    /**
     * @summary Subtract the specified number of milliseconds from the given date.
     *
     * @description
     * Subtract the specified number of milliseconds from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be subtracted
     * @returns {Date} the new date with the milliseconds subtracted
     *
     * @example
     * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
     * var result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:29.250
     */
    subMilliseconds(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addMilliseconds(dirtyDate, -amount)
    }

    /**
     * @summary Subtract the specified number of minutes from the given date.
     *
     * @description
     * Subtract the specified number of minutes from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of minutes to be subtracted
     * @returns {Date} the new date with the mintues subtracted
     *
     * @example
     * // Subtract 30 minutes from 10 July 2014 12:00:00:
     * var result = subMinutes(new Date(2014, 6, 10, 12, 0), 30)
     * //=> Thu Jul 10 2014 11:30:00
     */
    subMinutes(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addMinutes(dirtyDate, -amount)
    }

    /**
     * @summary Subtract the specified number of months from the given date.
     *
     * @description
     * Subtract the specified number of months from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of months to be subtracted
     * @returns {Date} the new date with the months subtracted
     *
     * @example
     * // Subtract 5 months from 1 February 2015:
     * var result = subMonths(new Date(2015, 1, 1), 5)
     * //=> Mon Sep 01 2014 00:00:00
     */
    subMonths(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addMonths(dirtyDate, -amount)
    }

    /**
     * @summary Subtract the specified number of year quarters from the given date.
     *
     * @description
     * Subtract the specified number of year quarters from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of quarters to be subtracted
     * @returns {Date} the new date with the quarters subtracted
     *
     * @example
     * // Subtract 3 quarters from 1 September 2014:
     * var result = subQuarters(new Date(2014, 8, 1), 3)
     * //=> Sun Dec 01 2013 00:00:00
     */
    subQuarters(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addQuarters(dirtyDate, -amount)
    }



    /**
     * @summary Subtract the specified number of seconds from the given date.
     *
     * @description
     * Subtract the specified number of seconds from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of seconds to be subtracted
     * @returns {Date} the new date with the seconds subtracted
     *
     * @example
     * // Subtract 30 seconds from 10 July 2014 12:45:00:
     * var result = subSeconds(new Date(2014, 6, 10, 12, 45, 0), 30)
     * //=> Thu Jul 10 2014 12:44:30
     */
    subSeconds(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addSeconds(dirtyDate, -amount)
    }

    /**
     * @category Week Helpers
     * @summary Subtract the specified number of weeks from the given date.
     *
     * @description
     * Subtract the specified number of weeks from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of weeks to be subtracted
     * @returns {Date} the new date with the weeks subtracted
     *
     * @example
     * // Subtract 4 weeks from 1 September 2014:
     * var result = subWeeks(new Date(2014, 8, 1), 4)
     * //=> Mon Aug 04 2014 00:00:00
     */
    subWeeks(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addWeeks(dirtyDate, -amount)
    }

    /**
     * @summary Subtract the specified number of years from the given date.
     *
     * @description
     * Subtract the specified number of years from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of years to be subtracted
     * @returns {Date} the new date with the years subtracted
     *
     * @example
     * // Subtract 5 years from 1 September 2014:
     * var result = subYears(new Date(2014, 8, 1), 5)
     * //=> Tue Sep 01 2009 00:00:00
     */
    subYears(dirtyDate, dirtyAmount) {
        var amount = Number(dirtyAmount)
        return this.addYears(dirtyDate, -amount)
    }



    buildFormattingTokensRegExp(formatters) {
        var formatterKeys = []
        for (var key in formatters) {
            if (formatters.hasOwnProperty(key)) {
                formatterKeys.push(key)
            }
        }

        var formattingTokens = commonFormatterKeys
            .concat(formatterKeys)
            .sort()
            .reverse()
        var formattingTokensRegExp = new RegExp(
            '(\\[[^\\[]*\\])|(\\\\)?' + '(' + formattingTokens.join('|') + '|.)', 'g'
        )

        return formattingTokensRegExp
    }


    buildDistanceInWordsLocale() {
        var distanceInWordsLocale = {
            lessThanXSeconds: {
                one: 'menos de um segundo',
                other: 'menos de {{count}} segundos'
            },

            xSeconds: {
                one: '1 segundo',
                other: '{{count}} segundos'
            },

            halfAMinute: 'meio minuto',

            lessThanXMinutes: {
                one: 'menos de um minuto',
                other: 'menos de {{count}} minutos'
            },

            xMinutes: {
                one: '1 minuto',
                other: '{{count}} minutos'
            },

            aboutXHours: {
                one: 'aproximadamente 1 hora',
                other: 'aproximadamente {{count}} horas'
            },

            xHours: {
                one: '1 hora',
                other: '{{count}} horas'
            },

            xDays: {
                one: '1 dia',
                other: '{{count}} dias'
            },

            aboutXMonths: {
                one: 'aproximadamente 1 mês',
                other: 'aproximadamente {{count}} meses'
            },

            xMonths: {
                one: '1 mês',
                other: '{{count}} meses'
            },

            aboutXYears: {
                one: 'aproximadamente 1 ano',
                other: 'aproximadamente {{count}} anos'
            },

            xYears: {
                one: '1 ano',
                other: '{{count}} anos'
            },

            overXYears: {
                one: 'mais de 1 ano',
                other: 'mais de {{count}} anos'
            },

            almostXYears: {
                one: 'quase 1 ano',
                other: 'quase {{count}} anos'
            }
        }

        function localize(token, count, options) {
            options = options || {}

            var result
            if (typeof distanceInWordsLocale[token] === 'string') {
                result = distanceInWordsLocale[token]
            } else if (count === 1) {
                result = distanceInWordsLocale[token].one
            } else {
                result = distanceInWordsLocale[token].other.replace('{{count}}', count)
            }

            if (options.addSuffix) {
                if (options.comparison > 0) {
                    return 'daqui a ' + result
                } else {
                    return 'há ' + result
                }
            }

            return result
        }

        return {
            localize: localize
        }
    }

    buildFormatLocale() {
        var months3char = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
        var monthsFull = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
        var weekdays2char = ['do', 'se', 'te', 'qa', 'qi', 'se', 'sa']
        var weekdays3char = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
        var weekdaysFull = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
        var meridiemUppercase = ['AM', 'PM']
        var meridiemLowercase = ['am', 'pm']
        var meridiemFull = ['a.m.', 'p.m.']

        var formatters = {
            // Month: Jan, Feb, ..., Dec
            'MMM': function (date) {
                return months3char[date.getMonth()]
            },

            // Month: January, February, ..., December
            'MMMM': function (date) {
                return monthsFull[date.getMonth()]
            },

            // Day of week: Su, Mo, ..., Sa
            'dd': function (date) {
                return weekdays2char[date.getDay()]
            },

            // Day of week: Sun, Mon, ..., Sat
            'ddd': function (date) {
                return weekdays3char[date.getDay()]
            },

            // Day of week: Sunday, Monday, ..., Saturday
            'dddd': function (date) {
                return weekdaysFull[date.getDay()]
            },

            // AM, PM
            'A': function (date) {
                return (date.getHours() / 12) >= 1 ? meridiemUppercase[1] : meridiemUppercase[0]
            },

            // am, pm
            'a': function (date) {
                return (date.getHours() / 12) >= 1 ? meridiemLowercase[1] : meridiemLowercase[0]
            },

            // a.m., p.m.
            'aa': function (date) {
                return (date.getHours() / 12) >= 1 ? meridiemFull[1] : meridiemFull[0]
            }
        }

        // Generate ordinal version of formatters: M -> Mo, D -> Do, etc.
        var ordinalFormatters = ['M', 'D', 'DDD', 'd', 'Q', 'W']
        ordinalFormatters.forEach(function (formatterToken) {
            formatters[formatterToken + 'o'] = function (date, formatters) {
                return this.ordinal(formatters[formatterToken](date))
            }
        })

        return {
            formatters: formatters,
            formattingTokensRegExp: this.buildFormattingTokensRegExp(formatters)
        }
    }

    ordinal(number) {
        return number + 'º'
    }

    _isInteger(val) {
        var digits = "1234567890";
        for (var i = 0; i < val.length; i++) {
            if (digits.indexOf(val.charAt(i)) == -1) { return false; }
        }
        return true;
    }
    _getInt(str, i, minlength, maxlength) {
        for (var x = maxlength; x >= minlength; x--) {
            var token = str.substring(i, i + x);
            if (token.length < minlength) { return null; }
            if (this._isInteger(token)) { return token; }
        }
        return null;
    }

    parseDateWithFormat(value, format) {
        if (!value){
            return 0;
        }
        value = value + "";
        format = format + "";
        var i_val = 0;
        var i_format = 0;
        var c = "";
        var token = "";
        var token2 = "";
        var x, y;
        var now = new Date();
        var year = now.getYear();
        var month = now.getMonth() + 1;
        var date = 1;
        var hh = 0;
        var mm = 0;
        var ss = 0;
        var ms = 0;
        var ampm = "";

        while (i_format < format.length) {
            // Get next token from format string
            c = format.charAt(i_format);
            token = "";
            while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
            }
            // Extract contents of value based on format token
            if (token.toLowerCase() == "yyyy" || token.toLowerCase() == "yy" || token.toLowerCase() == "y") {
                if (token.toLowerCase() == "yyyy") { x = 4; y = 4; }
                if (token.toLowerCase() == "yy") { x = 2; y = 2; }
                if (token.toLowerCase() == "y") { x = 2; y = 4; }
                year = this._getInt(value, i_val, x, y);
                if (year == null) { return 0; }
                i_val += year.length;
                if (year.length == 2) {
                    if (year > 70) { year = 1900 + (year - 0); }
                    else { year = 2000 + (year - 0); }
                }
            }
            else if (token == "MMM" || token == "NNN") {
                month = 0;
                for (var i = 0; i < MONTH_NAMES.length; i++) {
                    var month_name = MONTH_NAMES[i];
                    if (value.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
                        if (token == "MMM" || (token == "NNN" && i > 11)) {
                            month = i + 1;
                            if (month > 12) { month -= 12; }
                            i_val += month_name.length;
                            break;
                        }
                    }
                }
                if ((month < 1) || (month > 12)) { return 0; }
            }
            else if (token == "EE" || token == "E") {
                for (var i = 0; i < DAY_NAMES.length; i++) {
                    var day_name = DAY_NAMES[i];
                    if (value.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                        i_val += day_name.length;
                        break;
                    }
                }
            }
            else if (token == "MM" || token == "M") {
                month = this._getInt(value, i_val, token.length, 2);
                if (month == null || (month < 1) || (month > 12)) { return 0; }
                i_val += month.length;
            }
            else if (token.toLowerCase() == "dd" || token.toLowerCase() == "d") {
                date = this._getInt(value, i_val, token.length, 2);
                if (date == null || (date < 1) || (date > 31)) { return 0; }
                i_val += date.length;
            }
            else if (token == "hh" || token == "h") {
                hh = this._getInt(value, i_val, token.length, 2);
                if (hh == null || (hh < 1) || (hh > 12)) { return 0; }
                i_val += hh.length;
            }
            else if (token == "HH" || token == "H") {
                hh = this._getInt(value, i_val, token.length, 2);
                if (hh == null || (hh < 0) || (hh > 23)) { return 0; }
                i_val += hh.length;
            }
            else if (token == "KK" || token == "K") {
                hh = this._getInt(value, i_val, token.length, 2);
                if (hh == null || (hh < 0) || (hh > 11)) { return 0; }
                i_val += hh.length;
            }
            else if (token == "kk" || token == "k") {
                hh = this._getInt(value, i_val, token.length, 2);
                if (hh == null || (hh < 1) || (hh > 24)) { return 0; }
                i_val += hh.length; hh--;
            }
            else if (token == "mm" || token == "m") {
                mm = this._getInt(value, i_val, token.length, 2);
                if (mm == null || (mm < 0) || (mm > 59)) { return 0; }
                i_val += mm.length;
            }
            else if (token == "ss" || token == "s") {
                ss = this._getInt(value, i_val, token.length, 2);
                if (ss == null || (ss < 0) || (ss > 59)) { return 0; }
                i_val += ss.length;
            }
            else if (token == "SSS" || token == "sss") {
                ms = this._getInt(value, i_val, token.length, 3);
                if (ms == null || (ms < 0) || (ms > 999)) { return 0; }
                i_val += ms.length;
            }
            else if (token == "a") {
                if (value.substring(i_val, i_val + 2).toLowerCase() == "am") { ampm = "AM"; }
                else if (value.substring(i_val, i_val + 2).toLowerCase() == "pm") { ampm = "PM"; }
                else { return 0; }
                i_val += 2;
            }
            else {
                if (value.substring(i_val, i_val + token.length) != token) { return 0; }
                else { i_val += token.length; }
            }
        }
        // If there are any trailing characters left in the value, it doesn't match
        if (i_val != value.length) { return 0; }
        // Is date valid for month?
        if (month == 2) {
            // Check for leap year
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) { // leap year
                if (date > 29) { return 0; }
            }
            else { if (date > 28) { return 0; } }
        }
        if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
            if (date > 30) { return 0; }
        }
        // Correct hours value
        if (hh < 12 && ampm == "PM") { hh = hh - 0 + 12; }
        else if (hh > 11 && ampm == "AM") { hh -= 12; }
        var newdate = new Date(year, month - 1, date, hh, mm, ss, ms);
        return newdate;
    }




    buildFormattingTokensRegExp(formatters) {
        var formatterKeys = []
        for (var key in formatters) {
            if (formatters.hasOwnProperty(key)) {
                formatterKeys.push(key)
            }
        }

        var formattingTokens = commonFormatterKeys
            .concat(formatterKeys)
            .sort()
            .reverse()
        var formattingTokensRegExp = new RegExp(
            '(\\[[^\\[]*\\])|(\\\\)?' + '(' + formattingTokens.join('|') + '|.)', 'g'
        )

        return formattingTokensRegExp
    }


    
}



const instance = new AnterosDateUtils();
export { instance as AnterosDateUtils };