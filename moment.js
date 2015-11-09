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
            var hours = this.date.getHours() + this.timezone;
            if (hours < 10) {
                hours = '0' + hours;
            }
            var minutes = this.date.getMinutes();
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            var dayOfWeek = daysOfWeek[this.date.getDay()];
            pattern = pattern.replace(/%DD/g, dayOfWeek);
            pattern = pattern.replace(/%HH/g, hours);
            pattern = pattern.replace(/%MM/g, minutes);
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var delta = (Number(date) - Number(moment));
            delta /= 3600; //кол-во минут
            var days = Math.floor(delta / 60 / 24);
            var hours = Math.floor(delta / 60) - 24 * days;
            var minutes = delta - hours;
            var result = 'Осталось дней: ' + days;
            result += '\nОсталось часов: ' + hours;
            result += '\nОсталось минут: ' + minutes;
            return result;
        }
    };
};
