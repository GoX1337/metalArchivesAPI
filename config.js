module.exports = {
    logLevel: 'info',
    database: 'mongodb://localhost:27017/metalBands',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss:SSS',
    morganFormat: ':date :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
};