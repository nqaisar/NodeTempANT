// parse a date in yyyy-mm-dd format
module.exports = function parseDate(input) {
    var parts = input.split('-');
    // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]); // Note: months are 0-based
}