// make sure required JavaScript modules are loaded
if (typeof jQuery === 'undefined') {
    throw 'GanttChart requires jquery module to be loaded';
}

(function (root, $, factory) {

    function init($) {
        return root.GanttChart || (root.GanttChart = factory($));
    }

    if (typeof define === "function" && define.amd) {
        // Now we're wrapping the factory and assigning the return
        // value to the root (window) and returning it as well to
        // the AMD loader.
        define([], function () {
            return init($);
        });
    } else if (typeof module === "object" && module.exports) {
        // I've not encountered a need for this yet, since I haven't
        // run into a scenario where plain modules depend on CommonJS
        // *and* I happen to be loading in a CJS browser environment
        // but I'm including it for the sake of being thorough
        module.exports = init($);
    } else {
        init($);
    }
}(this, jQuery, function ($) {

    return function () {
        var globalConfig = (function (def) {
            var defaultConfig = {
                dateInputFormat: 'mm/dd/yyyy', //Default format
                dateTaskTableDisplayFormat: parseDateFormatStr('dd/mm/yyyy'),
                dateTaskDisplayFormat: parseDateFormatStr('dd month yyyy'),
                hourMajorDateDisplayFormat: parseDateFormatStr('day dd month yyyy'),
                hourMinorDateDisplayFormat: parseDateFormatStr('HH'),
                dayMajorDateDisplayFormat: parseDateFormatStr('dd/mm/yyyy'),
                dayMinorDateDisplayFormat: parseDateFormatStr('dd'),
                weekMajorDateDisplayFormat: parseDateFormatStr('yyyy'),
                weekMinorDateDisplayFormat: parseDateFormatStr('dd/mm'),
                monthMajorDateDisplayFormat: parseDateFormatStr('yyyy'),
                monthMinorDateDisplayFormat: parseDateFormatStr('mon'),
                quarterMajorDateDisplayFormat: parseDateFormatStr('yyyy'),
                quarterMinorDateDisplayFormat: parseDateFormatStr('qq'),
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
                monthDays: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
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
                viewTypes: ['hour', 'day', 'week', 'month', 'quarter'],
                hourColWidth: 18,
                dayColWidth: 18,
                weekColWidth: 36,
                monthColWidth: 36,
                quarterColWidth: 18,
                rowHeight: 20,
                useRowHlt: true
            };
            var config = {};

            if ($.isEmptyObject(def) || !$.isFunction(def)) {
                $.extend(true, config, defaultConfig);
            } else {
                delete def.langs;
                $.extend(true, config, defaultConfig, def);
            }
            return config;
        })();

        var instances = {},
            colorCodeClass = [],

            hexDiv = $('<div style="border-style:none; position:absolute; left:-99px; top:-99px;"></div>').appendTo(document.body)[0],
            style;


        var elements = {
            tr: function () {
                return $('<tr></tr>');
            },
            td: function () {
                return $('<td></td>');
            },
            div: function () {
                return $('<div></div>');
            },
            table: function () {
                return $('<table></table>');
            },
            tbody: function () {
                return $('<tbody></tbody>');
            },
            span: function () {
                return $('<span></span>');
            }
        };

        var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
            monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
            weeksName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            weeksNameShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        function toType(v) {
            if (typeof v === 'boolean') {
                return v;
            } else if (!v && v !== 0) {
                return '';
            } else if (v == 0) {
                return 0;
            } else {
                return (v * 1) ? v * 1 : v;
            }
        }

        function wrapDateFn(dt) {
            dt.format = function (format) {
                var returnStr = '';
                var replace = dt.replaceChars;
                for (var i = 0; i < format.length; i++) {
                    var curChar = format.charAt(i);
                    if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
                        returnStr += curChar;
                    }
                    else if (replace[curChar]) {
                        returnStr += replace[curChar].call(this);
                    } else if (curChar != "\\") {
                        returnStr += curChar;
                    }
                }
                return returnStr;
            };

            dt.replaceChars = {
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
                    return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
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
                },   // Fixed now
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

                        if (DST === null) DST = offset;
                        else if (offset < DST) {
                            DST = offset;
                            break;
                        } else if (offset > DST) break;
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


        /**
         * Simple template compiler
         * @param template
         * @param data
         * @returns {*}
         */
        function compile(template, data) {
            return template.replace(/\{{([\w\.]*)\}/g, function (str, key) {
                var keys = key.split("."),
                    v = data[keys.shift()];
                for (var i = 0, l = keys.length; i < l; i++) {
                    v = v[keys[i]];
                }
                return (typeof v !== 'undefined' && v !== null) ? v : '';
            });
        }

        /*
         * The base structure of the Gantt chart view
         * @param id unique id
         * @returns {*|jQuery|HTMLElement}
         */
        function getHtmlTemplate() {
            var template = '<div class="gchartcontainer">\
                                    <div class="gchartlbl gcontainercol right-header"></div>\
                                    <div class="glistlbl gcontainercol left-header"></div>\
                                    <div class="glabelfooter"></div>\
                                    <div class="gchartgrid gcontainercol right-body"></div>\
                                    <div class="glistgrid gcontainercol left-body"></div>\
                                    <div class="ggridfooter">\
                                </div>';
            return $(template);
        };

        var helper = {
            stripUnwanted: function ($node) {
                var whiteListTags = ['#text', 'p', 'br', 'ul', 'ol', 'li', 'div', 'span', 'img'],
                    node = $node[0] || $node,
                    children = node.childNodes;
                for (var i = 0; i < children.length; i++) {
                    if ((whiteListTags.join().toLowerCase() + ',').indexOf(node.childNodes[i].nodeName.toLowerCase() + ',') === -1) {
                        node.replaceChild(document.createTextNode(node.childNodes[i].outerHTML), node.childNodes[i]);
                    }
                    if (node.childNodes[i].hasChildNodes()) {
                        this.stripUnwanted(node.childNodes[i]);
                    }
                }
            },

            toType: toType,

            date: function (dt) {
                return wrapDateFn(dt);
            },
            /**
             * Generate random number
             * @param (optional) d limit
             * @returns {string}
             */
            getUUID: function (d) {
                return (Math.random().toString(16) + '0000000000').substr(2, d || 10);
            },

            toDate: function (string, format) {
                if (+string) { //If timestamp convert to date
                    return new Date(string);
                }
                var date, dateTime;
                format = format || '';
                switch (format.toLowerCase()) {
                    case 'dd/mm/yyyy hh:mm:ss':
                    case 'dd-mm-yyyy hh:mm:ss':
                        dateTime = string.split(/\s/);
                        var dt = dateTime[0].split(/\D+/).reverse().join('/'),
                            time = dateTime[1].split(':');
                        if (!dateTime[1]) {
                            date = new Date(dt);
                        } else {
                            var l = time.length;
                            if (l === 1) {
                                time.push('00');
                            }
                            date = new Date(dt + ' ' + time.join(':'));
                        }
                        break;

                    case 'dd mmm yyyy hh:mm:ss':
                    case 'mmm dd, yyyy hh:mm:ss':
                    case 'mmm dd yyyy hh:mm:ss':
                    case 'mmm yyyy dd hh:mm:ss':
                    case 'yyyy mmm dd hh:mm:ss':
                        dateTime = string.split(/\s/);
                        if (!dateTime[3]) {
                            dateTime[3] = '00:00:00';
                        } else if (dateTime[3].length === 1) {
                            dateTime[3] = dateTime[3].split(':').concat(['00', '00']).join(':');
                        }

                        date = new Date(dateTime.join(' '));
                        break;

                    case 'mm dd yyyy hh:mm:ss':
                        dateTime = string.split(/\s/);
                        if (!dateTime[3]) {
                            dateTime[3] = '00:00:00';
                        } else if (dateTime[3].length === 1) {
                            dateTime[3] = dateTime[3].split(':').concat(['00', '00']).join(':');
                        }
                        date = new Date(dateTime[2] + '/' + dateTime[1] + '/' + dateTime[0] + ' ' + dateTime[3]);
                        break;

                    case 'dd mm yyyy hh:mm:ss':
                        dateTime = string.split(/\s/);
                        var tm = dateTime[3],
                            dt = dateTime.splice(0, 3).reverse().join('/');
                        if (!tm) {
                            tm = '00:00:00';
                        } else if (tm.length === 1) {
                            tm = dateTime[3].split(':').concat(['00', '00']).join(':');
                        }
                        date = new Date(dt + ' ' + tm);
                        break;

                    case 'yyyy/mm/dd hh:mm:ss':
                    case 'yyyy-mm-dd hh:mm:ss':
                        dateTime = string.split(/\s/);
                        var dt = dateTime[0].split(/\D+/).join('/');
                        if (!dateTime[1]) {
                            dateTime[1] = '00:00:00';
                        } else if (dateTime[1].length === 1) {
                            dateTime[1] = dateTime[1].split(':').push('00').join(':');
                        }
                        date = new Date(dt + ' ' + dateTime[1]);
                        break;

                    case 'iso':
                        var dt = new Date('2011-06-02T09:34:29+02:00');//Some known date
                        if (!dt || +dt !== 1307000069000) { //ISO date not supported
                            var day, tz,
                                rx = /^(\d{4}\-\d\d\-\d\d([tT ][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/,
                                p = rx.exec(string) || [];
                            if (p[1]) {
                                day = p[1].split(/\D/);
                                for (var i = 0, L = day.length; i < L; i++) {
                                    day[i] = parseInt(day[i], 10) || 0;
                                }
                                day[1] -= 1;
                                day = new Date(Date.UTC.apply(Date, day));
                                if (!day.getDate()) {
                                    date = NaN;
                                }
                                if (p[5]) {
                                    tz = (parseInt(p[5], 10) * 60);
                                    if (p[6]) {
                                        tz += parseInt(p[6], 10);
                                    }
                                    if (p[4] == '+') {
                                        tz *= -1;
                                    }
                                    if (tz) {
                                        day.setUTCMinutes(day.getUTCMinutes() + tz);
                                    }
                                }
                                date = day;
                            }
                            date = NaN;
                        } else {
                            date = Date.parse(string);
                        }
                        break;

                    default:
                        date = Date.parse ? Date.parse(string) : new Date(string);
                        break;

                }
                return date;
            },

            isDivElement: function (ele) {
                if (!ele) {
                    return false;
                }
                if (ele.jquery) {
                    ele = ele[0];
                }
                return ele.nodeName === 'DIV';
            },

            //TODO below 3 methods will be removed soon
            isValidHexColor: function (hex) {
                hexDiv.style.borderColor = '';
                hexDiv.style.borderColor = hex;
                if (hexDiv.style.borderColor.length === 0) {
                    return false;
                } else {
                    return true;
                }
            },

            addColorCssClass: function (hex) {
                if (colorCodeClass[hex]) {
                    return true;
                } else {
                    return style.insertRule('.' + hex + '{background: ' + hex + '}') > -1;
                }
            },

            getStyleSheet: function () {
                if (style) {
                    return style;
                } else {
                    var stl = $('head > style');
                    if (stl.length === 0) {
                        stl = $('<style></style>').attr('type', 'text/css').appendTo('head');
                    }
                    style = stl[0].sheet;
                    return style;
                }
            },
            isDateObject: function (d) {
                return this.getType(d) === '[object Date]';
            },
            isWeekEnd: function (date) {
                return (date.getDay() === 6) || (date.getDay() === 0); // 6 = Saturday, 0 = Sunday
            },
            /**
             * Test whether the passed in string contains html
             * @param string
             * @returns {boolean}
             */
            containsHtml: function (string) {
                string = string + ''; //Convert to string
                return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i.test(string);
            }
        };

        function Create($element, format, id, config) {
            //Variables definition
            var taskList = [], minGpLen = 8, scrollTo = '', captionType;

            $element.html(getHtmlTemplate(id)); //Clean and attach the barebone structure

            return {
                getId: function () {
                    return id;
                },

                getView: function () {
                    return $element;
                },

                getChartHeader: function () {
                    return this.getView.find('.right-header');
                },

                getListHeader: function () {
                    return this.getView.find('.left-header');
                },

                getChartBody: function () {
                    return this.getView.find('.right-body');
                },

                getListBody: function () {
                    return this.getView.find('.left-body');
                },

                config: function () {
                    return {
                        /**
                         * @param prop properity value to read
                         * @param chProp [chProp] Child property
                         * @returns {*}
                         */
                        getProperty: function (prop, chProp) {
                            if (prop) {
                                return null;
                            } else if (chProp) {
                                return config[prop] ? config[prop][chProp] : null;
                            } else {
                                return config[prop];
                            }
                        },
                        /**
                         * Boolean show/hide the resource column
                         * @param show - Default show (true)
                         * @returns {GanttChart}
                         */
                        setShowResource: function (show) {
                            config.tasks.showResource = show;
                            return this;
                        },
                        /**
                         * Boolean show/hide the duration column
                         * @param show true to show (default), false to hide
                         */
                        setShowDuration: function (show) {
                            config.tasks.showDuration = show;
                            return this;
                        },
                        setUseFade: function (fade) {
                            config.useFade = fade;
                            return this;
                        },
                        setUseMove: function (move) {
                            config.useMove = move;
                            return this;
                        },
                        setUseRowHlt: function (hlt) {
                            config.useRowHlt = hlt;
                            return this;
                        },
                        setUseToolTip: function (show) {
                            config.showToolTip = show;
                            return this;
                        },
                        setUseSort: function (sort) {
                            config.enableSort = sort;
                            return this;
                        },
                        setUseSingleCell: function (value) {
                            //Just to make sure its number
                            config.useSingleCell = isNaN(value * 1) ? config.useSingleCell : value * 1;
                            return this;
                        },
                        setShowComplete: function (show) {
                            config.tasks.showComplete = show;
                            return this;
                        },
                        setShowStartDate: function (show) {
                            config.tasks.showStartDate = show;
                            return this;
                        },
                        setShowEndDate: function (show) {
                            config.tasks.showEndDate = show;
                            return this;
                        },
                        setShowTaskInfoResource: function (show) {
                            config.showTaskInfoResource = show;
                            return this;
                        },
                        setShowTaskInfoDuration: function (show) {
                            config.showTaskInfoDuration = show;
                            return this;
                        },
                        setShowTaskInfoCompletion: function (show) {
                            config.showTaskInfoCompletion = show;
                            return this;
                        },
                        setShowTaskInfoStartDate: function (show) {
                            config.showTaskInfoStartDate = show;
                            return this;
                        },
                        setShowTaskInfoEndDate: function (show) {
                            config.showTaskInfoEndDate = show;
                            return this;
                        },
                        setShowTaskInfoNotes: function (show) {
                            config.showTaskInfoNotes = show;
                            return this;
                        },
                        setShowTaskInfoLink: function (show) {
                            config.showTaskInfoLink = show;
                            return this;
                        },
                        setShowEndWeekDate: function (show) {
                            config.showEndWeekDate = show;
                            return this;
                        },
                        setShowSelector: function (position) {
                            var validSelector = config.validSelectorsPosition;
                            if ($.inArray(validSelector, position.toLowerCase() > 0)) {
                                config.defaultSelectorPosition = position.toLowerCase();
                            }
                        },

                        setShowDependencies: function (show) {
                            config.tasks.showDependencies = show;
                            return this;
                        },
                        setDateInputFormat: function (format) {
                            config.dateInputFormat = format;
                            return this;
                        },
                        setDateTaskTableDisplayFormat: function (format) {
                            config.dateTaskTableDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setDateTaskDisplayFormat: function (format) {
                            config.dateTaskDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setHourMajorDateDisplayFormat: function (format) {
                            config.hourMajorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setHourMinorDateDisplayFormat: function (format) {
                            config.hourMinorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setDayMajorDateDisplayFormat: function (format) {
                            config.dayMajorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setDayMinorDateDisplayFormat: function (format) {
                            config.dayMinorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setWeekMajorDateDisplayFormat: function (format) {
                            config.weekMajorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setWeekMinorDateDisplayFormat: function (format) {
                            config.weekMinorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setMonthMajorDateDisplayFormat: function (format) {
                            config.monthMajorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setMonthMinorDateDisplayFormat: function (format) {
                            config.monthMinorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setQuarterMajorDateDisplayFormat: function (format) {
                            config.quarterMajorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },
                        setQuarterMinorDateDisplayFormat: function (format) {
                            config.quarterMinorDateDisplayFormat = parseDateFormatStr(format);
                            return this;
                        },

                        setHourColWidth: function (width) {
                            config.hourColWidth = parseInt(width, 10) || 18;
                            return this;
                        },
                        setDayColWidth: function (width) {
                            config.dayColWidth = parseInt(width, 10) || 18;
                            return this;
                        },
                        setWeekColWidth: function (width) {
                            config.weekColWidth = parseInt(width, 10) || 36;
                            return this;
                        },
                        setMonthColWidth: function (width) {
                            config.monthColWidth = parseInt(width, 10) || 36;
                            return this;
                        },
                        setQuarterColWidth: function (width) {
                            config.quarterColWidth = parseInt(width, 10) || 18;
                            return this;
                        },
                        setRowHeight: function (height) {
                            config.rowHeight = parseInt(height, 10) || 20;
                            return this;
                        },
                        setLang: function (lang) {
                            if (!config.langs[lang]) {
                                config.lang = lang;
                            }
                            return this;
                        },
                        addLang: function (lang, obj) {
                            if (!config.langs[lang] && $.isObject(obj)) {
                                config.langs[lang] = {};
                                var langs = config.langs['en'];
                                for (var key in langs) {
                                    config.langs[lang][key] = obj[key] ? obj[key] : langs[key];
                                }
                            }
                            return this;
                        }
                    }
                }(),

                setCaptionType: function (type) {
                    captionType = type;
                    return this;
                },

                /**
                 * Change the view format ex: Hours, Days, week etc... after setting must call draw
                 * @param viewType
                 * @returns {ganttChart}
                 */
                changeViewFormat: function (viewType) {
                    format = $.inArray(viewType, config.viewTypes) !== -1 ? viewType : format;
                    return this;
                },

                setMinGpLen: function (vMinGpLen) {
                    minGpLen = vMinGpLen;
                    return this;
                },

                setScrollTo: function (date) {
                    scrollTo = date;
                    return this;
                },

                getMinGpLen: function () {
                    return minGpLen;
                },

                getUseFade: function () {
                    return config.useFade;
                },

                getUseMove: function () {
                    return config.useMove;
                },

                getUseRowHlt: function () {
                    return config.useRowHlt;
                },

                getUseToolTip: function () {
                    return config.showToolTip;
                },

                getUseSort: function () {
                    return config.enableSort;
                },

                getUseSingleCell: function () {
                    return config.useSingleCell;
                },

                getViewTypes: function () {
                    return config.viewTypes;
                },

                getShowResource: function () {
                    return config.tasks.showResource;
                },

                getShowDuration: function () {
                    return config.tasks.showDuration;
                },

                getShowCompletion: function () {
                    return config.tasks.showCompletion;
                },

                getShowStartDate: function () {
                    return config.showStartDate;
                },

                getShowEndDate: function () {
                    return config.tasks.showEndDate;
                },

                getShowTaskInfoResource: function () {
                    return config.showTaskInfoResource;
                },

                getShowTaskInfoDuration: function () {
                    return config.showTaskInfoDuration;
                },

                getShowTaskInfoCompletion: function () {
                    return config.showTaskInfoCompletion;
                },

                getShowTaskInfoStartDate: function () {
                    return config.showTaskInfoStartDate;
                },

                getShowTaskInfoEndDate: function () {
                    return config.showTaskInfoEndDate;
                },

                getShowTaskInfoNotes: function () {
                    return config.showTaskInfoNotes;
                },

                getShowTaskInfoLink: function () {
                    return config.showTaskInfoLink;
                },

                getShowEndWeekDate: function () {
                    return config.showEndWeekDate;
                },

                getShowSelector: function () {
                    return config.tasks.showSelector;
                },

                getShowDependencies: function () {
                    return config.tasks.showDependencies;
                },

                getDateInputFormat: function () {
                    return config.dateInputFormat;
                },

                getDateTaskTableDisplayFormat: function () {
                    return config.dateTaskTableDisplayFormat
                },

                getDateTaskDisplayFormat: function () {
                    return config.dateTaskDisplayFormat;
                },

                getHourMajorDateDisplayFormat: function () {
                    return config.hourMajorDateDisplayFormat;
                },

                getHourMinorDateDisplayFormat: function () {
                    return config.hourMinorDateDisplayFormat;
                },

                getDayMajorDateDisplayFormat: function () {
                    return config.dayMajorDateDisplayFormat;
                },

                getDayMinorDateDisplayFormat: function () {
                    return config.dayMinorDateDisplayFormat;
                },

                getWeekMajorDateDisplayFormat: function () {
                    return config.weekMajorDateDisplayFormat;
                },

                getWeekMinorDateDisplayFormat: function () {
                    return config.weekMinorDateDisplayFormat;
                },

                getMonthMajorDateDisplayFormat: function () {
                    return config.monthMajorDateDisplayFormat;
                },

                getMonthMinorDateDisplayFormat: function () {
                    return config.monthMinorDateDisplayFormat;
                },

                getQuarterMajorDateDisplayFormat: function () {
                    return config.quarterMajorDateDisplayFormat;
                },

                getQuarterMinorDateDisplayFormat: function () {
                    return config.quarterMinorDateDisplayFormat;
                },

                getCaptionType: function () {
                    return captionType;
                },

                getMinGpLen: function () {
                    return minGpLen;
                },

                getScrollTo: function () {
                    return scrollTo;
                },

                getHourColWidth: function () {
                    return config.hourColWidth;
                },

                getDayColWidth: function () {
                    return config.dayColWidth;
                },

                getWeekColWidth: function () {
                    return config.weekColWidth;
                },

                getMonthColWidth: function () {
                    return config.monthColWidth;
                },

                getQuarterColWidth: function () {
                    return config.quarterColWidth;
                },

                getRowHeight: function () {
                    return config.rowHeight;
                },

                getTaskList: function () {
                    return taskList;
                }
            }
        };

        return {
            getInstanceById: function (id) {
                return instances[id];
            },

            getAllInstances: function () {
                return instances;
            },
            getDefaultGlobalConfig: function () {
                return config(true);
            },

            addLang: function (lang, obj) {
                if (!globalConfig.langs[lang] && $.isObject(obj)) {
                    globalConfig.langs[lang] = {};
                    var langs = globalConfig.langs['en'];
                    for (var key in langs) {
                        globalConfig.langs[lang][key] = obj[key] ? obj[key] : langs[key];
                    }
                }
            },

            newInstance: function ($element, format) {
                if (!$element) {
                    throw Error('Element is undefined, can\'t create instance');
                }
                //We will use the jquery
                if (!$element.jquery) {
                    $element = $($element);
                }

                var ganttId = $element.attr('id'),
                    instance, config = {};

                if (ganttId && instances[ganttId]) {
                    return instances[ganttId];
                }
                ganttId = helper.getUUID(5);

                $.extend(true, config, globalConfig);

                format = $.inArray(format, config.viewTypes) !== -1 ? format : 'day';

                instance = new Create($element, format, ganttId, config);
                instances[ganttId] = instance;

                var VC = {
                    ID_CHILD: ganttId + 'child_',
                    ID_CHILD_ROW: ganttId + 'childrow_',
                    ID_TASK_CONTAINER: ganttId + 'bardiv_',
                    ID_TASK_BAR: ganttId + 'taskbar_',
                    ID_TOOLTIP_TASK_BAR: 'tt' + ganttId + 'taskbar_',
                    ID_TOOLTIP_COMPLETE: 'tt' + 'complete_',
                    ID_COMPLETE: ganttId + 'complete_',
                    ID_LINE: ganttId + 'line',
                    ID_CHART_TABLE: ganttId + 'chartTable',
                    ID_CHART_TABLE_HEADER: ganttId + 'chartTableh',
                    ID_GROUP: ganttId + 'group_',
                    ID_FORMAT: ganttId + 'format',
                    ID_FORMAT_HOUR: ganttId + 'formathour',
                    ID_FORMAT_DAY: ganttId + 'formatday',
                    ID_FORMAT_WEEK: ganttId + 'formatweek',
                    ID_FORMAT_MONTH: ganttId + 'formatmonth',
                    ID_FORMAT_QUARTER: ganttId + 'formatquarter',
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
                };

                var todayPx = -1, dependId = 1, processNeeded = true;

                /**
                 * Get the margin from start and end dates based on colWidth
                 * @param startDate (Date) Start Date
                 * @param endDate (Date) End date
                 * @param colWidth (Number) column width
                 * @param $format (String) active view format (see the supported views)
                 * @returns {number}
                 */
                function getOffset(startDate, endDate, colWidth, $format) {
                    $format = $format || format;

                    var monthDays = config.monthDays,
                        taskStart = new Date(startDate.getTime()),
                        taskEnd = new Date(endDate.getTime()),
                        taskRightPx = 0,
                        tmpTaskStart = Date.UTC(taskStart.getFullYear(), taskStart.getMonth(), taskStart.getDate(), taskStart.getHours(), 0, 0),
                        tmpTaskEnd = Date.UTC(taskEnd.getFullYear(), taskEnd.getMonth(), taskEnd.getDate(), taskEnd.getHours(), 0, 0),
                        taskRight = (tmpTaskEnd - tmpTaskStart) / 3600000,
                        monthsDifference, posTmpDate, daysCorrection; // Length of task in hours

                    if ($format === 'day') {
                        taskRightPx = Math.ceil((taskRight / 24) * (colWidth + 1));
                    } else if (format === 'week') {
                        taskRightPx = Math.ceil(((taskRight / 24) * (colWidth + 1)) / 7);
                    } else if ($format === 'month') {
                        monthsDifference = (12 * (taskEnd.getFullYear() - taskStart.getFullYear())) + (taskEnd.getMonth() - taskStart.getMonth());
                        posTmpDate = new Date(taskEnd.getTime());
                        posTmpDate.setDate(taskStart.getDate());
                        daysCorrection = (taskEnd.getTime() - posTmpDate.getTime()) / (86400000);
                        taskRightPx = Math.ceil((monthsDifference * (colWidth + 1)) + (daysCorrection * (colWidth / monthDays[taskEnd.getMonth()])));
                    } else if ($format === 'quarter') {
                        monthsDifference = (12 * (taskEnd.getFullYear() - taskStart.getFullYear())) + (taskEnd.getMonth() - taskStart.getMonth());
                        posTmpDate = new Date(taskEnd.getTime());
                        posTmpDate.setDate(taskStart.getDate());
                        daysCorrection = (taskEnd.getTime() - posTmpDate.getTime()) / (86400000);
                        taskRightPx = Math.ceil((monthsDifference * ((colWidth + 1) / 3)) + (daysCorrection * (colWidth / 90)));
                    } else if ($format === 'hour') {
                        // can't just calculate sum because of daylight savings changes
                        var vPosTmpDate = new Date(taskEnd.getTime());
                        vPosTmpDate.setMinutes(taskStart.getMinutes(), 0);
                        var vMinsCrctn = (taskEnd.getTime() - vPosTmpDate.getTime()) / (3600000);
                        taskRightPx = Math.ceil((taskRight * (colWidth + 1)) + (vMinsCrctn * (colWidth)));
                    }

                    return taskRightPx;
                }

                /**
                 * Calculate the position of each task
                 */
                instance.calcTaskXY = function () {
                    var list = instance.getTaskList(),
                        barDiv, taskDiv, parDiv,
                        height = Math.floor(this.getRowHeight() / 2);

                    for (var i = 0; i < list.length; i++) {
                        var task = list[i],
                            taskId = task.getId();
                        barDiv = $element.find(VC.ID_TASK_CONTAINER + taskId);
                        taskDiv = $element.find(VC.ID_TASK_BAR + taskId);

                        if (task.getParItem() && task.getParItem().getGroup() === 2) {
                            parDiv = $element.find(VC.ID_CHILD_ROW + task.getParItem().getId());
                        } else {
                            parDiv = $element.find(VC.ID_CHILD_ROW + taskId);
                        }

                        if (barDiv.length > 0) {
                            var barOffset = barDiv.offset(),
                                parOffset = parDiv.offset();
                            task.setStartX(barOffset.left + 1);
                            task.setStartY(parOffset.top + barOffset.top + height - 1);
                            task.setEndX(barOffset.left + barDiv.outerWidth() + 1);
                            task.setEndY(parOffset.top + barOffset.top + height - 1);
                        }
                    }
                };

                /**
                 * Add task dynamically
                 * @param taskItem
                 */
                instance.addTaskItem = function (taskItem) {
                    var isExist = false,
                        list = instance.getTaskList();
                    for (var i = 0; i < list.length; i++) {
                        var task = list[i];
                        if (task.getID() === taskItem.getID()) {
                            i = list.length;
                            isExist = true;
                        }
                    }
                    if (!isExist) {
                        list.push(taskItem);
                        processNeeded = true;
                    }
                };

                /**
                 * Remove task dynamically
                 * @param id (Required) Task Id
                 */
                instance.removeTaskItem = function (id) {
                    if (typeof id === 'undefined') { //id can be 0 or string, 0 == false so can't use
                        var taskList = this.getTaskList(),
                            n = taskList.length;
                        for (var i = 0; i < n; i++) {
                            var task = taskList[i];
                            if (task.getId() === id) {
                                task.setToDelete(true);
                            } else if (task.getParent() === id) {
                                this.removeTaskItem(task.getId());
                            }
                        }
                        processNeeded = true;
                    }
                };

                /**
                 * Clear the dependencies before re-render
                 */
                instance.clearDependencies = function () {
                    var parent = this.getChartBody(),
                        dependLine, maxId = dependId;

                    for (var i = 1; i < maxId; i++) {
                        dependLine = parent.find(VC.ID_LINE + i);
                        if (dependLine.length > 0) {
                            dependLine.remove();
                        }
                    }
                    dependId = 1;
                };

                /**
                 * Draw a straight line (colored one-pixel wide div), need to parametrize doc item
                 * @param x1
                 * @param y1
                 * @param x2
                 * @param y2
                 * @param cssClass
                 */
                instance.sLine = function (x1, y1, x2, y2, cssClass) {
                    var left = Math.min(x1, x2),
                        top = Math.min(y1, y2),
                        width = Math.abs(x2 - x1) + 1,
                        height = Math.abs(y2 - y1) + 1;

                    var div = elements.div()
                        .attr('id', VC.ID_LINE + dependId++)
                        .css({
                            position: 'absolute',
                            overflow: 'hidden',
                            zIndex: 0,
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

                    this.getChartBody().append(div);
                };

                /**
                 * Draw a diagonal line (calc line x,y pairs and draw multiple one-by-one sLines)
                 * @param x1
                 * @param y1
                 * @param x2
                 * @param y2
                 * @param cssClass
                 */
                instance.dLine = function (x1, y1, x2, y2, cssClass) {
                    var dx = x2 - x1, dy = y2 - y1,
                        x = x1, y = y1;
                
                    var n = Math.max(Math.abs(dx), Math.abs(dy));
                    dx = dx / n;
                    dy = dy / n;
                    for (var i = 0; i <= n; i++) {
                        var vx = Math.round(x);
                        var vy = Math.round(y);
                        this.sLine(vx, vy, vx, vy, cssClass);
                        x += dx;
                        y += dy;
                    }
                };

                instance.drawDependency = function (x1, y1, x2, y2, type, cssClass) {
                    var direction = 1, bend = false, short = 4;
                    var row = Math.floor(this.getRowHeight() / 2);

                    if (y2 < y1) row *= -1;

                    switch (type) {
                        case 'SF':
                            if (x1 - 10 > x2) {
                                short *= -1;
                            } else {
                                bend = true;
                                short *= -1;
                            }
                            direction = -1;
                            break;

                        case 'SS':
                            if (x1 < x2) {
                                short *= -1;
                            } else {
                                short = x2 - x1 - (2 * short);
                            }
                            break;

                        case 'FF':
                            if (x1 <= x2) {
                                short = x2 - x1 + (2 * short);
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
                        this.sLine(x1, y1, x1 + short, y1, cssClass);
                        this.sLine(x1 + short, y1, x1 + short, y2 - row, cssClass);
                        this.sLine(x1 + short, y2 - row, x2 - (short * 2), y2 - row, cssClass);
                        this.sLine(x2 - (short * 2), y2 - row, x2 - (short * 2), y2, cssClass);
                        this.sLine(x2 - (short * 2), y2, x2, y2, cssClass);
                    } else {
                        this.sLine(x1, y1, x1 + short, y1, cssClass);
                        this.sLine(x1 + short, y1, x1 + short, y2, cssClass);
                        this.sLine(x1 + short, y2, x2, y2, cssClass);
                    }

                    this.dLine(x2, y2, x2 - (3 * direction), y2 - (3 * direction), cssClass);
                    this.dLine(x2, y2, x2 - (3 * direction), y2 + (3 * direction), cssClass);
                    this.dLine(x2 - (1 * direction), y2, x2 - (3 * direction), y2 - (2 * direction), cssClass);
                    this.dLine(x2 - (1 * direction), y2, x2 - (3 * direction), y2 + (2 * direction), cssClass);
                };

                /**
                 * Draw dependency lines b/w connected tasks
                 */
                instance.drawDependencies = function () {
                    if (this.getShowDeps() == 1) {
                        //First recalculate the x,y
                        this.calcTaskXY();
                        this.clearDependencies();

                        var list = this.getTaskList();
                        for (var i = 0; i < list.length; i++) {
                            var taskItem = list[i],
                                depend = taskItem.getDepend(),
                                dependType = taskItem.getDepType(),
                                n = depend.length;

                            if (n > 0 && taskItem.getVisible() == 1) {
                                for (var k = 0; k < n; k++) {
                                    var task = this.getArrayLocationByID(depend[k]);
                                    if (task >= 0 && list[task].getGroup() !== 2) {
                                        if (list[task].getVisible() === 1) {
                                            if (dependType[k] == 'SS') {
                                                this.drawDependency(list[task].getStartX() - 1, list[task].getStartY(), list[i].getStartX() - 1, list[i].getStartY(), 'SS', 'gDepSS');
                                            }
                                            else if (dependType[k] == 'FF') {
                                                this.drawDependency(list[task].getEndX(), list[task].getEndY(), list[i].getEndX(), list[i].getEndY(), 'FF', 'gDepFF');
                                            }
                                            else if (dependType[k] == 'SF') {
                                                this.drawDependency(list[task].getStartX() - 1, list[task].getStartY(), list[i].getEndX(), list[i].getEndY(), 'SF', 'gDepSF');
                                            }
                                            else if (dependType[k] == 'FS') {
                                                this.drawDependency(list[task].getEndX(), list[task].getEndY(), list[i].getStartX() - 1, list[i].getStartY(), 'FS', 'gDepFS');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // draw the current date line
                    if (todayPx >= 0) {
                        this.sLine(todayPx, 0, todayPx, $element.find('#' + this.getId() + 'chartTable').outerHeight() - 1, 'gCurDate');
                    }
                };

                /**
                 * Render the Right header
                 */
                instance.renderGridHeader = function () {
                    var lang = config.langs[config.lang];
                    var listHeaderTableBody = elements.tbody()
                        .appendTo(elements.table().addClass(VC.CLASS_TASK_TABLE_HEADER));

                    this.getListHeader().html(listHeaderTableBody);
                    var tr1LeftHeader = elements.tr().appendTo(listHeaderTableBody)
                        .append(elements.td().addClass(VC.CLASS_TASK_LIST).text('\u00A0'))
                        .append(elements.td().addClass(VC.CLASS_SPANNING + ' ' + VC.CLASS_TASK_NAME).append(this.drawSelector()));

                    var tr2LeftHeader = elements.tr().appendTo(listHeaderTableBody)
                        .append(elements.td().addClass(VC.CLASS_TASK_LIST).text('\u00A0'))
                        .append(elements.td().addClass(VC.CLASS_TASK_NAME).text('\u00A0'));
                    //TODO we have to support dynamic column's rather predefined

                    if (this.getShowResource()) {
                        tr1LeftHeader.append(elements.td().addClass(VC.CLASS_SPANNING + ' ' + VC.CLASS_TASK_RESOURCE).text('\u00A0'));
                        tr2LeftHeader.append(elements.td().addClass(VC.CLASS_TASK_HEADING + ' ' + VC.CLASS_TASK_RESOURCE).text(lang['resource']));
                    }

                    if (this.getShowDuration()) {
                        tr1LeftHeader.append(elements.td().addClass(VC.CLASS_SPANNING + ' ' + VC.CLASS_TASK_DURATION).text('\u00A0'));
                        tr2LeftHeader.append(elements.td().addClass(VC.CLASS_TASK_HEADING + ' ' + VC.CLASS_TASK_DURATION).text(lang['duration']));
                    }

                    if (this.getShowCompletion()) {
                        tr1LeftHeader.append(elements.td().addClass(VC.CLASS_SPANNING + ' ' + VC.CLASS_TASK_COMPLETE).text('\u00A0'));
                        tr2LeftHeader.append(elements.td().addClass(VC.CLASS_TASK_HEADING + ' ' + VC.CLASS_TASK_COMPLETE).text(lang['comp']));
                    }

                    if (this.getShowStartDate()) {
                        tr1LeftHeader.append(elements.td().addClass(VC.CLASS_SPANNING + ' ' + VC.CLASS_TASK_START_DATE).text('\u00A0'));
                        tr2LeftHeader.append(elements.td().addClass(VC.CLASS_TASK_HEADING + ' ' + VC.CLASS_TASK_START_DATE).text(lang['startdate']));
                    }

                    if (this.getShowEndDate()) {
                        tr1LeftHeader.append(elements.td().addClass(VC.CLASS_SPANNING + ' ' + VC.CLASS_TASK_END_DATE).text('\u00A0'));
                        tr2LeftHeader.append(elements.td().addClass(VC.CLASS_TASK_HEADING + ' ' + VC.CLASS_TASK_END_DATE).text(lang['enddate']));
                    }
                };

                /**
                 * Render the grid
                 * @returns {number}
                 */
                instance.renderGridBody = function () {
                    var leftGridTableBody = elements.tbody()
                            .appendTo(elements.table().addClass(VC.CLASS_TASK_TABLE)),
                        tasksList = this.getTaskList(),
                        tasksCount = tasksList.length,
                        rows = 0;

                    this.getListBody().html(leftGridTableBody);

                    var task, vID, bgColor, trName, cellContents = '', taskName, j, div,
                        showRes = this.getShowResource(), showDur = this.getShowDuration(),
                        showComp = this.getShowCompletion(), showStartDate = this.getShowStartDate(),
                        showEndDate = this.getShowEndDate();
                    for (var i = 0; i < tasksCount; i++) {
                        task = tasksList[i];
                        vID = task.getID();

                        if (task.getGroup() === 1) {
                            bgColor = VC.CLASS_GROUP_ITEM;
                        } else {
                            bgColor = VC.CLASS_LINE_ITEM;
                        }

                        if (!(task.getParItem() && task.getParItem().getGroup() === 2) || task.getGroup() === 2) {
                            trName = elements.tr().attr('id', VC.ID_CHILD + vID)
                                .addClass(VC.CLASS_TASK_NAME + ' ' + bgColor)
                                .css({display: task.getVisible() ? '' : 'none'})
                                .appendTo(leftGridTableBody);

                            trName.append(elements.td().addClass(VC.CLASS_TASK_LIST).text('\u00A0'));
                            taskName = elements.td().addClass(VC.CLASS_TASK_NAME).appendTo(trName);

                            //TODO have to change it to padding
                            cellContents = '';
                            for (j = 1; j < task.getLevel(); j++) {
                                cellContents = '\u00A0\u00A0\u00A0\u00A0';
                            }
                            div = elements.div();
                            if (task.getGroup() === 1) {
                                div.text(cellContents)
                                    .append(elements.span()
                                        .attr('id', VC.ID_GROUP + vID)
                                        .addClass(VC.CLASS_FOLDER_COLLAPSE)
                                        .text(task.getOpen() ? '-' : '+'))
                                    .append(document.createTextNode('\u00A0' + task.getName()));
                            } else {
                                cellContents = '\u00A0\u00A0\u00A0\u00A0';
                                div.text(cellContents + task.getName());
                            }

                            if (showRes) {
                                elements.td()
                                    .addClass(VC.CLASS_TASK_RESOURCE)
                                    .append(elements.div().text(task.getResource()))
                                    .appendTo(trName);
                            }

                            if (showDur) {
                                elements.td()
                                    .addClass(VC.CLASS_TASK_DURATION)
                                    .append(elements.div().text(task.getDuration()))
                                    .appendTo(trName);
                            }

                            if (showComp) {
                                elements.td()
                                    .addClass(VC.CLASS_TASK_COMPLETE)
                                    .append(elements.div().text(task.getCompStr()))
                                    .appendTo(trName);
                            }

                            if (showStartDate) {
                                elements.td()
                                    .addClass(VC.CLASS_TASK_START_DATE)
                                    .append(elements.div().text(this.formatDate(task.getStart(), this.getDateTaskTableDisplayFormat())))
                                    .appendTo(trName);
                            }

                            if (showEndDate) {
                                elements.td()
                                    .addClass(VC.CLASS_TASK_END_DATE)
                                    .append(elements.div().text(this.formatDate(task.getEnd(), this.getDateTaskTableDisplayFormat())))
                                    .appendTo(trName);
                            }
                            rows++;
                        }
                    }

                    return rows;
                };

                instance.renderChartHeader = function (vTmpDate, vMinDate, vMaxDate, vColWidth) {
                    var headerBody = elements.tbody()
                            .appendTo(elements.table()
                                .attr('id', VC.ID_CHART_TABLE_HEADER)
                                .addClass(VC.CLASS_CHART_TABLE_HEADER)),
                        cols = 0;

                    this.getChartHeader().html(headerBody);

                    var tr1ChartHeader = elements.tr().appendTo(headerBody);

                    vTmpDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate());

                    if (format === 'hour') {
                        vTmpDate.setHours(vMinDate.getHours());
                    } else {
                        vTmpDate.setHours(0);
                    }

                    vTmpDate.setMinutes(0);
                    vTmpDate.setSeconds(0);
                    vTmpDate.setMilliseconds(0);

                    // Major Date Header
                    var headerCellClass = VC.CLASS_MAJOR_HEADING,
                        cellContents = '', td, colSpan;
                    while (vTmpDate.getTime() <= vMaxDate.getTime()) {
                        cellContents = '';
                        colSpan = '';
                        td = elements.td().addClass(headerCellClass);

                        if (format === 'day') {
                            cellContents = this.formatDate(vTmpDate, this.getDayMajorDateDisplayFormat());
                            vTmpDate.setDate(vTmpDate.getDate() + 6);

                            if (this.getShowEndWeekDate()) {
                                cellContents += this.formatDate(vTmpDate, this.getDayMajorDateDisplayFormat());
                            }
                            td.attr('colspan', 7)
                                .append(elements.div()
                                    .text(cellContents)
                                    .css({width: this.getWidth(vColWidth * 7)}))
                                .appendTo(tr1ChartHeader);

                            vTmpDate.setDate(vTmpDate.getDate() + 1);

                        } else if (format === 'week') {
                            td.css({width: this.getWidth(vColWidth)})
                                .append(elements.div()
                                    .text(this.formatDate(vTmpDate, this.getWeekMajorDateDisplayFormat()))
                                    .css({width: this.getWidth(vColWidth)}))
                                .appendTo(tr1ChartHeader);

                            vTmpDate.setDate(vTmpDate.getDate() + 7);

                        } else if (format === 'month') {
                            colSpan = (12 - vTmpDate.getMonth());
                            if (vTmpDate.getFullYear() === vMaxDate.getFullYear()) {
                                colSpan -= (11 - vMaxDate.getMonth());
                            }
                            td.attr('colspan', colSpan)
                                .append(elements.div()
                                    .text(this.formatDate(vTmpDate, this.getMonthMajorDateDisplayFormat()))
                                    .css({width: this.getWidth(vColWidth * colSpan)}))
                                .appendTo(tr1ChartHeader);

                            vTmpDate.setFullYear(vTmpDate.getFullYear() + 1, 0, 1);

                        } else if (format === 'quarter') {
                            colSpan = (4 - Math.floor(vTmpDate.getMonth() / 3));
                            if (vTmpDate.getFullYear() == vMaxDate.getFullYear()) {
                                colSpan -= (3 - Math.floor(vMaxDate.getMonth() / 3));
                            }
                            td.attr('colspan', colSpan)
                                .append(elements.div()
                                    .text(this.formatDate(vTmpDate, this.getQuarterMajorDateDisplayFormat()))
                                    .css({width: this.getWidth(vColWidth * colSpan)}))
                                .appendTo(tr1ChartHeader);

                            vTmpDate.setFullYear(vTmpDate.getFullYear() + 1, 0, 1);

                        } else if (format === 'hour') {
                            colSpan = (24 - vTmpDate.getHours());
                            if (vTmpDate.getFullYear() == vMaxDate.getFullYear() &&
                                vTmpDate.getMonth() == vMaxDate.getMonth() &&
                                vTmpDate.getDate() == vMaxDate.getDate()) {
                                colSpan -= (23 - vMaxDate.getHours());
                            }

                            td.attr('colspan', colSpan)
                                .append(elements.div()
                                    .text(this.formatDate(vTmpDate, this.getHourMajorDateDisplayFormat()))
                                    .css({width: this.getWidth(vColWidth * colSpan)}))
                                .appendTo(tr1ChartHeader);

                            vTmpDate.setDate(vTmpDate.getDate() + 1);
                        }
                    }

                    // Minor Date header and Cell Rows
                    var tr2ChartHeader = elements.tr().appendTo(headerBody);

                    vTmpDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate(), vMinDate.getHours());

                    if (format === 'hour') {
                        vTmpDate.setHours(vMinDate.getHours());
                    }


                    var cellClass, i;

                    while (vTmpDate.getTime() <= vMaxDate.getTime()) {
                        headerCellClass = VC.CLASS_MINOR_HEADING;
                        cellClass = VC.CLASS_TASK_CELL;

                        if (format === 'day') {
                            if (vTmpDate.getDay() % 6 === 0) {
                                headerCellClass += VC.CLASS_WEEK_END;
                                cellClass += VC.CLASS_WEEK_END;
                            }
                            if (vTmpDate <= vMaxDate) {
                                elements.td().addClass(headerCellClass)
                                    .append(elements.div()
                                        .text(this.formatDate(vTmpDate, this.getDayMinorDateDisplayFormat()))
                                        .css({width: this.getWidth(vColWidth)}))
                                    .appendTo(tr2ChartHeader);

                                cols++;
                            }

                            vTmpDate.setDate(vTmpDate.getDate() + 1);

                        } else if (format === 'week') {
                            if (vTmpDate <= vMaxDate) {
                                elements.td().addClass(headerCellClass)
                                    .append(elements.div()
                                        .text(this.formatDate(vTmpDate, this.getWeekMinorDateDisplayFormat()))
                                        .css({width: this.getWidth(vColWidth)}))
                                    .appendTo(tr2ChartHeader);

                                cols++;
                            }

                            vTmpDate.setDate(vTmpDate.getDate() + 7);

                        } else if (format === 'month') {
                            if (vTmpDate <= vMaxDate) {
                                elements.td().addClass(headerCellClass)
                                    .append(elements.div()
                                        .text(this.formatDate(vTmpDate, this.getMonthMinorDateDisplayFormat()))
                                        .css({width: this.getWidth(vColWidth)}))
                                    .appendTo(tr2ChartHeader);

                                cols++;
                            }

                            vTmpDate.setDate(vTmpDate.getDate() + 1);

                            while (vTmpDate.getDate() > 1) {
                                vTmpDate.setDate(vTmpDate.getDate() + 1);
                            }

                        } else if (format === 'quarter') {
                            if (vTmpDate <= vMaxDate) {
                                elements.td().addClass(headerCellClass)
                                    .append(elements.div()
                                        .text(this.formatDate(vTmpDate, this.getQuarterMinorDateDisplayFormat()))
                                        .css({width: this.getWidth(vColWidth)}))
                                    .appendTo(tr2ChartHeader);

                                cols++;
                            }

                            vTmpDate.setDate(vTmpDate.getDate() + 81);

                            while (vTmpDate.getDate() > 1) {
                                vTmpDate.setDate(vTmpDate.getDate() + 1);
                            }

                        } else if (format === 'hour') {

                            for (i = vTmpDate.getHours(); i < 24; i++) {
                                // works around daylight savings but may look a little odd on days where
                                // the clock goes forward
                                vTmpDate.setHours(i);

                                if (vTmpDate <= vMaxDate) {
                                    elements.td().addClass(headerCellClass)
                                        .append(elements.div()
                                            .text(this.formatDate(vTmpDate, this.getHourMinorDateDisplayFormat()))
                                            .css({width: this.getWidth(vColWidth)}))
                                        .appendTo(tr2ChartHeader);

                                    cols++;
                                }
                            }

                            vTmpDate.setHours(0);
                            vTmpDate.setDate(vTmpDate.getDate() + 1);
                        }
                    }

                    return {cols: cols, tr: tr2ChartHeader, colWidth: vColWidth};
                };

                /**
                 * Render the tasks, links and connections.
                 */
                instance.render = function () {
                    var vMaxDate = new Date(), vMinDate = new Date(), vTmpDate = new Date(), vTaskLeftPx = 0,
                        vTaskRightPx = 0, vTaskWidth = 1, vNumCols = 0, vNumRows = 0, vSingleCell = false,
                        vID = 0, vDateRow = null, vColWidth = 0, vChild, vGroup, vTaskDiv, vParDiv, vMinGpLen = this.getMinGpLen();

                    var tasksList = this.getTaskList(),
                        tasksCount = tasksList.length,
                        lang = config.langs[config.lang];

                    if (tasksCount > 0) {
                        // Process all tasks, reset parent date and completion % if task list has altered
                        if (processNeeded) {
                            this.processRows(tasksList, 0, -1, 1, 1, this.getUseSort());
                        }
                        processNeeded = false;
                        //Get overall min/max dates plus padding
                        vMinDate = this.getMinDate(tasksList, format);
                        vMaxDate = this.getMaxDate(tasksList, format);

                        //Calculate chart width variable
                        if (format === VC.FORMAT_HOUR) {
                            vColWidth = this.getHourColWidth();
                        } else if (format === VC.FORMAT_WEEK) {
                            vColWidth = this.getWeekColWidth();
                        } else if (format === VC.FORMAT_MONTH) {
                            vColWidth = this.getMonthColWidth();
                        } else if (format === VC.FORMAT_QUARTER) {
                            vColWidth = this.getQuarterColWidth();
                        } else { //Assume day
                            vColWidth = this.getDayColWidth();
                        }

                        /********* Drw the Left-side of the chart (names, resources, comp%) *******/

                        this.renderGridHeader();

                        vNumRows = this.renderGridBody();

                        /********* Drw the Left-side of the chart (names, resources, comp%) ends *******/

                        var rtData = this.renderChartHeader(vTmpDate, vMinDate, vMaxDate, vColWidth);

                        vColWidth = rtData.colWidth;
                        vDateRow = rtData.tr;
                        vNumCols = rtData.cols;

                        vTaskLeftPx = (vNumCols * (vColWidth + 1)) + 1;

                        if (config.useSingleCell !== 0 && config.useSingleCell < (vNumCols * vNumRows)) {
                            vSingleCell = true;
                        }

                        var padDiv = elements.div().addClass(VC.CLASS_RT_HEADER_PAD)
                            .css({left: this.getWidth(vTaskLeftPx + 1)})
                            .appendTo(this.getChartHeader());


                        var chartBody = elements.tbody()
                                .appendTo(elements.table()
                                    .attr('id', VC.ID_CHART_TABLE)
                                    .addClass(VC.CLASS_CHART_TABLE)
                                    .css({width: this.getWidth(vTaskLeftPx + 1)})),
                            i = 0, j = 0;
                        tasks = this.getTaskList(),
                            tasksCount = tasks.length, vID;

                        this.getChartBody().html(chartBody);

                        //Draw each row
                        var curTaskStart, curTaskEnd, task;
                        var trChild, taskCell, taskCellDiv, barDiv, taskBar, milestone;
                        for (; i < tasksCount; i++) {
                            trChild = '', taskCell = '', taskCellDiv = '', barDiv = '', taskBar = '', milestone = '';
                            task = tasks[i];
                            curTaskStart = task.getStart();
                            curTaskEnd = task.getEnd();

                            if ((curTaskEnd.getTime() - (curTaskEnd.getTimezoneOffset() * 60000)) % (86400000) == 0) {
                                // add 1 day here to simplify calculations below
                                curTaskEnd = new Date(curTaskEnd.getFullYear(), curTaskEnd.getMonth(), curTaskEnd.getDate() + 1, curTaskEnd.getHours(), curTaskEnd.getMinutes(), curTaskEnd.getSeconds());
                            }

                            vTaskLeftPx = getOffset(vMinDate, curTaskStart, vColWidth);
                            vTaskRightPx = getOffset(curTaskStart, curTaskEnd, vColWidth);

                            vID = task.getID();
                            var vComb = task.getParItem() && task.getParItem().getGroup() === 2;

                            if (task.getMile() && !vComb) {
                                trChild = elements.tr().attr('id', VC.ID_CHILD_ROW + vID)
                                    .addClass(VC.CLASS_MILE_ITEM + ' ' + VC.CLASS_MILE + format)
                                    .css({display: task.getVisible() ? null : 'none'})
                                    .appendTo(chartBody);

                                taskCell = elements.td().addClass(VC.CLASS_TASK_CELL).appendTo(trChild);

                                taskCellDiv = elements.div().addClass(VC.CLASS_TASK_CELL_DIV)
                                    .text('\u00A0\u00A0').appendTo(taskCell);

                                barDiv = elements.div().attr('id', VC.ID_TASK_CONTAINER + vID)
                                    .addClass(VC.CLASS_TASK_BAR_CONTAINER)
                                    .css({width: 12 + 'px', left: (vTaskLeftPx - 6) + 'px'})
                                    .appendTo(taskCellDiv);

                                taskBar = elements.div().attr('id', VC.ID_TASK_BAR + vID)
                                    .addClass(task.getClass())
                                    .css({width: 12 + 'px'})
                                    .appendTo(barDiv);

                                if (task.getCompVal() < 100) {
                                    taskBar.text('\u25CA');
                                } else { //TODO Milestone
                                    elements.div().addClass(VC.CLASS_MILE_DIAMOND)
                                        .append(elements.div().addClass(VC.CLASS_MILE_DIAMOND_TOP))
                                        .append(elements.div().addClass(VC.CLASS_MILE_DIAMOND_BOTTOM))
                                        .appendTo(taskBar);
                                }

                                if (this.getCaptionType()) {
                                    barDiv.append(elements.div()
                                        .addClass(VC.CLASS_MILE_CAPTION)
                                        .text(this.getCaption(task))
                                        .css({width: 120 + 'px', left: 12 + 'px'}));
                                }

                                //TODO tooltip 1041

                                if (!vSingleCell && !vComb) {
                                    var vCellFormat = '';
                                    for (j = 0; j < vNumCols - 1; j++) {
                                        vCellFormat = VC.CLASS_TASK_CELL;
                                        if (format == 'day' && ((j % 7 == 4) || (j % 7 == 5))) {
                                            vCellFormat = VC.CLASS_TASK_CELL_WEEKEND;
                                        }
                                        elements.td().addClass(vCellFormat).text('\u00A0\u00A0').appendTo(trChild);
                                    }
                                }
                            } else {
                                vTaskWidth = vTaskRightPx - 1;

                                // Draw Group Bar which has outer div with inner group div and several
                                // small divs to left and right to create angled-end indicators

                                if (task.getGroup()) { //1061
                                    vTaskWidth = (vTaskWidth > vMinGpLen && vTaskWidth < vMinGpLen * 2) ? vMinGpLen * 2 : vTaskWidth; // Expand to show two end points
                                    vTaskWidth = (vTaskWidth < vMinGpLen) ? vMinGpLen : vTaskWidth; // expand to show one end point

                                    var trClass = task.getGroup() === 2 ? VC.CLASS_LINE_ITEM + ' ' + VC.CLASS_ITEM : VC.CLASS_GROUP_ITEM + ' ' + VC.CLASS_GROUP;
                                    trChild = elements.tr().attr('id', VC.ID_CHILD_ROW + vID)
                                        .addClass(trClass + format)
                                        .css({display: task.getVisible() ? '' : 'none'})
                                        .appendTo(chartBody);

                                    taskCell = elements.td().addClass(VC.CLASS_TASK_CELL).appendTo(trChild);

                                    taskCellDiv = elements.div()
                                        .addClass(VC.CLASS_TASK_CELL_DIV)
                                        .text('\u00A0\u00A0')
                                        .appendTo(taskCell);

                                    task.setCellDiv(taskCellDiv);

                                    if (task.getGroup() === 1) {
                                        barDiv = elements.div()
                                            .attr('id', VC.ID_TASK_CONTAINER + vID)
                                            .css({width: this.getWidth(vTaskWidth), left: this.getWidth(vTaskLeftPx)})
                                            .appendTo(taskCellDiv);

                                        barDiv.append(elements.div().addClass(task.getClass() + VC.CLASS_END_POINT_LEFT));

                                        if (vTaskWidth > (vMinGpLen * 2)) {
                                            barDiv.append(elements.div().addClass(task.getClass() + VC.CLASS_END_POINT_RIGHT));
                                        }

                                        if (this.getCaptionType()) {
                                            barDiv.append(elements.div().addClass(VC.CLASS_GROUP_CAPTION)
                                                .text(this.getCaption(task)).css({width: this.getWidth(120)}));
                                        }

                                        taskBar = elements.div().attr('id', VC.ID_TASK_BAR + vID)
                                            .addClass(task.getClass())
                                            .css({width: this.getWidth(vTaskWidth)})
                                            .appendTo(barDiv);

                                        taskBar.append(elements.div()
                                            .attr('id', VC.ID_COMPLETE + vID)
                                            .addClass(task.getClass() + VC.CLASS_COMPLETE)
                                            .css({width: this.getWidth(task.getCompStr())}));

                                        //TODO tooltip 1090
                                    }

                                    if (!vSingleCell && !vComb) {
                                        var vCellFormat = '';
                                        for (j = 0; j < vNumCols - 1; j++) {
                                            vCellFormat = VC.CLASS_TASK_CELL;
                                            if (format == 'day' && ((j % 7 == 4) || (j % 7 == 5))) {
                                                vCellFormat = VC.CLASS_TASK_CELL_WEEKEND;
                                            }
                                            elements.td().addClass(vCellFormat).text('\u00A0\u00A0').appendTo(trChild);
                                        }
                                    }
                                }
                                else {

                                    vTaskWidth = (vTaskWidth <= 0) ? 1 : vTaskWidth;

                                    if (vComb) {
                                        taskCellDiv = task.getParItem().getCellDiv();
                                    } else {
                                        trChild = elements.tr().attr('id', VC.ID_CHILD_ROW + vID)
                                            .addClass(VC.CLASS_LINE_ITEM + ' ' + VC.CLASS_ITEM + format)
                                            .css({display: task.getVisible() ? '' : 'none'})
                                            .appendTo(chartBody);

                                        taskCell = elements.td().addClass(VC.CLASS_TASK_CELL).appendTo(trChild);

                                        taskCellDiv = elements.div().addClass(VC.CLASS_TASK_CELL_DIV)
                                            .text('\u00A0\u00A0').appendTo(taskCell);
                                    }

                                    // Draw Task Bar which has colored bar div, and opaque completion div
                                    barDiv = elements.div().attr('id', VC.ID_TASK_CONTAINER + vID)
                                        .addClass(VC.CLASS_TASK_BAR_CONTAINER)
                                        .css({width: this.getWidth(vTaskWidth), left: this.getWidth(vTaskLeftPx)})
                                        .appendTo(taskCellDiv);

                                    taskBar = elements.div().addClass(task.getClass())
                                        .css({width: this.getWidth(vTaskWidth)})
                                        .appendTo(barDiv);

                                    taskBar.append(elements.div().attr('id', VC.ID_COMPLETE + vID)
                                        .addClass(task.getClass() + VC.CLASS_COMPLETE)
                                        .css({width: this.getWidth(task.getCompStr())}));

                                    if (this.getCaptionType() && (!vComb || (vComb && task.getParItem().getEnd() === task.getEnd()))) {
                                        barDiv.append(elements.div()
                                            .addClass(VC.CLASS_CAPTION)
                                            .text(this.getCaption(task))
                                            .css({width: this.getWidth(120)}));
                                    }

                                    //TODO tooltip 1140

                                    if (!vSingleCell && !vComb) {
                                        var vCellFormat = '';
                                        for (j = 0; j < vNumCols - 1; j++) {
                                            vCellFormat = VC.CLASS_TASK_CELL;
                                            if (format == 'day' && ((j % 7 == 4) || (j % 7 == 5))) {
                                                vCellFormat = VC.CLASS_TASK_CELL_WEEKEND;
                                            }
                                            elements.td().addClass(vCellFormat).text('\u00A0\u00A0').appendTo(trChild);
                                        }
                                    }
                                }
                            }

                        } //for ends


                        if (!vSingleCell) {
                            chartBody.append(vDateRow[0].cloneNode(true));
                        }

                        // Now all the content exists, register listeners

                        //TODO have to attach the events in the previous loop it-self.

                        for (var row = 0, rowsCount = this.getTaskList().length; row < rowsCount; row++) {
                            task = this.getTaskList()[row];
                            vID = task.getID();
                            vChild = $element.find('#' + VC.ID_CHILD + vID);
                            vTaskDiv = $element.find('#' + VC.ID_TASK_BAR + vID);
                            vParDiv = $element.find('#' + VC.ID_CHILD_ROW + vID);
                            if (task.getGroup() === 1) {
                                vGroup = $element.find('#' + VC.ID_GROUP + vID);
                            }

                            //TODO yet to add tooltip event - line 1195 in source
                            if (vChild && vParDiv) {

                                vParDiv.hover(
                                    function (ev) {
                                        if (instance.getUseRowHlt()) {
                                            vChild.addClass(VC.CLASS_ITEM_HIGHLIGHT);
                                            vParDiv.addClass(VC.CLASS_ITEM_HIGHLIGHT);
                                        }
                                    },
                                    function (ev) {
                                        if (instance.getUseRowHlt()) {
                                            vChild.removeClass(VC.CLASS_ITEM_HIGHLIGHT);
                                            vParDiv.removeClass(VC.CLASS_ITEM_HIGHLIGHT);
                                        }
                                    });

                                vChild.hover(
                                    function (ev) {
                                        if (instance.getUseRowHlt()) {
                                            vChild.addClass(VC.CLASS_ITEM_HIGHLIGHT);
                                            vParDiv.addClass(VC.CLASS_ITEM_HIGHLIGHT);
                                        }
                                    },
                                    function (ev) {
                                        if (instance.getUseRowHlt()) {
                                            vChild.removeClass(VC.CLASS_ITEM_HIGHLIGHT);
                                            vParDiv.removeClass(VC.CLASS_ITEM_HIGHLIGHT);
                                        }
                                    });
                            }

                            if (task.getGroup() === 1 && vGroup) {
                                this.addFolderListeners(vGroup, vID);
                            }
                        }

                        var setFormat = this.Config().changeViewFormat;
                        //Register events to change the view on clicking diff format views.
                        for (i = 0; i < config.validSelectorsPosition.length; i++) {
                            for (var j = 0; j < config.viewTypes.length; j++) {
                                $element.find('#' + ganttId + 'format' + config.viewTypes[j] + config.validSelectorsPosition[i])
                                    .on('click', function () {
                                        setFormat(config.viewTypes[j]);
                                        instance.render();
                                    });
                            }
                        }

                        //Add scroll and resize listener's
                        this.getGridBody().on('scroll', function (ev) {
                            instance.getChartBody().scrollTop(ev.target.scrollTop);
                        });

                        this.getChartBody().on('scroll', function (ev) {
                            instance.getGridBody().scrollTop(ev.target.scrollTop);
                            instance.getChartHeader().scrollLeft(ev.target.scrollLeft);
                        });

                        this.getChartHeader().on('scroll', function (ev) {
                            instance.getChartBody().scrollLeft(ev.target.scrollLeft);
                        });
                        $(window).resize(function () {
                            instance.getChartHeader().scrollLeft(instance.getChartBody().scrollLeft());
                            instance.getGridBody().scrollTop(instance.getChartBody().scrollTop());
                        });

                        // now check if we are actually scrolling the pane

                        if (scrollTo !== '') {
                            var scrollDate = new Date(vMinDate.getTime()),
                                vScrollPx = 0;

                            if (scrollTo.substr(0, 2) === 'px') {
                                vScrollPx = parseInt(scrollTo.substr(2), 10);
                            } else {
                                if (scrollTo === 'today') {
                                    scrollDate = new Date();
                                } else {
                                    scrollDate = this.date(scrollTo).format(this.getDateInputFormat());
                                    scrollDate.setHours(0, 0, 0, 0); //Zero any time present
                                }
                                vScrollPx = this.getOffset(vMinDate, scrollDate, vColWidth);
                            }
                            this.getChartBody().scrollLeft(vScrollPx);
                        }
                        if (vMinDate.getTime() <= (new Date()).getTime() && vMaxDate.getTime() >= (new Date()).getTime()) {
                            todayPx = getOffset(vMinDate, new Date(), vColWidth);
                        } else {
                            todayPx = -1;
                        }
                        this.drawDependencies();
                    }
                };

                /**
                 * Add events to expand and collepse based on groups
                 * @param $ele
                 * @param id
                 */
                instance.addFolderListeners = function ($ele, id) {
                    var self = this;
                    $ele.on('click', function (ev) {
                        self.folder(id);
                    });
                };

                /**
                 * Create group
                 * @param id
                 */
                instance.folder = function (id) {
                    // clear these first so slow rendering doesn't look odd
                    this.clearDependencies();

                    for (var i = 0, tasks = this.getTaskList().length; i < tasks; i++) {
                        var task = this.getTaskList()[i];

                        if (task.getID() === id) {
                            if (task.getOpen()) {
                                task.setOpen(false);
                                this.hide(id);
                                $element.find('#' + VC.ID_GROUP + vID).text('+');
                            } else {
                                task.setOpen(true);
                                this.show(id, 1);
                                $element.find('#' + VC.ID_GROUP + vID).text('-');
                            }
                        }
                    }
                    this.drawDependencies();
                };

                /**
                 * Function to show children of specified task
                 * @param pID
                 * @param pTop
                 */
                instance.show = function (pID, pTop) {
                    var state = $element.find('#' + VC.ID_GROUP + pID).text(),
                        stateChange = false, task, vID;

                    for (var i = 0, tasks = this.getTaskList().length; i < tasks; i++) {
                        task = this.getTaskList()[i];
                        vID = task.getID();
                        if (task.getID() === pID) {
                            stateChange = false;
                            if ((pTop === 1 && state === '+') || state === '-') {
                                stateChange = true;
                            } else if (task.getParItem() && task.getParItem().getGroup() === 2) {
                                task.setVisible(true);
                            }

                            if (stateChange) {
                                $element.find('#' + VC.ID_CHILD + vID).css({display: 'inherit'});
                                $element.find('#' + VC.ID_CHILD_ROW + vID).css({display: 'inherit'});
                                task.setVisible(true);
                            }

                            if (task.getGroup()) {
                                this.show(vID)
                            }
                        }
                    }
                };

                instance.hide = function (id) {
                    var task, child, childTr;
                    for (var i = 0, tasks = this.getTaskList().length; i < tasks; i++) {
                        task = this.getTaskList()[i];
                        if (task.getID() === id) {
                            if ((child = $element.find('#' + VC.ID_CHILD + task.getID())).length) {
                                child.css({display: 'none'});
                            }
                            if ((childTr = $element.find('#' + VC.ID_CHILD_ROW + task.getID())).length) {
                                childTr.css({display: 'none'});
                            }
                            task.setVisible(false);
                            if (task.getGroup()) {
                                this.hide(task.getID());
                            }
                        }
                    }
                };

                instance.getWidth = function (width) {
                    return isNaN(width * 1) ? width : width + 'px';
                };

                instance.getCaption = function (task) {
                    var caption = '';
                    switch (this.getCaptionType()) {
                        case 'Caption':
                            caption = task.getCaption();
                            break;
                        case 'Resource':
                            caption = task.getResource();
                            break;
                        case 'Duration':
                            caption = task.getDuration(format);
                            break;
                        case 'Complete':
                            caption = task.getCompStr();
                            break;
                    }
                    return caption;
                };

                instance.formatDate = function (date, displayFormat) {
                    var lang = config.langs[config.lang],
                        year = date.getFullYear().toString().substr(2, 4),
                        month = date.getMonth() + 1,
                        formattedDate = '';

                    for (var i = 0; i < displayFormat.length; i++) {
                        switch (displayFormat[i]) {
                            case 'dd':
                                if (date.getDate() < 10) {
                                    formattedDate += '0';
                                } // now fall through - no break here
                            case 'd':
                                formattedDate += date.getDate();
                                break;
                            case 'day':
                                formattedDate += lang[weeksName[date.getDay()]];
                                break;
                            case 'DAY':
                                formattedDate += lang[weeksNameShort[date.getDay()]];
                                break;
                            case 'mm':
                                if (month < 10) {
                                    formattedDate += '0';
                                } // now fall through - no break here
                            case 'm':
                                formattedDate += month;
                                break;
                            case 'mon':
                                formattedDate += lang[monthsShort[date.getMonth()]];
                                break;
                            case 'month':
                                formattedDate += lang[months[date.getMonth()]];
                                break;
                            case 'yyyy':
                                formattedDate += date.getFullYear();
                                break;
                            case 'yy':
                                formattedDate += year;
                                break;
                            case 'qq':
                                formattedDate += 'Q';
                            case 'q':
                                formattedDate += Math.floor(date.getMonth() / 3) + 1;
                                break;
                            case 'hh':
                                var h = date.getHours() % 12 === 0 ? 12 : date.getHours() % 12;
                                if (h < 10) {
                                    formattedDate += '0';
                                } // now fall through - no break here
                            case 'h':
                                formattedDate += date.getHours() % 12 === 0 ? 12 : date.getHours() % 12;
                                break;
                            case 'H':
                                if (date.getHours() < 10) {
                                    formattedDate += '0';
                                } // now fall through - no break here
                            case 'H':
                                formattedDate += date.getHours();
                                break;
                            case 'MI':
                                if (date.getMinutes() < 10) {
                                    formattedDate += '0';
                                } // now fall through - no break here
                            case 'mi':
                                formattedDate += date.getMinutes();
                                break;
                            case 'pm':
                                formattedDate += date.getHours() < 12 ? 'am' : 'pm';
                                break;
                            case 'PM':
                                formattedDate += date.getHours() < 12 ? 'AM' : 'PM';
                                break;
                            case 'ww':
                                if (this.getIsoWeek(date) < 10) {
                                    formattedDate += '0';
                                } // now fall through - no break here
                            case 'w':
                                formattedDate += this.getIsoWeek(date);
                                break;

                            case 'week':
                                var year = date.getFullYear(),
                                    dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(),
                                    weekNum = this.getIsoWeek(date);
                                formattedDate += weekNum;
                                if (weekNum >= 52 && month === 1) {
                                    year--;
                                }
                                if (weekNum === 1 && month === 12) {
                                    year++;
                                }
                                if (weekNum < 10) {
                                    weekNum == '0' + weekNum;
                                }
                                formattedDate += year + '-W' + weekNum + '-' + dayOfWeek;
                                break;
                            default:
                                if (lang[displayFormat[i]].toLowerCase()) {
                                    formattedDate += lang[displayFormat[i].toLowerCase()];
                                } else {
                                    formattedDate += lang[displayFormat[i]];
                                }
                                break;
                        }
                    }
                    return formattedDate;
                };

                instance.getIsoWeek = function (date) {
                    return parseInt(this.date(date, 'W'), 10);
                };

                /**
                 * Return the formatted date string, if format is undefined return the date object
                 * @param date Date Object
                 * @param $format (optional) http://jacwright.com/projects/javascript/date_format/
                 * @returns {*} String|Date
                 */
                instance.date = function ($date, $format) {
                    $date = helper.toDate($date);
                    //TODO remove this in future release
                    $format = $format ? $format
                        .replace('yyyy', 'Y')
                        .replace('yy', 'y')
                        .replace('dd', 'd')
                        .replace('DD', 'l')
                        .replace('mm', 'm')
                        .replace('MM', 'F') : false;
                    return $format ? helper.date($date).format($format) : helper.date($date);
                };

                instance.drawSelector = function () {
                    var position = config.defaultSelectorPosition,
                        lang = config.langs[config.lang],
                        validViews = this.getViewTypes();

                    var selector = elements.div().addClass(VC.CLASS_SELECTOR).text('Format:');
                    for (var view = 0; view < validViews.length; view++) {
                        selector.append(elements.span()
                            .attr('id', VC.ID_FORMAT + validViews[view] + position)
                            .addClass(VC.CLASS_FORM_LABEL + (format === validViews[view]) ? VC.CLASS_SELECTED : ''))
                            .text(lang[validViews[view]]);
                    }
                    return selector;
                };

                /**
                 * TODO will be removed
                 * @param list
                 * @param processId
                 * @param row
                 * @param level
                 * @param open
                 * @param useSort
                 */
                instance.processRows = function (list, processId, row, level, open, useSort) {
                    var minDate = new Date(), maxDate = new Date(), isVisible = open, currentItem = null,
                        completeSum = 0, minSet = 0, maxSet = 0, numKid = 0, level = level, tempList = list,
                        comb = false, i = 0;

                    for (i = 0; i < list.length; i++) {
                        var item = list[i];
                        if (item.getToDelete()) {
                            list.splice(i, 1);
                            i--;
                        }
                        if (i >= 0 && item.getId() === processId) {
                            currentItem = item;
                        }
                    }

                    for (i = 0; i < list.length; i++) {
                        var item = list[i];
                        if (item.getParent() == processId) {
                            isVisible = open;
                            item.setParItem(currentItem);
                            item.setVisible(isVisible);
                            if (isVisible == 1 && item.getOpen() === 0) {
                                isVisible = 0;
                            }

                            //remove milestones owned by combined groups
                            if (item.getMile() && item.getParItem() && item.getParItem().getGroup() === 2) {
                                list.splice(i, 1);
                                i--;
                                continue;
                            }

                            item.setLevel(level);
                            numKid++;

                            if (item.getGroup()) {
                                if (item.getParItem() && item.getParItem().getGroup() === 2) {
                                    item.setGroup(2);
                                }
                                this.processRows(tempList, item.getId(), i, level + 1, isVisible, 0);
                            }

                            if (minSet === 0 || item.getStart() < minDate) {
                                minDate = item.getStart();
                                minSet = 1;
                            }

                            if (maxSet === 0 || item.getEnd() > maxDate) {
                                maxDate = item.getEnd();
                                maxSet = 1;
                            }

                            completeSum += item.getCompVal();
                            item.setSortIdx(i * list.length);
                        }
                    }

                    if (row >= 0) {
                        list[row].setStart(minDate);
                        list[row].setEnd(maxDate);
                        list[row].setNumKid(numKid);
                        list[row].setCompVal(Math.ceil(completeSum / numKid));
                    }

                    if (processId === 0 && useSort === 1) {
                        this.sortTasks(list, 0, 0);
                        list.sort(function (a, b) {
                            return a.getSortIdx() - b.getSortIdx();
                        });
                    }
                    if (processId === 0 && useSort !== 1) {// Need to sort combined tasks regardless
                        for (i = 0; i < list.length; i++) {
                            var item = list[i];
                            if (item.getGroup() == 2) {
                                comb = true;
                                this.sortTasks(list, item.getId(), item.getSortIdx() + 1);
                            }
                        }
                        if (comb == true) {
                            list.sort(function (a, b) {
                                return a.getSortIdx() - b.getSortIdx();
                            });
                        }
                    }
                };

                instance.sortTasks = function (list, id, idx) {
                    var sortIdx = idx, sortedList = [];

                    for (var i = 0; i < list.length; i++) {
                        if (list[i].getParent() === id) {
                            sortedList.push(list[i]);
                        }
                    }

                    if (sortedList.length > 0) {
                        //Compare sort
                        sortedList.sort(function (a, b) {
                            var i = a.getStart().getTime() - b.getStart().getTime();
                            if (i === 0) {
                                i = a.getEnd().getTime() - b.getEnd().getTime();
                            }
                            if (i === 0) {
                                return a.getId() - b.getId();
                            }
                            else {
                                return i;
                            }
                        });
                    }

                    for (var j = 0; j < sortedList.length; j++) {
                        for (var k = 0; k < list.length; k++) {
                            if (list[k].getId() == sortedList[j].getId()) {
                                list[k].setSortIdx(sortIdx++);
                                sortIdx = this.sortTasks(list, list[k].getId(), sortIdx)
                            }
                        }
                    }
                    return sortIdx;
                };

                /**
                 * Determine the minimum date of all tasks and set lower bound based on format
                 * @param taskList
                 * @param $format
                 * @returns {Date}
                 */
                instance.getMinDate = function getMinDate(taskList, $format) {
                    var date = new Date();
                    date.setTime(taskList[0].getStart().getTime());

                    // Parse all Task End dates to find min
                    for (var i = 0; i < taskList.length; i++) {
                        if (taskList[i].getStart().getTime() < date.getTime()) {
                            date.setTime(taskList[i].getStart().getTime());
                        }
                    }

                    // Adjust min date to specific format boundaries (first of week or first of month)
                    if ($format == 'day') {
                        date.setDate(date.getDate() - 1);
                        while (date.getDay() % 7 != 1) {
                            date.setDate(date.getDate() - 1);
                        }
                    } else if ($format == 'week') {
                        date.setDate(date.getDate() - 1);
                        while (date.getDay() % 7 != 1) {
                            date.setDate(date.getDate() - 1);
                        }
                    } else if ($format == 'month') {
                        date.setDate(date.getDate() - 15);
                        while (date.getDate() > 1) {
                            date.setDate(date.getDate() - 1);
                        }
                    } else if ($format == 'quarter') {
                        date.setDate(date.getDate() - 31);
                        if (date.getMonth() == 0 || date.getMonth() == 1 || date.getMonth() == 2) {
                            date.setFullYear(date.getFullYear(), 0, 1);
                        } else if (date.getMonth() == 3 || date.getMonth() == 4 || date.getMonth() == 5) {
                            date.setFullYear(date.getFullYear(), 3, 1);
                        } else if (date.getMonth() == 6 || date.getMonth() == 7 || date.getMonth() == 8) {
                            date.setFullYear(date.getFullYear(), 6, 1);
                        } else if (date.getMonth() == 9 || date.getMonth() == 10 || date.getMonth() == 11) {
                            date.setFullYear(date.getFullYear(), 9, 1);
                        }
                    } else if ($format == 'hour') {
                        date.setHours(date.getHours() - 1);
                        while (date.getHours() % 6 != 0) {
                            date.setHours(date.getHours() - 1);
                        }
                    }

                    if ($format == 'hour') {
                        date.setMinutes(0, 0);
                    } else {
                        date.setHours(0, 0, 0);
                    }
                    return(date);
                };

                /**
                 * Determine the maximum date of all tasks and set upper bound based on format
                 * @param taskList
                 * @param $format
                 * @returns {Date}
                 */
                instance.getMaxDate = function (taskList, $format) {
                    var date = new Date();

                    date.setTime(taskList[0].getEnd().getTime());

                    // Parse all Task End dates to find max
                    for (var i = 0; i < taskList.length; i++) {
                        if (taskList[i].getEnd().getTime() > date.getTime()) {
                            date.setTime(taskList[i].getEnd().getTime());
                        }
                    }

                    // Adjust max date to specific format boundaries (end of week or end of month)
                    if ($format === 'day') {
                        date.setDate(date.getDate() + 1);

                        while (date.getDay() % 7 !== 0) {
                            date.setDate(date.getDate() + 1);
                        }
                    } else if ($format === 'week') {
                        //For weeks, what is the last logical boundary?
                        date.setDate(date.getDate() + 1);

                        while (date.getDay() % 7 !== 0) {
                            date.setDate(date.getDate() + 1);
                        }
                    } else if ($format === 'month') {
                        // Set to last day of current Month
                        while (date.getDay() > 1) {
                            date.setDate(date.getDate() + 1);
                        }
                        date.setDate(date.getDate() - 1);
                    } else if ($format === 'quarter') {
                        // Set to last day of current Quarter
                        if (date.getMonth() === 0 || date.getMonth() === 1 || date.getMonth() === 2) {
                            date.setFullYear(date.getFullYear(), 2, 31);
                        } else if (date.getMonth() === 3 || date.getMonth() === 4 || date.getMonth() === 5) {
                            date.setFullYear(date.getFullYear(), 5, 30);
                        } else if (date.getMonth() === 6 || date.getMonth() === 7 || date.getMonth() === 8) {
                            date.setFullYear(date.getFullYear(), 8, 30);
                        } else if (date.getMonth() === 9 || date.getMonth() === 10 || date.getMonth() === 11) {
                            date.setFullYear(date.getFullYear(), 11, 31);
                        }
                    } else if ($format === 'hour') {
                        if (date.getHours() === 0) {
                            date.setDate(date.getDate() + 1);
                        }
                        date.setHours(date.getHours() + 1);

                        while (date.getHours() % 6 !== 5) {
                            date.setHours(date.getHours() + 1);
                        }
                    }
                    return(date);
                };

                /**
                 * Task object
                 * @param id
                 * @param name
                 * @param startDate
                 * @param endDate
                 * @param cssClass
                 * @param completion
                 * @param parent
                 * @param open
                 * @param group
                 * @returns {{setNotes: setNotes, setGroup: setGroup, setStartDate: setStartDate, setEndDate: setEndDate, setDepend: setDepend, setId: setId, setName: setName, setClass: setClass, setLink: setLink, setMile: setMile, setResource: setResource, setParent: setParent, setCompletion: setCompletion, setOpen: setOpen, setCaption: setCaption, setLevel: setLevel, setNumKid: setNumKid, setCompVal: setCompVal, setStartX: setStartX, setStartY: setStartY, setEndX: setEndX, setEndY: setEndY, setVisible: setVisible, setSortIdx: setSortIdx, setToDelete: setToDelete, setParItem: setParItem, setCellDiv: setCellDiv, getID: getID, getName: getName, getStart: getStart, getEnd: getEnd, getClass: getClass, getLink: getLink, getMile: getMile, getDepend: getDepend, getDepType: getDepType, getCaption: getCaption, getResource: getResource, getCompVal: getCompVal, getCompStr: getCompStr, getNotes: getNotes, getSortIdx: getSortIdx, getToDelete: getToDelete, getDuration: getDuration, getParent: getParent, getGroup: getGroup, getOpen: getOpen, getLevel: getLevel, getNumKids: getNumKids, getStartX: getStartX, getStartY: getStartY, getEndX: getEndX, getEndY: getEndY, getVisible: getVisible, getParItem: getParItem, getCellDiv: getCellDiv}}
                 */
                instance.newTaskItem = function (id, name, startDate, endDate, cssClass, completion, parent, open, group) {
                    var vID = id, vName = name, vStart = new Date(0), vEnd = new Date(0), vClass = cssClass,
                        vGroup = group, vParent = parent, vOpen = group === 2 ? 1 : parseInt(open, 10), vDepend = [],
                        vDependType = [], vCaption = '', vDuration, vLevel = 0, vNumKid = 0, vVisible = true,
                        vSortIdx = 0, vToDelete = false, x1, y1, x2, y2, vNotes = elements.span(), vLink, vMile,
                        vParItem = null, vCellDiv = null, pNotes, vRes, vComp = parseFloat(completion);

                    if (vGroup !== 1) {
                        vStart = instance.date(startDate, instance.getDateInputFormat());
                        vEnd = instance.date(endDate, instance.getDateInputFormat());
                    }

                    vNotes.className = VC.CLASS_TASK_NOTES;
                    return {
                        setNotes: function (notes) {
                            vNotes.html(notes);
                            helper.stripUnwanted(vNotes);
                            return this;
                        },
                        setGroup: function (group) {
                            vGroup = parseInt(group, 10);
                            return this;
                        },
                        setStartDate: function (date) {
                            vStart = instance.date(date, instance.getDateInputFormat());
                            return this;
                        },
                        setEndDate: function (date) {
                            vEnd = instance.date(date, instance.getDateInputFormat());
                            return this;
                        },

                        setDepend: function (depend) {
                            if (!depend) {
                                return this;
                            } else {
                                depend = depend + '';
                                var dependList = depend.split(','),
                                    n = dependList.length,
                                    type = '';

                                for (var k = 0; k < n; k++) {
                                    switch ((type = dependList[k].toUpperCase())) {
                                        case 'SS':
                                            vDepend[k] = type.substring(0, type.indexOf('SS'));
                                            vDependType[k] = 'SS';
                                            break;
                                        case 'FF':
                                            vDepend[k] = type.substring(0, type.indexOf('FF'));
                                            vDependType[k] = 'FF';
                                            break;
                                        case 'SF':
                                            vDepend[k] = type.substring(0, type.indexOf('SF'));
                                            vDependType[k] = 'SF';
                                            break;
                                        case 'FS':
                                            vDepend[k] = type.substring(0, type.indexOf('FS'));
                                            vDependType[k] = 'FS';
                                            break;
                                        default:
                                            vDepend[k] = type;
                                            vDependType[k] = 'FS';
                                            break;
                                    }
                                }
                            }
                            return this;
                        },

                        setId: function (id) {
                            vID = parseInt(id, 10);
                            return this;
                        },
                        setName: function (name) {
                            vName = name;
                            return this;
                        },
                        setClass: function (cssClass) {
                            vClass = cssClass;
                            return this;
                        },
                        setLink: function (link) {
                            vLink = link;
                            return this;
                        },
                        setMile: function (mile) {
                            vMile = parseInt(mile, 10);
                            return this;
                        },
                        setResource: function (resource) {
                            vRes = resource;
                            return this;
                        },
                        setParent: function (parent) {
                            vParent = parent;
                            return this;
                        },
                        setCompletion: function (complt) {
                            vComp = parseFloat(complt);
                            return this;
                        },
                        setOpen: function (open) {
                            vOpen = parseInt(open, 10);
                            return this;
                        },
                        setCaption: function (caption) {
                            vCaption = caption;
                            return this;
                        },
                        setLevel: function (level) {
                            vLevel = parseInt(level, 10);
                            return this;
                        },
                        setNumKid: function (numKid) {
                            vNumKid = parseInt(numKid, 10);
                            return this;
                        },
                        setCompVal: function (compVal) {
                            vComp = parseInt(compVal, 10);
                            return this;
                        },
                        setStartX: function (x) {
                            x1 = parseInt(x, 10);
                            return this;
                        },
                        setStartY: function (y) {
                            y1 = parseInt(y, 10);
                            return this;
                        },
                        setEndX: function (x) {
                            x2 = parseInt(x, 10);
                            return this;
                        },
                        setEndY: function (y) {
                            y2 = parseInt(y, 10);
                            return this;
                        },
                        setVisible: function (visible) {
                            vVisible = visible;
                            return this;
                        },
                        setSortIdx: function (sortIdx) {
                            vSortIdx = parseInt(sortIdx, 10);
                            return this;
                        },
                        setToDelete: function (del) {
                            vToDelete = del ? true : false;
                            return this;
                        },
                        setParItem: function (parItem) {
                            if (parItem instanceof  this) {
                                vParItem = parItem;
                            } else {
                                console.log('The Par Item is not taskItem instance' + parItem);
                            }
                            return this;
                        },
                        setCellDiv: function (cellDiv) {
                            if (helper.isDivElement(cellDiv)) {
                                vCellDiv = cellDiv;
                            }
                            return this;
                        },
                        getID: function () {
                            return vID;
                        },
                        getName: function () {
                            return vName;
                        },
                        getStart: function () {
                            return vStart;
                        },
                        getEnd: function () {
                            return vEnd;
                        },
                        getClass: function () {
                            return vClass;
                        },
                        getLink: function () {
                            return vLink;
                        },
                        getMile: function () {
                            return vMile;
                        },
                        getDepend: function () {
                            return vDepend ? vDepend : null;
                        },
                        getDepType: function () {
                            return vDependType ? vDependType : null;
                        },
                        getCaption: function () {
                            return vCaption;
                        },
                        getResource: function () {
                            return vRes;
                        },
                        getCompVal: function () {
                            return vComp;
                        },
                        getCompStr: function () {
                            return vComp ? vComp + '%' : '';
                        },
                        getNotes: function () {
                            return vNotes;
                        },
                        getSortIdx: function () {
                            return vSortIdx;
                        },
                        getToDelete: function () {
                            return vToDelete;
                        },
                        getDuration: function () {
                            var lang = config.langs[config.lang];
                            if (vMile) {
                                vDuration = '-';
                            } else {
                                var taskEnd = new Date(this.getEnd().getTime()),
                                    units = format;
                                if (format === 'week') {
                                    units = 'day';
                                } else if (format === 'month') {
                                    units = 'week';
                                } else if (format === 'quarter') {
                                    units = 'month';
                                }

                                if ((taskEnd.getTime() - (taskEnd.getTimezoneOffset() * 60000)) % 86400000 === 0) {
                                    taskEnd = helper.toDate(taskEnd.setDate(taskEnd.getDate() + 1));
                                }
                                var tempPer = instance.getOffset(this.getStart(), taskEnd, 999, units) / 1000;

                                if (Math.floor(tempPer) !== tempPer) {
                                    tempPer = Math.round(tempPer * 10) / 10;
                                }

                                switch (units) {
                                    case 'hour':
                                        vDuration = tempPer + ' ' + (tempPer !== 1) ? lang['hrs'] : lang['hr'];
                                        break;
                                    case 'day':
                                        vDuration = tempPer + ' ' + (tempPer !== 1) ? lang['dys'] : lang['dy'];
                                        break;
                                    case 'week':
                                        vDuration = tempPer + ' ' + (tempPer !== 1) ? lang['wks'] : lang['wk'];
                                        break;
                                    case 'month':
                                        vDuration = tempPer + ' ' + (tempPer !== 1) ? lang['mths'] : lang['mth'];
                                        break;
                                    case 'quarter':
                                        vDuration = tempPer + ' ' + (tempPer !== 1) ? lang['qtrs'] : lang['qtr'];
                                        break;
                                }
                                return vDuration;
                            }
                        },
                        getParent: function () {
                            return vParent;
                        },
                        getGroup: function () {
                            return vGroup;
                        },
                        getOpen: function () {
                            return vOpen;
                        },
                        getLevel: function () {
                            return vLevel;
                        },
                        getNumKids: function () {
                            return vNumKid;
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
                            return vVisible;
                        },
                        getParItem: function () {
                            return vParItem;
                        },
                        getCellDiv: function () {
                            return vCellDiv;
                        }
                    }
                };

                /**
                 * Add tasks (items)
                 * @param tasks
                 */
                instance.addTasks = function (tasks) {
                    var n = tasks.length, item, task;
                    for (var t = 0; t < n; t++) {
                        item = tasks[t];
                        if (item && item.id !== 0) {
                            if (!item.class) {
                                if (item.group > 0) {
                                    item.class = VC.CLASS_GROUP_BLACK;
                                } else if (item.mile > 0) {
                                    item.class = VC.CLASS_MILE_STONE;
                                } else {
                                    item.class = VC.CLASS_MILE_STONE;
                                }
                            }
                            task = this.newTaskItem(toType(item.id), toType(item.name) || 'No Task Name',
                                toType(item.start), toType(item.end), toType(item.class),
                                toType(item.completion), toType(item.parent), toType(item.open) || true, toType(item.group));
                            task.setLink(toType(item.link))
                                .setMile(toType(item.mile))
                                .setResource(toType(item.resource))
                                .setCompletion(toType(item.complete))
                                .setDepend(toType(item.depend))
                                .setCaption(toType(item.caption))
                                .setNotes(toType(item.notes));
                            this.addTaskItem(task);
                        }
                    }
                };

                return instance;
            },

            helper: helper
        }
    };
}));