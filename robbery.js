'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var obj = JSON.parse(json);
    var shedule = getTimeInMinutesFromStartThisWeek(obj);
    var bankDateTime = getBankDateTime(workingHours);
    var bankShedule = getTimeInMinutesFromStartThisWeek(bankDateTime);
    var mergeTime = getMergeTime(shedule);
    var possibleTime = getPossibleTime(mergeTime, bankShedule);
    fillMoment(possibleTime, appropriateMoment, workingHours);
    return appropriateMoment;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }
    return 'Ограбление уже идёт!';
};

function getTimeInMinutesFromStartThisWeek(obj) {
    for (var person in obj) {
        var timing = obj[person];
        for (var i = 0; i < timing.length; i++) {
            timing[i].from = parseTime(timing[i].from);
            timing[i].to = parseTime(timing[i].to);
        }
    }
    return obj;
}

function parseTime(dateTime) {
    if (dateTime.length < 10) {
        dateTime = 'ПН ' + dateTime;
    }
    var dayOfWeek = getIndexOfDayInWeek(dateTime.substr(0, 2));
    var timeFromStartWeek = getTime(dateTime);
    return (dayOfWeek * 24 * 60) + timeFromStartWeek;
}

function getTime(dateTime) {
    var hours = parseInt(dateTime.substr(3, 2)) * 60;
    var minutes = parseInt(dateTime.substr(6, 2));
    var delta = parseInt(dateTime.substr(8)) * 60;
    return hours + minutes - delta;
}

function getIndexOfDayInWeek(day) {
    switch (day){
        case 'ПН': {
            return 0;
        }
        case 'ВТ': {
            return 1;
        }
        case 'СР': {
            return 2;
        }
    }
}

function getMergeTime(shedule) {
    var timeLines = getSortedTimeLines(shedule);
    var prevLine = timeLines[0];
    var newLine = [prevLine];
    for (var i = 1; i < timeLines.length; i++) {
        if (timeLines[i].from <= prevLine.to) {
            if (prevLine.to >= timeLines[i].to) {
                continue;
            }
            newLine.pop();
            prevLine = { from: prevLine.from, to: timeLines[i].to };
            newLine.push(prevLine);
        } else {
            prevLine = timeLines[i];
            newLine.push(prevLine);
        }
    }
    return newLine;
}

function getSortedTimeLines(shedule) {
    var timeLines = [];
    for (var person in shedule) {
        var timing = shedule[person];
        for (var i = 0; i < timing.length; i++) {
            timeLines.push(timing[i]);
        }
    }
    timeLines.sort(function (obj1, obj2) {
        return obj1.from > obj2.from;
    });
    return timeLines;
}

function getBankDateTime(workingHours) {
    return {
        bank: [
            {
                from: 'ПН ' + workingHours.from,
                to: 'ПН ' + workingHours.to
            },
            {
                from: 'ВТ ' + workingHours.from,
                to: 'ВТ ' + workingHours.to
            },
            {
                from: 'СР ' + workingHours.from,
                to: 'СР ' + workingHours.to
            }
        ]
    };
}

function getPossibleTime(peopleTime, bankTime) {
    var shedule = bankTime.bank;
    for (var day = 0; day < shedule.length; day++) {
        if (shedule[day].from === shedule[day].to) {
            continue;
        }
        for (var i = 0; i < peopleTime.length; i++) {
            if (shedule[day].from <= peopleTime[i].from &&
                peopleTime[i].to <= shedule[day].to) {
                shedule.push({
                    from: peopleTime[i].to,
                    to: shedule[day].to
                });
                shedule[day] = {
                    from: shedule[day].from,
                    to: peopleTime[i].from
                };
                continue;
            }
            if (shedule[day].from >= peopleTime[i].from &&
                peopleTime[i].to >= shedule[day].from) {
                shedule[day] = {
                    from: peopleTime[i].to,
                    to: shedule[day].to
                };
                continue;
            }
            if (shedule[day].to >= peopleTime[i].from &&
                peopleTime[i].from >= shedule[day].from) {
                shedule[day] = {
                    from: shedule[day].from,
                    to: peopleTime[i].from
                };
                continue;
            }
            if (shedule[day].from >= peopleTime[i].from &&
                peopleTime[i].to >= shedule[day].to) {
                shedule[day] = { from: 0, to: 0 };
            }
        }
    }
    return getFirstTime(shedule);
}

function getFirstTime(shedule) {
    shedule.sort(function (obj1, obj2) {
        return obj1.from > obj2.from;
    });
    for (var i = 0; i < shedule.length; i++) {
        if (shedule[i].to - shedule[i].from >= 90) {
            return shedule[i].from;
        }
    }
    return -1;
}

function fillMoment(time, moment, bankTime) {
    moment.timezone = Number(bankTime.from.substr(5));
    var weekDay = Math.floor((time / 60) / 24);
    var hoursAndMins = (time / 60) - (weekDay * 24);
    var hours = Math.floor(hoursAndMins);
    var mins = hoursAndMins - hours;
    if (mins < 10) {
        mins = '0' + mins;
    }
    moment.date = new Date(2015, 10, weekDay + 9, hours, mins);
}
