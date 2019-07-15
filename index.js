'use strict';

module.exports = function airyLog ( data, addTimestamp ) {
    var dataType, timeStamp, filePath, message, replacer;

    if ( airyLog.silent ) {
        return;
    }

    dataType  = Array.isArray(data) && 'array' || typeof data;
    timeStamp = addTimestamp && Date.now();

    try {
        throw new Error();
    } catch ( error ) {
        // for debug
        // console.log(error);

        filePath = error
            .stack
            .substring(error.stack.lastIndexOf('http://'));

        if ( filePath.indexOf('@') !== -1 ) {
            filePath = filePath.split('@')[1];
        }

        filePath = filePath.replace(/^http:\/\/[^/]+/, '');
    }

    switch ( dataType ) {
        case 'function':
            message = data.name + ' :: ' + data.length;

            break;
        case 'array':
            message = '(' + data.length + ') ' + JSON.stringify(data);

            break;
        case 'object':
            if ( data === null ) {
                message = data;

                break;
            }

            if ( /^\[object [a-zA-Z]+Event\]$/.test(Object.prototype.toString.call(data)) ) {
                replacer = function () {
                    return function ( event ) {
                        return Object.keys(event).reduce(function ( collector, key ) {
                            collector[key] = typeof event[key] === 'object' ? '{ ... }' : event[key];

                            return collector;
                        }, {});
                    };
                };
            } else {
                replacer = function () {
                    var seen = [];

                    return function ( key, value ) {
                        if ( typeof value === 'object' && value !== null ) {
                            if ( seen.indexOf(value) !== -1 ) {
                                return;
                            }

                            seen.push(value);
                        }

                        return value;
                    };
                };
            }

            message = JSON.stringify(data, replacer());

            break;
        case 'number':
        case 'string':
        case 'boolean':
        case 'undefined':
            message = data;
    }

    console.log(
        timeStamp ? timeStamp + ' ' : '' +

            '[' + filePath + '] ' +

            '<' + dataType[0] + '> ' +

            message
    );
};
