const { createLogger, format, transports } = require('winston');
const { printf } = format;
const config = require('./config');

const myFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({
    level: config.logLevel,
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss:SSS'
        }),
        myFormat
    ),
    transports: [
      new transports.Console({format: format.combine(
            format.colorize(),
            myFormat
        ),}),
      new transports.File({ filename: 'error.log', level: 'error', maxsize:'10000000'})
    ]
});

module.exports = logger;