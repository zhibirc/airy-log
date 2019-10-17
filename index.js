/**
 * Lightweight logger for simple debugging purposes.
 *
 * @module airyLog
 *
 * @author Yaroslav Surilov
 *
 * @licence MIT
 */

'use strict';


(function ( root, factory ) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define([], factory);
    } else if ( typeof module === 'object' && module.exports ) {
        // CJS-like environments that support module.exports, like Node
        module.exports = factory();
    } else if ( typeof exports === 'object' && typeof exports.nodeName !== 'string' ) {
        // CJS
        exports = factory();
    } else {
        // browser globals (root is window)
        root.airyLog = factory();
    }
// eslint-disable-next-line no-invalid-this
})(typeof self === 'undefined' ? this : self, function () {
    return function airyLog ( data, addTimestamp ) {
        var dataType, timeStamp, filePath, message, replacer;

        // suppress logging output or not
        if ( airyLog.silent ) {
            return;
        }

        // maximum output length
        airyLog.limit = airyLog.limit || 1000;

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
                    data = Object.keys(data).reduce(function ( collector, key ) {
                        var value = data[key];

                        collector[key] = value === null ? null : typeof value === 'object' ? '{ ... }' : value;

                        return collector;
                    }, {});

                    dataType = 'event';
                    message  = JSON.stringify(data);
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

                            // eslint-disable-next-line consistent-return
                            return value;
                        };
                    };

                    message = JSON.stringify(data, replacer());
                }

                break;
            case 'number':
            case 'string':
            case 'boolean':
            case 'undefined':
                message = data;
        }

        console.log(
            '\n' +

            (timeStamp ? timeStamp + ' ' : '') +

            '[' + filePath + '] ' +

            '<' + dataType[0] + '> ' +

            String(message).slice(0, airyLog.limit)
        );
    };
});
