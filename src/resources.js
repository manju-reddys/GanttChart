define('ganttResources',
    //https://msdn.microsoft.com/en-us/library/office/aa210595(v=office.11).aspx
    function () {
        return function (Helper) {
            var indexedResourcesUID = {}, allResources = [],
                type = {'0': 'Material', '1': 'Work'},
                workGroup = {'0': 'Default', '1': 'None', '2': 'Email', '3': 'Web'};

            return {
                newResource: function(resource) {
                    return {
                        getUID: function() {
                            return resource.UID;
                        },
                        getID: function() {
                            return resource.ID;
                        },
                        getWorkGroup: function() {
                            return workGroup[resource.WorkGroup];
                        },
                        isInactive: function() {
                            return resource.IsInactive !== '0';
                        },
                        getName: function() {
                            return resource.Name;
                        },
                        getType: function() {
                            return type[resource.Type];
                        },
                        toJson: function() {
                            return resource;
                        }
                    }
                },
                addResources: function(resources) {
                    if(Helper.isArray(resources)) {
                        var i = 0, index = resources.length;
                        for(; i < index; i++) {
                            if(!indexedResourcesUID[resources[i].UID]) {
                                var r = this.newResource(resources[i]);
                                indexedResourcesUID[r.getUID()] = r;
                                allResources.push(r);
                            }
                        }
                    }
                },
                getResourceByUID: function(UID) {
                    return indexedResourcesUID[UID];
                }
            }
        }
    });