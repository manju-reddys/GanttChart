/* global define, Element */

(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.GanttChart = factory();
    }
}(this, function () {
    'use strict';
    
    function newTask() {
        
    }
    return {
        getUUID: function() {
            return 
        }
    };
}));