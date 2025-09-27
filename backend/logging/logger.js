import { createLogger, format, transports } from 'winston';
const path = require('path');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: path.join(__dirname, '../api.log') }),
    ]
});

module.exports = logger;