(function (root, task, assignment, resource, factory) {
    function init(t, a, r) {
        return root.GanttProject || (root.GanttProject = factory(t, a, r));
    }
    if (typeof define === "function" && define.amd) {
        // Now we're wrapping the factory and assigning the return
        // value to the root (window) and returning it as well to
        // the AMD loader.
        define([], function () {
            return init(task, assignment, resource);
        });
    } else if (typeof module === "object" && module.exports) {
        // I've not encountered a need for this yet, since I haven't
        // run into a scenario where plain modules depend on CommonJS
        // *and* I happen to be loading in a CJS browser environment
        // but I'm including it for the sake of being thorough
        module.exports = init(task, assignment, resource);
    } else {
        init(task, assignment, resource);
    }
}(this, GanttTask, GanttAssignment, GanttResource, function (Tasks, Assignments, Resources) {
    /**
     * Doc -> https://msdn.microsoft.com/en-us/library/office/aa210593(v=office.11).aspx
     */
    return function (Helper, Instance) {
        if (!Helper || !Instance) {
            throw Error('Missing required parameters -:: Helper or Instance');
        }
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

        var project, calendars, tasks, resources, assignments, prjData;
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
                return Helper.toDate(project.CreatedDate);
            },
            getCalendars: function () {
                return calendars;
            },
            getMinutesPerDay: function () {
                return Helper.toType(project.MinutesPerDay);
            },
            getMinutesPerWeek: function () {
                return Helper.toType(project.MinutesPerWeek);
            },
            getHoursPerDay: function () {
                return this.getMinutesPerDay() / 60;
            },
            getHoursPerWeek: function () {
                return this.getMinutesPerWeek() / this.getMinutesPerDay();
            },
            getWeekStartDay: function () {
                return weekStartDay[Helper.toType(project.WeekStartDay)];
            },

            getFiscalStartDate: function () {
                return fyCodes[Helper.toType(project.FYStartDate)];
            },
            getProjectFinish: function () {
                return Helper.toData(project.FinishDate);
            },

            getProjectStart: function () {
                return Helper.toData(project.StartDate);
            },
            getResources: function () {
                return resources;
            },
            getTasks: function () {
                return tasks;
            },
            getAssignments: function () {
                return assignments;
            },
            setProjectData: function (data) {
                resources = new Resources(Helper);
                if (resources && data.Resources && data.Resources.Resource && data.Resources.Resource.length > 0) {
                    resources.addResources(data.Resources.Resource);
                }
                assignments = new Assignments(Helper);
                if (assignments && data.Assignments && data.Assignments.Assignment && data.Assignments.Assignment.length > 0) {
                    assignments.addAssignments(data.Assignments.Assignment);
                }
                tasks = new Tasks(Helper, Instance, options, this);
                if (tasks && data.Tasks && data.Tasks.Task && data.Tasks.Task.length > 0) {
                    tasks.addTasks(data.Tasks.Task);
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
    }
}));