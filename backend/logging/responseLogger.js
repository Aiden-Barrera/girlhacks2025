const logger = require('./logger');

function responseLogger(statusCode, responseBody, req) {
    const responseData = {
        URL: req.originalUrl,
        httpMethod: req.method,
        statusCode: statusCode,
        response: responseBody
    };

    if (statusCode >= 500) {
        logger.error(responseData);
    } else if (statusCode >= 400) {
        logger.warn(responseData);
    } else {
        logger.info(responseData);
    }
}

module.exports = responseLogger;