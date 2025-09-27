import { UAParser } from 'ua-parser-js';
import { logger } from './logger.js';

function requestLogger(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();
    let payload = null;
    if (req.body) {
        payload = { ...req.body };
        delete payload.pw; // Delete password field from request body if it exists
    }

    const agentInfo = {
        IP: ip,
        browser: `${result.browser.name || 'Unknown' }`,
        os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
        device: `${result.device.vendor || 'Unknown'} ${result.device.model || ''}`.trim(),
        URL: req.originalUrl,
        httpMethod: req.method,
        payload: payload
    };


    logger.info(agentInfo)

    next();
}

export default requestLogger;