'use strict';

module.exports = function (time) {
    if (time < 10) {
        return '0' + time;
    }
    return time;
};
