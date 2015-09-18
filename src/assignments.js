define('ganttAssignments',
    //https://msdn.microsoft.com/en-us/library/office/aa210595(v=office.11).aspx
    function () {
        return function (Helper) {
            var indexedAssigmentsUID = {}, allAssigments = [], taskResourceMap = {};
            return {
                newAssignment: function(assignment) {
                    return {
                        getUID: function() {
                            return assignment.UID;
                        },
                        getTaskUID: function() {
                            return assignment.TaskUID;
                        },
                        getResourceUID: function() {
                            return assignment.ResourceUID;
                        },
                        toJson: function() {
                            return assignment;
                        }
                    }
                },
                addAssignments: function(assignments) {
                    if(Helper.isArray(assignments)) {
                        var i = 0, indx = assignments.length;
                        for(;i < indx; i++) {
                            if(!indexedAssigmentsUID[assignments[i].UID]) {
                                var a = this.newAssignment(assignments[i]);
                                indexedAssigmentsUID[assignments[i].UID] = a;
                                allAssigments.push(a);
                                if(!taskResourceMap[a.getTaskUID()]) {
                                    taskResourceMap[a.getTaskUID()] = [a.getResourceUID()];
                                } else {
                                    taskResourceMap[a.getTaskUID()].push(a.getResourceUID());
                                }
                            }
                        }
                    }
                },
                getAssignmentByUID: function(UID) {
                    return indexedAssigmentsUID[UID];
                },
                getAssignments: function() {
                    return allAssigments;
                },
                getTaskResources: function(taskUID) {
                    return taskResourceMap[taskUID];
                }
            }
        }
    });