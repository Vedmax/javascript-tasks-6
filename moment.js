'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
        timezone: null,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var daysOfWeek = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
            var dayOfWeek = daysOfWeek[this.date.getDay()];
            var hoursWithZone = this.date.getHours() + this.timezone;
            if (hoursWithZone < 0) {
                dayOfWeek = daysOfWeek[this.date.getDay() - 1];
                hoursWithZone += 24;
            }
            var hours = toTwoChars(hoursWithZone);
            var minutes = toTwoChars(this.date.getMinutes());
            pattern = replaceFormatedStrings(pattern, dayOfWeek, hours, minutes);
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            //кол-во минут
            var delta = (Date.getTime(this.date) - Date.getTime(moment)) / 3600;
            var days = Math.floor(delta / 60 / 24);
            var hours = Math.floor(delta / 60) - 24 * days;
            var minutes = delta - hours;
            var result = 'До ограбления ';
            result += getRemainTime(days, 'day');
            result += getRemainTime(hours, 'hour');
            result += getRemainTime(minutes, 'minute');
            return result;
        }
    };

    function toTwoChars(time) {
        if (time < 10) {
            return '0' + time;
        }
        return time;
    }

    function replaceFormatedStrings(pattern, dayOfWeek, hours, minutes) {
        pattern = pattern.substr(0, pattern.indexOf('%DD')) + dayOfWeek +
            pattern.substr(pattern.indexOf('%DD') + 3);
        pattern = pattern.substr(0, pattern.indexOf('%HH')) + hours +
            pattern.substr(pattern.indexOf('%HH') + 3);
        pattern = pattern.substr(0, pattern.indexOf('%MM')) + minutes +
            pattern.substr(pattern.indexOf('%MM') + 3);
        return pattern;
    }

    function getRemainTime(time, type) {
        if (time === 0) {
            return '';
        }
        var words = getRightWords(type);
        var remain = ['остался ', 'осталось ', 'осталась '];
        if (type === 'minute') {
            remain[0] = remain[2];
        }
        if (time % 10 === 1) {
            return remain[0] + time + words[0];
        }
        if ((time % 100 <= 20 && time % 100 >= 10) || time % 10 != 3 || time % 10 != 2) {
            return remain[1] + time + words[1];
        }
        return remain[1] + time + words[2];
    }

    function getRightWords(type) {
        var daysWords = ['день ', 'дней ', 'дня '];
        var hoursWords = ['час ', 'часов ', 'часа '];
        var minutesWords = ['минута ', 'минут ', 'минуты '];
        if (type === 'day') {
            return daysWords;
        } else if (type === 'hour') {
            return hoursWords;
        } else {
            return minutesWords;
        }
    }
};
