(function (root, task, assignment, resource, factory) {
    function init() {
        return root.GanttTask || (root.GanttTask = factory());
    }
    if (typeof define === "function" && define.amd) {
        // Now we're wrapping the factory and assigning the return
        // value to the root (window) and returning it as well to
        // the AMD loader.
        define([], function () {
            return init();
        });
    } else if (typeof module === "object" && module.exports) {
        // I've not encountered a need for this yet, since I haven't
        // run into a scenario where plain modules depend on CommonJS
        // *and* I happen to be loading in a CJS browser environment
        // but I'm including it for the sake of being thorough
        module.exports = init();
    } else {
        init();
    }
}(this, function () {
    //https://msdn.microsoft.com/en-us/library/office/aa210595(v=office.11).aspx

    return function (Helper, Instance, options, Project) {
        if (!Helper || !Instance) {
            throw Error('Missing required parameters -:: Helper or Instance');
        }

        var fixedCostAccrual = {1: 'Start', 2: 'Prorated', 3: 'End'},
            constraintType = {
                0: 'As Soon As Possible',
                1: 'As Late As Possible',
                2: 'Must Start On',
                3: 'Must Finish On',
                4: 'Start No Earlier Than',
                5: 'Start No Later Than',
                6: 'Finish No Earlier Than',
                7: 'Finish No Later Than'
            },
            linkType = {
                0: 'FF',
                1: 'FS',
                2: 'SF',
                3: 'SS'
            },
            type = {0: 'Task', 1: 'Resource', 2: 'Other'},
            active = {'0': false, '1': true, true: '1', false: '0'},
            config = Instance.getConfig();

        var indexedTasks = {}, allTasks = [];

        /**
         * Set task parent
         */
        function process() {
            if(allTasks.length > 1) {
                var i = 0, count = allTasks.length, parentIds = {};
                for(; i < count; i++) {
                    var task = allTasks[i],
                        oln = task.getOutLineNumber(),
                        dot = oln.lastIndexOf('.');
                    if(dot > -1) {
                        task.setParentTask(indexedTasks[parentIds[oln.substr(0, dot)]]);
                    }
                    parentIds[oln] = task.getID();
                }
            }
        }

        return {
            newTask: function(task) {
                var open = true, div, x1, y1, x2, y2, visible = true, parentTask,
                    dependents = [], dependentsType = [], rowTr;
                return {
                    getUID: function() {
                        return task.UID;
                    },
                    getID: function() {
                        return task.ID;
                    },
                    getName: function() {
                        return task.Name;
                    },
                    isActive: function() {
                        return active[Helper.toType(task.Active)];
                    },
                    isManual: function() {
                        return active[Helper.toType(task.Manual)];
                    },
                    isNull: function() {
                        return active[Helper.toType(task.IsNull)];
                    },
                    getCreateDate: function() {
                        return Helper.toDate(task.CreatedDate);
                    },
                    getWBS: function() {
                        return task.WBS;
                    },
                    getOutLineNumber: function() {
                        return task.OutlineNumber;
                    },
                    getOutlineLevel: function() {
                        return Helper.toType(task.OutlineLevel);
                    },
                    getPriority: function() {
                        return task.Priority;
                    },
                    getStart: function() {
                        return Helper.toDate(task.Start);
                    },
                    getFinish: function() {
                        return Helper.toDate(task.Finish);
                    },
                    getDuration: function() {
                        //TODO will add lang support
                        if(active[Helper.toType(task.Milestone)]) {
                            return '-';
                        } else {
                            var format = Instance.getView(),
                                duration, start = this.getStart(),
                                end = new Date(this.getFinish().getTime());
                            if ((end.getTime() - (end.getTimezoneOffset() * 60000)) % 86400000 === 0) {
                                end = Helper.toDate(end.setDate(end.getDate() + 1));
                            }

                            switch(format) {
                                case 'week':
                                    duration = Helper.getOffset(start, end, 999, 'day') + ' Weeks';
                                    break;

                                case 'month':
                                    duration = Helper.getOffset(start, end, 999, 'week') + ' Months';
                                    break;
                                case 'quarter':
                                    duration = Helper.getOffset(start, end, 999, 'month') + ' Qtrs';
                                    break;
                                case 'day':
                                    duration = Helper.getOffset(start, end, 999, 'month') + ' Days';
                                    break;
                                default:
                                    duration = Helper.getOffset(start, end, 999, 'hour') + ' Hr';
                                    break;
                            }
                            return duration;
                        }
                    },
                    getDurationFormat: function() {
                        return options.durationFormat[Helper.toTypr(task.DurationFormat)];
                    },
                    getManualFinish: function() {
                        return Helper.toDate(task.ManualFinish);
                    },
                    isMilestone: function() {
                        return active[Helper.toType(task.Milestone)];
                    },
                    isSummary: function() {
                        return active[Helper.toType(task.Summary)];
                    },
                    isCritical: function() {
                        return active[Helper.toType(task.Critical)];
                    },
                    getActualStart: function() {
                        return Helper.toDate(task.ActualStart);
                    },
                    getActualDuration: function() {
                        var ad = task.ActualDuration.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                        return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
                    },
                    getActualWork: function() {
                        var ad = task.ActualWork.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                        return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
                    },
                    getRegularWork: function() {
                        var ad = task.RegularWork.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                        return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
                    },
                    getRemainingDuration: function() {
                        var ad = task.RemainingDuration.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                        return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
                    },
                    getRemainingWork: function() {
                        var ad = task.RemainingWork.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
                        return ((ad[0] * 1) / Project.getHoursPerDay()) + 'Days, ' + ad[1] + 'Minutes, ' + ad[2] + 'Sec';
                    },
                    getConstraintType: function() {
                        return constraintType[Helper.toType(task.ConstraintType)];
                    },
                    getCalendarUID: function() {
                        return task.CalendarUID;
                    },
                    getPercentComplete: function() {
                        return (task.PercentComplete || 0) + '%';
                    },
                    getPercentWorkComplete: function() {
                        return (task.PercentWorkComplete || 0) + '%';
                    },
                    getPredecessorLink: function() {
                        var pl = task.PredecessorLink || [],
                            plStr = [];
                        if(Helper.isArray(pl)) {
                            for(var i = 0; i < pl.length; i++) {
                                plStr.push(pl[i].PredecessorUID + linkType[pl[i].Type * 1]);
                                dependents.push(pl[i].PredecessorUID);
                                dependentsType.push(linkType[pl[i].Type * 1]);
                            }
                        } else if(pl) {
                            plStr.push(pl.PredecessorUID + linkType[pl.Type * 1]);
                            dependents.push(pl.PredecessorUID);
                            dependentsType.push(linkType[pl.Type * 1]);
                        }
                        return plStr.join(',');
                    },
                    getDepend: function() {
                        if(dependents.length === 0) {
                            this.getPredecessorLink();
                        }
                        return dependents;
                    },
                    getDependType: function() {
                        return dependentsType;
                    },
                    isOpen: function() {
                        return open;
                    },
                    getParent: function() {
                        return task.Parent;
                    },
                    toJson: function() {
                        return task;
                    },
                    getIndex: function() {
                        return task.Indexed;
                    },
                    getResource: function() {
                        if (task.Resources) {
                            return task.Resources;
                        } else {
                            var a = Project.getAssignments(),
                                r = Project.getResources(),
                                uid = task.UID,
                                resources = '';
                            var res = a.getTaskResources(uid);
                            if(!res) {
                                return  String.fromCharCode(160)
                            }
                            for(var i = 0; i < res.length; i++) {
                                var rs = r.getResourceByUID(res[i]);
                                resources += rs ? rs.getName() : '';
                            }
                            return resources || String.fromCharCode(160);
                        }
                    },
                    setParentDiv: function(par) {
                        div = par;
                        return this;
                    },
                    getClass: function() {
                        return (task.PredecessorLink && PredecessorLink.length > 0) ? 'group' : 'task';
                    },
                    getColor: function() {
                        return Helper.getRandomColor();
                    },
                    setStartX: function(x) {
                        x1 = x * 1;
                        return this;
                    },
                    setStartY: function(y) {
                        y1 = y * 1;
                        return this;
                    },
                    setEndX: function(x) {
                        x2 = x * 1;
                        return this;
                    },
                    setEndY: function(y) {
                        y2 = y * 1;
                        return this;
                    },
                    setVisible: function(v) {
                        visible = v;
                        return this;
                    },
                    setParentTask: function(parent) {
                        if(this.equals(parent)) {
                            parentTask = parent;
                        }
                        return this;
                    },
                    setRowTr: function(tr) {
                        if(tr) {
                            rowTr = tr;
                        }
                        return this;
                    },
                    getRowTr: function() {
                        return rowTr;
                    },
                    getStartX: function() {
                        return x1;
                    },
                    getStartY: function() {
                        return y1;
                    },
                    getEndX: function() {
                        return x2;
                    },
                    getEndY: function() {
                        return y2;
                    },
                    getVisible: function() {
                        return visible;
                    },
                    getParentTask: function() {
                        return parentTask;
                    },
                    equals: function(instance) {
                        return instance.constructor == this.constructor;
                    }
                }
            },
            getTaskById: function(id) {
                return indexedTasks[id];
            },
            getTaskByIndex: function(index) {
                for(var task in indexedTasks) {
                    if (indexedTasks.hasOwnProperty(task) && indexedTasks[task].Indexed === index) {
                        return indexedTasks[task];
                    }
                }
                return null;
            },
            addTasks: function(tasks) {
                if(Helper.isArray(tasks)) {
                    var index = 0, count = tasks.length, task, t, index = allTasks.length;
                    for(; index < count; index++) {
                        task = tasks[index];
                        if((task.ID * 1) > 0 && !indexedTasks[task.ID]) {
                            task.Indexed = index;
                            t = new this.newTask(task);
                            indexedTasks[task.ID] = t;
                            allTasks.push(t);
                        }
                    }
                    process();
                }
            },
            add: function(task) {
                if(Helper.isObject(task) && task.ID && !indexedTasks[task.ID]) {
                    task.Indexed = allTasks.length;
                    var t = new this.newTask(task);
                    indexedTasks[task.ID] = new this.newTask(t);
                    allTasks.push(t);
                }
            },
            getAll: function() {
                return allTasks;
            }
        };
    };
}));