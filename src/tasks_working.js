/* global define, Element */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.TasksHolder = factory;
    }
}(this, function (Utils, options, Project) {
    'use strict';
    var tasksByIds = {},
            tasks = [],
            linkType = {
                0: 'FF',
                1: 'FS',
                2: 'SF',
                3: 'SS'
            },
    type = {0: 'Task', 1: 'Resource', 2: 'Other'},
    active = {'0': false, '1': true, true: '1', false: '0'},
    constraintType = {
        0: 'As Soon As Possible',
        1: 'As Late As Possible',
        2: 'Must Start On',
        3: 'Must Finish On',
        4: 'Start No Earlier Than',
        5: 'Start No Later Than',
        6: 'Finish No Earlier Than',
        7: 'Finish No Later Than'
    };

    function newTask(task) {
        var open = true, div, x1, y1, x2, y2, visible = true, parentTask,
                dependents = [], dependentsType = [], rowTr;
        return {
            getUID: function () {
                return task.UID;
            },
            getID: function () {
                return task.ID;
            },
            getName: function () {
                return task.Name;
            },
            isActive: function () {
                return active[task.Active];
            },
            isManual: function () {
                return active[task.Manual];
            },
            isNull: function () {
                return active[task.IsNull];
            },
            getCreateDate: function () {
                return Utils.toDate(task.CreatedDate);
            },
            getWBS: function () {
                return task.WBS;
            },
            getOutLineNumber: function () {
                return task.OutlineNumber;
            },
            getOutlineLevel: function () {
                return task.OutlineLevel;
            },
            getPriority: function () {
                return task.Priority;
            },
            getStart: function () {
                return Utils.toDate(task.Start);
            },
            getFinish: function () {
                return Utils.toDate(task.Finish);
            },
            getDuration: function (format) {
                //TODO will add lang support
                if (active[task.Milestone]) {
                    return '-';
                } else {
                    var duration, start = this.getStart(),
                            end = new Date(this.getFinish().getTime());
                    if ((end.getTime() - (end.getTimezoneOffset() * 60000)) % 86400000 === 0) {
                        end = end.setDate(end.getDate() + 1);
                    }

                    switch (format) {
                        case 'week':
                            duration = Utils.getOffset(start, end, 999, 'day') + ' Weeks';
                            break;

                        case 'month':
                            duration = Utils.getOffset(start, end, 999, 'week') + ' Months';
                            break;
                        case 'quarter':
                            duration = Utils.getOffset(start, end, 999, 'month') + ' Qtrs';
                            break;
                        case 'day':
                            duration = Utils.getOffset(start, end, 999, 'month') + ' Days';
                            break;
                        default:
                            duration = Utils.getOffset(start, end, 999, 'hour') + ' Hr';
                            break;
                    }
                    return duration;
                }
            },
            getDurationFormat: function () {
                return options.durationFormat[Utils.toTypr(task.DurationFormat)];
            },
            getManualFinish: function () {
                return Utils.toDate(task.ManualFinish);
            },
            isMilestone: function () {
                return active[Utils.toType(task.Milestone)];
            },
            isSummary: function () {
                return active[Utils.toType(task.Summary)];
            },
            isCritical: function () {
                return active[Utils.toType(task.Critical)];
            },
            getActualStart: function () {
                return Utils.toDate(task.ActualStart);
            },
            getActualDuration: function () {
                var ad = task.ActualDuration.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
            },
            getActualWork: function () {
                var ad = task.ActualWork.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
            },
            getRegularWork: function () {
                var ad = task.RegularWork.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
            },
            getRemainingDuration: function () {
                var ad = task.RemainingDuration.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
            },
            getRemainingWork: function () {
                var ad = task.RemainingWork.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
            },
            getConstraintType: function () {
                return constraintType[Utils.toType(task.ConstraintType)];
            },
            getCalendarUID: function () {
                return task.CalendarUID;
            },
            getPercentComplete: function () {
                return (task.PercentComplete || 0) + '%';
            },
            getPercentWorkComplete: function () {
                return (task.PercentWorkComplete || 0) + '%';
            },
            getPredecessorLink: function () {
                var pl = task.PredecessorLink || [],
                        plStr = [];
                if (Utils.isArray(pl)) {
                    for (var i = 0; i < pl.length; i++) {
                        plStr.push(pl[i].PredecessorUID + linkType[pl[i].Type * 1]);
                        dependents.push(pl[i].PredecessorUID);
                        dependentsType.push(linkType[pl[i].Type * 1]);
                    }
                } else if (pl) {
                    plStr.push(pl.PredecessorUID + linkType[pl.Type * 1]);
                    dependents.push(pl.PredecessorUID);
                    dependentsType.push(linkType[pl.Type * 1]);
                }
                return plStr.join(',');
            },
            getDepend: function () {
                if (dependents.length === 0) {
                    this.getPredecessorLink();
                }
                return dependents;
            },
            getDependType: function () {
                return dependentsType;
            },
            isOpen: function () {
                return open;
            },
            getParent: function () {
                return task.Parent;
            },
            toJson: function () {
                return task;
            },
            getIndex: function () {
                return task.Indexed;
            },
            getResource: function () {
                if (task.Resources) {
                    return task.Resources;
                } else {
                    var a = Project.getAssignments(),
                            r = Project.getResources(),
                            uid = task.UID,
                            resources = '';
                    var res = a.getTaskResources(uid);
                    if (!res) {
                        return  String.fromCharCode(160)
                    }
                    for (var i = 0; i < res.length; i++) {
                        var rs = r.getResourceByUID(res[i]);
                        resources += rs ? rs.getName() : '';
                    }
                    return resources || String.fromCharCode(160);
                }
            },
            setParentDiv: function (par) {
                div = par;
                return this;
            },
            getClass: function () {
                return (task.PredecessorLink && task.PredecessorLink.length > 0) ? 'group' : 'task';
            },
            getColor: function () {
                return task.Color || Utils.getRandomColor();
            },
            setStartX: function (x) {
                x1 = x * 1;
                return this;
            },
            setStartY: function (y) {
                y1 = y * 1;
                return this;
            },
            setEndX: function (x) {
                x2 = x * 1;
                return this;
            },
            setEndY: function (y) {
                y2 = y * 1;
                return this;
            },
            setVisible: function (v) {
                visible = v;
                return this;
            },
            setParentTask: function (parent) {
                if (this.equals(parent)) {
                    parentTask = parent;
                }
                return this;
            },
            setRowTr: function (tr) {
                if (tr) {
                    rowTr = tr;
                }
                return this;
            },
            getRowTr: function () {
                return rowTr;
            },
            getStartX: function () {
                return x1;
            },
            getStartY: function () {
                return y1;
            },
            getEndX: function () {
                return x2;
            },
            getEndY: function () {
                return y2;
            },
            getVisible: function () {
                return visible;
            },
            getParentTask: function () {
                return parentTask;
            }
        };
    }
    return {
        getTaskById: function (id) {
            return id >= 0 ? tasksByIds[id] : undefined;
        },
        createTask: function (json) {
            if (!json.id || !tasksByIds[json.id]) {
                throw new Error('Can\'t create task without unique id');
            }
            var task = newTask(json);
            tasksByIds[json.id] = task;
            tasks.push(task);
            return task;
        },
        getTasks: function () {
            return tasks.concat(); //return only copy
        },
        getSize: function () {
            return tasks.length;
        },
        removeTaskById: function (id) {
            if (id >= 0 && tasksByIds[id]) {
                delete tasksByIds[id];
                var i = 0, len = tasks.length;
                for (; i < len; i += 1) {
                    if (tasks[i].id === id) {
                        tasks.slice(i, 1);
                        break;
                    }
                }
            }
        },
        removeTask: function (task) {
            if (task && task.id) {
                this.removeTaskById(task.id);
            }
        },
        addTasks: function (ja) {
            if (ja && Object.prototype.toString.call(ja) === '[object Array]') {
                var i = 0, len = ja.length;
                for (; i < len; i += 1) {
                    this.createTask(ja[i]);
                }
            }
        }
    };
}));