import { logger } from './logger.js';

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

export default responseLogger;