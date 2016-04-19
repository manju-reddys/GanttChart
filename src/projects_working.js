/* global define, Element */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.ProjectHolder = factory;
    }
}(this, function (Utils) {
    //Fiscal Year starting month. Values are
    var fyCodes = {
        1: 'january', 2: 'february', 3: 'march', 4: 'april', 5: 'may', 6: 'june', 7: 'july',
        8: 'august', 9: 'september', 10: 'october', 11: 'november', 12: 'december'
    },
    //The position of the currency symbol.
    currencySymbolPosition = {
        0: 'Before', 1: 'After', 2: 'Before With Space', 3: 'After with space'
    },
    durationFormat = {
        3: 'm', 4: 'em', 5: 'h', 6: 'eh', 7: 'd', 8: 'ed', 9: 'w', 10: 'ew', 11: 'mo', 12: 'emo', 19: '%',
        20: 'e%', 21: null, 35: 'm?', 36: 'em?', 37: 'h?', 38: 'eh?', 39: 'd?', 40: 'ed?', 41: 'w?', 42: 'ew?',
        43: 'mo?', 44: 'emo?', 51: '%?', 52: 'e%?', 53: null
    },
    defaultTaskType = {
        0: 'Fixed Units', 1: 'Fixed Duration', 2: 'Fixed Work'
    },
    defaultFixedCostAccrual = {
        1: 'Start', 2: 'Prorated', 3: 'End'
    },
    earnedValueMethod = {
        0: 'Percent Complete', 1: 'Physical Percent Complete'
    },
    //Start day of the week
    weekStartDay = {
        0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'
    },
    //The default date for new tasks start.
    newTaskStartDate = {
        0: 'Project Start Date', 1: 'Current Date'
    },
    //The default earned value method for tasks
    defaultTaskEVMethod = {
        0: 'Percent Complete', 1: 'Physical Percent Complete'
    },
    //The units used by Microsoft Project to display the standard rate
    rateFormat = {
        1: 'm', 2: 'h', 3: 'd', 4: 'w', 5: 'mo', 7: 'y', 8: 'material resource rate (or blank symbol specified)'
    };

    var options = {
        fyCodes: fyCodes,
        currencySymbolPosition: currencySymbolPosition,
        defaultTaskType: defaultTaskType,
        defaultFixedCostAccrual: defaultFixedCostAccrual,
        earnedValueMethod: earnedValueMethod,
        weekStartDay: weekStartDay,
        newTaskStartDate: newTaskStartDate,
        defaultTaskEVMethod: defaultTaskEVMethod,
        rateFormat: rateFormat,
        durationFormat: durationFormat
    };

    var project, calendars, taskHolder, resources, assignments, prjData;
    return {
        getOptions: function () {
            return options;
        },
        getName: function () {
            return project.Name;
        },
        getAuthor: function () {
            return project.Author;
        },
        getCreatedDate: function () {
            return Utils.toDate(project.CreatedDate);
        },
        getCalendars: function () {
            return calendars;
        },
        getMinutesPerDay: function () {
            return project.MinutesPerDay;
        },
        getMinutesPerWeek: function () {
            return project.MinutesPerWeek;
        },
        getHoursPerDay: function () {
            return this.getMinutesPerDay() / 60;
        },
        getHoursPerWeek: function () {
            return this.getMinutesPerWeek() / this.getMinutesPerDay();
        },
        getWeekStartDay: function () {
            return weekStartDay[project.WeekStartDay];
        },
        getFiscalStartDate: function () {
            return fyCodes[project.FYStartDate];
        },
        getProjectFinish: function () {
            return Utils.toData(project.FinishDate);
        },
        getProjectStart: function () {
            return Utils.toData(project.StartDate);
        },
        getResources: function () {
            return resources;
        },
        getTaskHolder: function () {
            return taskHolder;
        },
        getAssignments: function () {
            return assignments;
        },
        setProjectData: function (data) {
            resources = new Resources(Utils);
            if (resources && data.Resources && data.Resources.Resource) {
                resources.addResources(data.Resources.Resource);
            }
            assignments = new Assignments(Utils);
            if (assignments && data.Assignments && data.Assignments.Assignment) {
                assignments.addAssignments(data.Assignments.Assignment);
            }
            taskHolder = new TasksHolder(Utils, Object.assign(options), this);
            if (taskHolder && data.Tasks && data.Tasks.Task) {
                taskHolder.addTasks(data.Tasks.Task);
            }
            prjData = data;
        },
        getData: function () {
            return prjData;
        },
        load: function () {
            var self = this;
            $.get('/api/v2/project/data')
                    .done(function (data) {
                        data = JSON.parse(data);
                        self.setProjectData(data.Project);
                    })
                    .fail(function (err) {
                        console.log(err);
                    });
        }
    }
}));