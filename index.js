module.exports = function airyLog ( data, addTimestamp ) {
    var dataType, timeStamp, filePath, message;

    if ( airyLog.silent ) return;

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
            message = JSON.stringify(data);

            break;
        case 'number':
        case 'string':
        case 'boolean':
            message = data;
    }

    console.log(
        timeStamp ? timeStamp + ' ' : '' +

            '[' + filePath + '] ' +

            '<' + dataType[0] + '> ' +

            message
    );
};
