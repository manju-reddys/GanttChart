define('ganttCalendar', //Loading dependencies here
    // module definition function
    // dependencies are mapped to function parameters
    function () {
        /**
         * Doc -> https://msdn.microsoft.com/en-us/library/office/aa210593(v=office.11).aspx
         */
        return function (Helper, Instance) {
            if (!Helper || !Instance) {
                throw Error('Missing required parameters -:: Helper or Instance');
            }

            var dateType = {
                0: 'Exception', 1: 'Monday', 2: 'Tuesday',
                3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday',
                7: 'Sunday'
            }
        }
    }
);