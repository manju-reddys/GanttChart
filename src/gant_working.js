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

    var optc = Object.prototype.toString.call,
            ce = document.createElement,
            dbody = document.body,
            TN = document.createTextNode;
    //Default immutable options
    var options = Object.freeze({
        dateInputFormat: 'mm/dd/yyyy', //Default format
        dateTaskTableDisplayFormat: dateFormatToArray('dd/mm/yyyy'),
        dateTaskDisplayFormat: dateFormatToArray('dd month yyyy'),
        hourMajorDateDisplayFormat: dateFormatToArray('day dd month yyyy'),
        hourMinorDateDisplayFormat: dateFormatToArray('HH'),
        dayMajorDateDisplayFormat: dateFormatToArray('dd/mm/yyyy'),
        dayMinorDateDisplayFormat: dateFormatToArray('dd'),
        weekMajorDateDisplayFormat: dateFormatToArray('yyyy'),
        weekMinorDateDisplayFormat: dateFormatToArray('dd/mm'),
        monthMajorDateDisplayFormat: dateFormatToArray('yyyy'),
        monthMinorDateDisplayFormat: dateFormatToArray('mon'),
        quarterMajorDateDisplayFormat: dateFormatToArray('yyyy'),
        quarterMinorDateDisplayFormat: dateFormatToArray('qq'),
        showToolTip: true,
        enableSort: true,
        tasks: {
            showSelector: true,
            showDependencies: true,
            showResource: true,
            showDuration: true,
            showCompletion: true,
            showStartDate: true,
            showEndDate: true
        },
        validSelectorsPosition: ['top', 'bottom'],
        defaultSelectorPosition: 'top',
        showEndWeekDate: true,
        useFade: true,
        useMove: true,
        useSingleCell: 25000,
        showTaskInfoStartDate: true,
        showTaskInfoEndDate: true,
        showTaskInfoDuration: true,
        showTaskInfoCompletion: true,
        showTaskInfoNotes: true,
        showTaskInfoLink: false,
        showTaskInfoResource: true,
        lang: 'en',
        daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        langs: {
            'en': {
                'format': 'Format',
                'hour': 'Hour',
                'day': 'Day',
                'week': 'Week',
                'month': 'Month',
                'quarter': 'Quarter',
                'hours': 'Hours',
                'days': 'Days',
                'weeks': 'Weeks',
                'months': 'Months',
                'quarters': 'Quarters',
                'hr': 'Hr',
                'dy': 'Day',
                'wk': 'Wk',
                'mth': 'Mth',
                'qtr': 'Qtr',
                'hrs': 'Hrs',
                'dys': 'Days',
                'wks': 'Wks',
                'mths': 'Mths',
                'qtrs': 'Qtrs',
                'resource': 'Resource',
                'duration': 'Duration',
                'comp': '% Comp.',
                'completion': 'Completion',
                'startdate': 'Start Date',
                'enddate': 'End Date',
                'moreinfo': 'More Information',
                'notes': 'Notes',
                'january': 'January',
                'february': 'February',
                'march': 'March',
                'april': 'April',
                'maylong': 'May',
                'june': 'June',
                'july': 'July',
                'august': 'August',
                'september': 'September',
                'october': 'October',
                'november': 'November',
                'december': 'December',
                'jan': 'Jan',
                'feb': 'Feb',
                'mar': 'Mar',
                'apr': 'Apr',
                'may': 'May',
                'jun': 'Jun',
                'jul': 'Jul',
                'aug': 'Aug',
                'sep': 'Sep',
                'oct': 'Oct',
                'nov': 'Nov',
                'dec': 'Dec',
                'sunday': 'Sunday',
                'monday': 'Monday',
                'tuesday': 'Tuesday',
                'wednesday': 'Wednesday',
                'thursday': 'Thursday',
                'friday': 'Friday',
                'saturday': 'Saturday',
                'sun': 'Sun',
                'mon': 'Mon',
                'tue': 'Tue',
                'wed': 'Wed',
                'thu': 'Thu',
                'fri': 'Fri',
                'sat': 'Sat'
            }
        },
        views: ['hour', 'day', 'week', 'month', 'quarter'],
        hourColWidth: 18,
        dayColWidth: 18,
        weekColWidth: 36,
        monthColWidth: 36,
        quarterColWidth: 18,
        rowHeight: 20,
        useRowHlt: true
    });
    //Stores all the instances in the page.
    var instances = {};
    var utils = {
        isObject: function (o) {
            return optc(o) === '[object Objec]';
        },
        isBoolean: function (b) {
            return optc(b) === '[object Boolean]';
        },
        isNumber: function (n) {
            return optc(n) === '[object Number]';
        },
        isNull: function (n) {
            return optc(n) === '[object Null]';
        },
        isUndefined: function (u) {
            return optc(u) === '[object Undefined]';
        },
        isArray: function (a) {
            return optc(a) === '[object Array]';
        },
        isFunction: function (f) {
            return optc(f) === '[object Function]';
        },
        isDate: function (d) {
            return optc(d) === '[object Date]';
        },
        isString: function (s) {
            return optc(s) === '[object String]';
        },
        isEmpty: function (o) {
            if (this.isUndefined(o)) {
                return true;
            } else if (this.isObject(o)) {
                return Object.keys(o).length === 0;
            } else if (this.isArray(o) || this.isString(o)) {
                return o.length === 0;
            } else {
                return true;
            }
        },
        toNumber: function (n) {
            return n * 1;
        },
        getUUID: function (d) {
            return (Math.random()
                    .toString(16) + '0000000000')
                    .substr(2, d || 10);
        }
    };
    var Dom = function () {
        function addAttrs(ele, attrs) {
            if (utils.isElement(ele) && utils.isObject(attrs)) {
                Object.keys(attrs).forEach(function (prop) {
                    ele.setAttribute(prop, attrs[prop]);
                });
            }
            return ele;
        }
        return {
            tr: function (attrs) {
                return addAttrs(ce('tr'), attrs);
            },
            td: function (attrs) {
                return addAttrs(ce('td'), attrs);
            },
            div: function (attrs) {
                return addAttrs(ce('div'), attrs);
            },
            table: function (attrs) {
                return addAttrs(ce('table'), attrs);
            },
            tbody: function (attrs) {
                return addAttrs(ce('tbody'), attrs);
            },
            span: function (attrs) {
                return addAttrs(ce('span'), attrs);
            },
            attr: function (ele, attrs) {
                return addAttrs(ele, attrs);
            },
            isDiv: function (d) {
                return this.isElement(d) && d.nodeName === 'DIV';
            },
            isElement: function (e) {
                return !!(e && e.nodeType);
            },
            getById: function (id, element) {
                return this.isElement(element) ?
                        element.getElementById(id) :
                        document.getElementById(id);
            }
        }();
    };
    var template = function () {
        var template = Dom.div({class: 'gchartcontainer'});
        template.appendChild(Dom.div({class: 'gchartlbl gcontainercol right-header'}));
        template.appendChild(Dom.div({class: 'glistlbl gcontainercol left-header'}));
        template.appendChild(Dom.div({class: 'glabelfooter'}));
        template.appendChild(Dom.div({class: 'gchartgrid gcontainercol right-body'}));
        template.appendChild(Dom.div({class: 'glistgrid gcontainercol left-body'}));
        template.appendChild(Dom.div({class: 'ggridfooter'}));
        return template;
    };

    (function () {
        if (typeof Object.assign !== 'function') {
            (function () {
                Object.assign = function (target) {
                    'use strict';
                    if (target === undefined || target === null) {
                        throw new TypeError('Cannot convert undefined or null to object');
                    }

                    var output = Object(target);
                    for (var index = 1; index < arguments.length; index++) {
                        var source = arguments[index];
                        if (source !== undefined && source !== null) {
                            for (var nextKey in source) {
                                if (source.hasOwnProperty(nextKey)) {
                                    output[nextKey] = source[nextKey];
                                }
                            }
                        }
                    }
                    return output;
                };
            })();
        }
    })();
    (function (e) {
        e.matchs = e.matches ||
                e.matchesSelector ||
                e.webkitMatchesSelector ||
                e.msMatchesSelector ||
                function (selector) {
                    var node = this, nodes = (node.parentNode ||
                            node.document).querySelectorAll(selector), i = -1;
                    while (nodes[++i] && nodes[i] !== node)
                        ;
                    return !!nodes[i];
                };

        e.closest = e.closest || function (selector) {
            var el = this;
            while (el.matches && !el.matches(selector))
                el = el.parentNode;
            return el.matches ? el : null;
        };

        e.offset = function () {
            var dView = document.defaultView,
                    root = document.documentElement,
                    box = ce('div');
            box.style.paddingLeft = box.style.width = "1px";
            dbody.appendChild(box);
            var isBoxModel = box.offsetWidth === 2;
            dbody.removeChild(box);
            box = this.getBoundingClientRect();
            var clientTop = root.clientTop || dbody.clientTop || 0,
                    clientLeft = root.clientLeft || dbody.clientLeft || 0,
                    scrollTop = dView.pageYOffset || isBoxModel && root.scrollTop || dbody.scrollTop,
                    scrollLeft = dView.pageXOffset || isBoxModel && root.scrollLeft || dbody.scrollLeft;
            return {
                top: box.top + scrollTop - clientTop,
                left: box.left + scrollLeft - clientLeft};
        };
        e.addClass = function (clasz) {
            this.classList.add(clasz);
            return this;
        };
        e.removeClass = function (clasz) {
            this.classList.remove(clasz);
            return this;
        };
        e.toggleClass = function (clasz) {
            this.classList.toggle(clasz);
            return this;
        };
        e.setStyles = function (styles) {
            var s = this.style;
            if (utils.isObject(styles)) {
                for (var prop in styles) {
                    if (styles.hasOwnProperty(prop)) {
                        s[prop] = styles[prop];
                    }
                }
            }
            return this;
        };
        e.attrs = function (attrs) {
            if (utils.isUndefined(attrs)) {
                var obj = {}, attrs = this.attributes;
                for (var i = attrs.length - 1; i >= 0; i--) {
                    obj[attrs[i].name] = attrs[i].value;
                }
                return obj;
            } else if(utils.isObject(attrs)){
                return Dom.attrs(this, attrs);
            } else {
                return null;
            }
        };
    })(Element.prototype);
    /**
     * Add format function to the date field.
     * @param {Date} dt object
     * @returns {}
     */
    function wrapDateFn(dt) {
        if (utils.isDate(dt)) {
            dt.format = function (format) {
                var returnStr = '';
                var replace = chars;
                for (var i = 0; i < format.length; i++) {
                    var curChar = format.charAt(i);
                    if (i - 1 >= 0 && format.charAt(i - 1) === "\\") {
                        returnStr += curChar;
                    } else if (replace[curChar]) {
                        returnStr += replace[curChar].call(this);
                    } else if (curChar !== "\\") {
                        returnStr += curChar;
                    }
                }
                return returnStr;

                function chars() {
                    return {
                        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        // Day
                        d: function () {
                            return (this.getDate() < 10 ? '0' : '') + this.getDate();
                        },
                        D: function () {
                            return dt.replaceChars.shortDays[this.getDay()];
                        },
                        j: function () {
                            return this.getDate();
                        },
                        l: function () {
                            return dt.replaceChars.longDays[this.getDay()];
                        },
                        N: function () {
                            return this.getDay() + 1;
                        },
                        S: function () {
                            return (this.getDate() % 10 == 1
                                    && this.getDate() != 11 ? 'st' :
                                    (this.getDate() % 10 == 2
                                            && this.getDate() != 12 ? 'nd' :
                                            (this.getDate() % 10 == 3
                                                    && this.getDate() != 13 ? 'rd' :
                                                    'th')));
                        },
                        w: function () {
                            return this.getDay();
                        },
                        z: function () {
                            var d = new Date(this.getFullYear(), 0, 1);
                            return Math.ceil((this - d) / 86400000);
                        }, // Fixed now
                        // Week
                        W: function () {
                            var d = new Date(this.getFullYear(), 0, 1);
                            return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7);
                        }, // Fixed now
                        // Month
                        F: function () {
                            return dt.replaceChars.longMonths[this.getMonth()];
                        },
                        m: function () {
                            return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
                        },
                        M: function () {
                            return dt.replaceChars.shortMonths[this.getMonth()];
                        },
                        n: function () {
                            return this.getMonth() + 1;
                        },
                        t: function () {
                            var d = new Date();
                            return new Date(d.getFullYear(), d.getMonth(), 0).getDate()
                        }, // Fixed now, gets #days of date
                        // Year
                        L: function () {
                            var year = this.getFullYear();
                            return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
                        }, // Fixed now
                        o: function () {
                            var d = new Date(this.valueOf());
                            d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
                            return d.getFullYear();
                        }, //Fixed now
                        Y: function () {
                            return this.getFullYear();
                        },
                        y: function () {
                            return ('' + this.getFullYear()).substr(2);
                        },
                        // Time
                        a: function () {
                            return this.getHours() < 12 ? 'am' : 'pm';
                        },
                        A: function () {
                            return this.getHours() < 12 ? 'AM' : 'PM';
                        },
                        B: function () {
                            return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
                        }, // Fixed now
                        g: function () {
                            return this.getHours() % 12 || 12;
                        },
                        G: function () {
                            return this.getHours();
                        },
                        h: function () {
                            return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
                        },
                        H: function () {
                            return (this.getHours() < 10 ? '0' : '') + this.getHours();
                        },
                        i: function () {
                            return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
                        },
                        s: function () {
                            return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
                        },
                        u: function () {
                            var m = this.getMilliseconds();
                            return (m < 10 ? '00' : (m < 100 ?
                                    '0' : '')) + m;
                        },
                        // Timezone
                        e: function () {
                            return "Not Yet Supported";
                        },
                        I: function () {
                            var DST = null;
                            for (var i = 0; i < 12; ++i) {
                                var d = new Date(this.getFullYear(), i, 1);
                                var offset = d.getTimezoneOffset();

                                if (DST === null)
                                    DST = offset;
                                else if (offset < DST) {
                                    DST = offset;
                                    break;
                                } else if (offset > DST)
                                    break;
                            }
                            return (this.getTimezoneOffset() == DST) | 0;
                        },
                        O: function () {
                            return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00';
                        },
                        P: function () {
                            return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00';
                        }, // Fixed now
                        T: function () {
                            var m = this.getMonth();
                            this.setMonth(0);
                            var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
                            this.setMonth(m);
                            return result;
                        },
                        Z: function () {
                            return -this.getTimezoneOffset() * 60;
                        },
                        // Full date/Time
                        c: function () {
                            return this.format("Y-m-d\\TH:i:sP");
                        }, // Fixed now
                        r: function () {
                            return this.toString();
                        },
                        U: function () {
                            return this.getTime() / 1000;
                        },
                        days: function () {
                            var f = new Date(this.getFullYear(), 0, 0);
                            return Math.floor((this - f) / (1000 * 60 * 60 * 24));
                        }
                    };
                }
            };
            // 6 = Saturday, 0 = Sunday
            dt.isWeekEnd = function () {
                return this.getDay() === 6 || this.getDay() === 0;
            };

        } else {
            throw 'Invalid date object passed, please check "' + dt + '"';
        }
    }
    /**
     * Split the date format to array
     * @param {String} format date format
     * @returns {String}
     */
    function dateFormatToArray(format) {
        return format.split(/\b/g);
    }
    function Instance(element, format, instanceId) {
        var taskList = [], instOptions = Object.assign(options);

        instOptions['minGapLength'] = 8;
        instOptions['scrollTo'] = '';
        instOptions['captionType'] = '';

        if (utils.isString(element)) {
            element = document.getElementById(element);
        }
        if (!Dom.isElement(element)) {
            throw 'Unsupported parameter "' + element + '", only DOM Element '
                    + 'or element id is supported';
        }

        var $original = element.cloneNode(true);

        var VC = {
            ID_CHILD: instanceId + 'child_',
            ID_CHILD_ROW: instanceId + 'childrow_',
            ID_TASK_CONTAINER: instanceId + 'bardiv_',
            ID_TASK_BAR: instanceId + 'taskbar_',
            ID_TOOLTIP_TASK_BAR: 'tt' + instanceId + 'taskbar_',
            ID_TOOLTIP_COMPLETE: 'tt' + 'complete_',
            ID_COMPLETE: instanceId + 'complete_',
            ID_LINE: instanceId + 'line',
            ID_CHART_TABLE: instanceId + 'chartTable',
            ID_CHART_TABLE_HEADER: instanceId + 'chartTableh',
            ID_GROUP: instanceId + 'group_',
            ID_FORMAT: instanceId + 'format',
            ID_FORMAT_HOUR: instanceId + 'formathour',
            ID_FORMAT_DAY: instanceId + 'formatday',
            ID_FORMAT_WEEK: instanceId + 'formatweek',
            ID_FORMAT_MONTH: instanceId + 'formatmonth',
            ID_FORMAT_QUARTER: instanceId + 'formatquarter',
            CLASS_MILE_ITEM: 'gmileitem',
            CLASS_MILE: 'gmile',
            CLASS_TASK_CELL: 'gtaskcell',
            CLASS_TASK_CELL_DIV: 'gtaskcelldiv',
            CLASS_TASK_BAR_CONTAINER: 'gtaskbarcontainer',
            CLASS_MILE_DIAMOND: 'gmilediamond', //Milestone?
            CLASS_MILE_DIAMOND_TOP: 'gmdtop',
            CLASS_MILE_DIAMOND_BOTTOM: 'gmdbottom',
            CLASS_MILE_CAPTION: 'gmilecaption',
            CLASS_TASK_CELL_WEEKEND: 'gtaskcellwkend',
            CLASS_LINE_ITEM: 'glineitem',
            CLASS_ITEM: 'gitem',
            CLASS_GROUP_ITEM: 'ggroupitem',
            CLASS_GROUP: 'ggroup',
            CLASS_COMPLETE: 'complete',
            CLASS_END_POINT_LEFT: 'endpointleft',
            CLASS_END_POINT_RIGHT: 'endpointright',
            CLASS_GROUP_CAPTION: 'ggroupcaption',
            CLASS_GRID_FOOTER: 'ggridfooter',
            CLASS_SPANNING: 'gspanning',
            CLASS_TASK_RESOURCE: 'gresource',
            CLASS_TASK_HEADING: 'gtaskheading',
            CLASS_TASK_DURATION: 'gduration',
            CLASS_TASK_COMPLETE: 'gpccomplete',
            CLASS_TASK_START_DATE: 'gstartdate',
            CLASS_TASK_END_DATE: 'genddate',
            CLASS_MAJOR_HEADING: 'gmajorheading',
            CLASS_MINOR_HEADING: 'gminorheading',
            CLASS_WEEK_END: 'wkend',
            CLASS_VERTICAL_LINE: 'glinev',
            CLASS_HORIZONTAL_LINE: 'glineh',
            CLASS_ITEM_HIGHLIGHT: 'gitemhighlight',
            CLASS_TASK_NOTES: 'gTaskNotes',
            CLASS_GROUP_BLACK: 'ggroupblack',
            CLASS_MILE_STONE: 'gmilestone',
            CLASS_TASK_BLUE: 'gtaskblue',
            CLASS_TASK_TABLE_HEADER: 'gtasktableh',
            CLASS_TASK_LIST: 'gtasklist',
            CLASS_TASK_TABLE: 'gtasktable',
            CLASS_TASK_NAME: 'gtaskname',
            CLASS_SELECTOR: 'gselector',
            CLASS_FORM_LABEL: 'gformlabel',
            CLASS_SELECTED: 'gselected',
            CLASS_TI_TITLE: 'gTtTitle',
            CLASS_TI_SD: 'gTIsd',
            CLASS_TI_ED: 'gTIed',
            CLASS_TASK_INFO: 'gTaskInfo',
            CLASS_TASK_LABEL: 'gTaskLabel',
            CLASS_TASK_TEXT: 'gTaskText',
            CLASS_TI_LINE: 'gTILine',
            CLASS_TI_D: 'gTId',
            CLASS_TI_C: 'gTIc',
            CLASS_TI_R: 'gTIr',
            CLASS_TI_L: 'gTIl',
            CLASS_TI_N: 'gTIn',
            CLASS_NAME: 'gname',
            CLASS_FOLDER_COLLAPSE: 'gfoldercollapse',
            CLASS_CHART_TABLE: 'gcharttable',
            CLASS_CHART_TABLE_HEADER: 'gcharttableh',
            CLASS_RT_HEADER_PAD: 'rhscrpad',
            CLASS_CAPTION: 'gcaption',
            FORMAT_HOUR: 'hour',
            FORMAT_DAY: 'day',
            FORMAT_WEEK: 'week',
            FORMAT_MONTH: 'month',
            FORMAT_QUARTER: 'quarter'
        },
        todayPx = -1, dependentId = 1, isProcessed = false, tasksId = [];

        return {
            getId: function () {
                return instanceId;
            },
            getView: function () {
                return element;
            },
            getChartHeader: function () {
                return this.getView()
                        .getElementsByClassName('.right-header')[0];
            },
            getPanelHeader: function () {
                return this.getView()
                        .getElementsByClassName('.left-header')[0];
            },
            getChartBody: function () {
                return this.getView()
                        .getElementsByClassName('.right-body')[0];
            },
            getPanelBody: function () {
                return this.getView()
                        .getElementsByClassName('.left-body')[0];
            },
            getProperties: function () {
                return Object.assign(instOptions);
            },
            getProperty: function (key) {
                var tags = key.split('.'), len = tags.length - 1;
                for (var i = 0; i < len; i++) {
                    instOptions = instOptions[tags[i]];
                }
                return instOptions[tags[len]];
            },
            setProperty: function (key, value) {
                var tags = key.split('.'), len = tags.length - 1;
                for (var i = 0; i < len; i++) {
                    instOptions = instOptions[tags[i]];
                }
                instOptions[tags[len]] = value;
                return this;
            },
            getTasks: function () {
                return taskList;
            },
            getTaskSize: function () {
                return taskList.length;
            },
            switchView: function (view) {
                format = instOptions
                        .viewTypes.indexOf(view) > 0 ? view : format;
                return format === view;
            },
            destroy: function () {
                element.innerHTML = "";
                element.parentNode.replaceChild($original, element);
            }
        };

        function calcOffsetNeeded(taskStart, taskEnd, width, $format) {
            $format = $format || format;
            var daysInMonth = this.getProperty('daysInMonth'),
                    start = new Date(taskStart.getTime()),
                    end = new Date(taskEnd.getTime()),
                    right = 0,
                    s = Date.UTC(start.getYear(), start.getMonth(), start.getDate(), start.getHours(), 0, 0),
                    e = Date.UTC(end.getYear(), end.getMonth(), end.getDate(), end.getHours(), 0, 0),
                    toRight = (s - e) / 3600000, diff, tmpDt, cors;
            switch ($format) {
                case 'day':
                    right = Math.ceil((toRight / 24) * (width + 1));
                    break;
                case 'week':
                    right = Math.ceil(((toRight / 24) * (width + 1)) / 7);
                    break;
                case 'month':
                    diff = (12 * (end.getFullYear() - start.getFullYear()))
                            + (end.getMonth() - start.getMonth());
                    tmpDt = new Date(end.getTime());
                    tmpDt.setDate(start.getDate());
                    cors = (end.getTime() - start.getTime()) / 86400000;
                    right = Math.ceil((diff * (width + 1)) + (cors * (width / daysInMonth[end.getMonth()])));
                    break;
                case 'quarter':
                    diff = (12 * (end.getFullYear() - start.getFullYear()))
                            + (end.getMonth() - start.getMonth());
                    tmpDt = new Date(end.getTime());
                    tmpDt.setDate(start.getDate());
                    cors = (end.getTime() - start.getTime()) / 86400000;
                    right = Math.ceil((diff * ((width + 1) / 3)) + (cors * (width / 90)));
                    break;
                case 'hour':
                    // Can't just calculate sum bcz of daylight saving changes
                    var t = new Date(end.getTime());
                    t.setMinutes(start.getMinutes(), 0);
                    cors = (end.getTime() - start.getTime()) / 3600000;
                    right = Math.ceil(toRight * (width + 1)) + (cors + width);
                    break;
                default:
                    throw new Error('Unsupported view');
                    break;
            }

            return right;
        }

        function calcTaskPositions() {
            var taskDiv, barDiv, parDiv,
                    height = Math.floor((this.getPropert('rowHeight') * 1) / 2);
            for (var i = 0, len = taskList.length; i < len; ++i) {
                var task = taskList[i],
                        id = task.getId();
                barDiv = element.getElementById(VC.ID_TASK_CONTAINER + id);
                taskDiv = element.getElementById(VC.ID_TASK_BAR + id);

                if (task.getParentId() && task.getParentItem().getGroup() === 2) {
                    parDiv = element.getElementById(VC.ID_CHILD_ROW + task.getParentId().getId());
                } else {
                    parDiv = element.getElementById(VC.ID_CHILD_ROW + id);
                }
                if (Dom.isElement(barDiv)) {
                    var barOffset = barDiv.offset(),
                            parOffset = parDiv.offset();
                    task.setStartX(barOffset.left + 1);
                    task.setStartY(parOffset.top + barOffset.top + height - 1);
                    task.setEndX(barOffset.left + barDiv.outerWidth() + 1);
                    task.setEndY(parOffset.top + barOffset.top + height - 1);
                }
            }
        }

        function addTask(item) {
            if (!utils.isUndefined(item.getId())
                    && !tasksId.indexOf(item.getId())) {
                taskList.push(item);
                isProcessed = false;
            }
        }

        function removeTask(id) {
            if (!utils.isUndefined(id)) {
                for (var i = 0, n = taskList.length; i < n; ++i) {
                    var task = taskList[i];
                    if (task.getId() === id) {
                        task.setToDelete(true); //Soft delete for now
                        tasksId.splice(tasksId.indexOf(id), 1);
                    } else if (task.getParentId() === id) {
                        removeTask(task.getId());
                    }
                }
                isProcessed = false;
            }
        }

        function clearDependents() {
            var $chart = this.getChartBody(),
                    childLine, maxId = dependentId;
            for (var i = 1; i < maxId; ++i) {
                if ((childLine = $chart.getElementById(VC.ID_LINE + i))) {
                    childLine.remove();
                }
            }
            dependentId = 1;
        }

        function drawStringLine(x1, y1, x2, y2, cssClass) {
            var left = Math.min(x1, x2),
                    top = Math.min(y1, y2),
                    width = Math.abs(x2 - x1) + 1,
                    height = Math.abs(y2 - y1) + 1;
            var div = Dom.div({
                class: width === 1 ? VC.CLASS_VERTICAL_LINE
                        : VC.CLASS_HORIZONTAL_LINE,
                id: VC.ID_LINE + dependentId++
            }).setStyles({
                position: 'absolute',
                overflow: 'hidden',
                'z-index': 0,
                left: left + 'px',
                top: top + 'px',
                width: width + 'px',
                height: height + 'px',
                visibility: 'visible'
            });
            if (width === 1) {
                div.addClass(VC.CLASS_VERTICAL_LINE);
            } else {
                div.addClass(VC.CLASS_HORIZONTAL_LINE);
            }
            if (cssClass) {
                div.addClass(cssClass);
            }
            this.getChartBody().appendChild(div);
        }

        //calc line x,y pairs and draw multiple one-by-one stright lines
        function dependecyLine(x1, y1, x2, y2, cssClass) {
            var dx = x2 - x1, dy = y2 - y1,
                    x = x1, y = y1;
            var n = Math.max(Math.abs(dx), Math.abs(dy));
            dx = dx / n;
            dy = dy / n;
            for (var i = 0; i <= n; i++) {
                var vx = Math.round(x);
                var vy = Math.round(y);
                drawStringLine(vx, vy, vx, vy, cssClass);
                x += dx;
                y += dy;
            }
        }

        function connectDependencies(x1, y1, x2, y2, type, cssClass) {
            var direction = 1, bend = 4, shortestLine = 4;
            var row = Math.floor(this.getPropery('rowHeight') * 1 / 2);
            if (y2 < y1) {
                row *= -1;
            }
            switch (type) {
                case 'SF':
                    if (x1 - 10 > x2) {
                        shortestLine *= -1;
                    } else {
                        bend = true;
                        shortestLine *= -1;
                    }
                    direction = -1;
                    break;

                case 'SS':
                    if (x1 < x2) {
                        shortestLine *= -1;
                    } else {
                        shortestLine = x2 - x1 - (2 * shortestLine);
                    }
                    break;

                case 'FF':
                    if (x1 <= x2) {
                        shortestLine = x2 - x1 + (2 * shortestLine);
                    }
                    direction = -1;
                    break;

                default:
                    if (x1 + 10 >= x2) {
                        bend = true;
                    }
                    break;
            }
            if (bend) {
                this.drawStringLine(x1, y1, x1 + shortestLine, y1, cssClass);
                this.drawStringLine(x1 + shortestLine, y1, x1 + shortestLine, y2 - row, cssClass);
                this.drawStringLine(x1 + shortestLine, y2 - row, x2 - (shortestLine * 2), y2 - row, cssClass);
                this.drawStringLine(x2 - (shortestLine * 2), y2 - row, x2 - (shortestLine * 2), y2, cssClass);
                this.drawStringLine(x2 - (shortestLine * 2), y2, x2, y2, cssClass);
            } else {
                this.drawStringLine(x1, y1, x1 + shortestLine, y1, cssClass);
                this.drawStringLine(x1 + shortestLine, y1, x1 + shortestLine, y2, cssClass);
                this.drawStringLine(x1 + shortestLine, y2, x2, y2, cssClass);
            }

            this.dependecyLine(x2, y2, x2 - (3 * direction), y2 - (3 * direction), cssClass);
            this.dependecyLine(x2, y2, x2 - (3 * direction), y2 + (3 * direction), cssClass);
            this.dependecyLine(x2 - (1 * direction), y2, x2 - (3 * direction), y2 - (2 * direction), cssClass);
            this.dependecyLine(x2 - (1 * direction), y2, x2 - (3 * direction), y2 + (2 * direction), cssClass);
        }

        function drawDependencies() {
            if (showDependecies()) {
                calcTaskPositions(); //Calc X, Y 
                clearDependents();
                for (var i = 0, len = taskList.length; i < len; ++i) {
                    var task = taskList[i],
                            dependent = task.getDependent(),
                            depType = task.getDependentType(),
                            n = dependent.length;
                    if (n > 0 && task.isVisible()) {
                        for (var k = 0; k < n; ++k) {
                            var task = getTaskById(dependent[k]);
                            if (task && task.getGroup() !== 2) {
                                if (task.isVisible()) {
                                    var iTask = taskList[i];
                                    if (depType[k] === 'SS') {
                                        connectDependencies(task.getStartX() - 1, task.getStartY(), iTask.getStartX() - 1, iTask.getStartY(), 'SS', 'gDepSS');
                                    } else if (depType[k] === 'FF') {
                                        connectDependencies(task.getEndX(), task.getEndY(), iTask.getEndX(), iTask.getEndY(), 'FF', 'gDepFF');
                                    } else if (depType[k] === 'SF') {
                                        connectDependencies(task.getStartX() - 1, task.getStartY(), iTask.getEndX() - 1, iTask.getEndY(), 'SF', 'gDepSF');
                                    } else if (depType[k] === 'FS') {
                                        connectDependencies(task.getEndX(), task.getEndY(), iTask.getStartX() - 1, iTask.getStartY(), 'FS', 'gDepFS');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (todayPx >= 0) {
                drawStringLine(todayPx, 0, todayPx, element.getElementById(this.getId() + 'chartTable').outerHeight() - 1, 'gCurDate');
            }
        }

        function getTaskIndexById(id) {
            if (!utils.isUndefined(id) && tasksId[id]) {
                for (var i = 0, len = taskList.length; i < len; ++i) {
                    if (taskList[i].getId() === id) {
                        return i;
                    }
                }
            } else {
                return -1;
            }
        }

        function getTaskById(id) {
            if (!utils.isUndefined(id) && tasksId[id]) {
                var task = null;
                for (var i = 0, len = taskList.length; i < len; ++i) {
                    if ((task = taskList[i]).getId() === id) {
                        return task;
                    }
                }
                return null;
            }
            return null;
        }

        function drawViews() {
            var views = options.views;
            var $ele = Dom.div({class: VC.CLASS_SELECTOR}).appendChild(TN('Format:'));
            views.forEach(function(view) {
                $ele.appendChild();
            });
        }
        function renderPanelHeader() {
            var lang = this.getProperty('lang'),
                    langs = this.getProperty('langs.' + lang);
            var panel = Dom.table();
        }
    }

    return {
        getInstanceById: function (id) {
            return instances[id];
        },
        getOptions: function () {
            return options;
        },
        create: function (element, format) {
            if (utils.isString(element)) {
                element = Dom.getById(element);
            }
            if (!Dom.isElement(element)) {
                throw new Error(' Element undefined');
            }

            var instanceId = utils.getUUID(5);
            if (utils.isUndefined(element.id)) {
                element.id = instanceId;
            } else {
                if (instances[element.id]) {
                    return instances[element.id];
                }
                instanceId = element.id;
            }
            format = options
                    .viewTypes
                    .indexOf(format.toLocaleString()) > 0 ?
                    format.toLocaleLowerCase() :
                    'day';

            var instance = new Instance(element, format, instanceId);

            instances[instanceId] = instance;
            return instance;
        }
    };
}));