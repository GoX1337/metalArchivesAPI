module.exports = {
    logLevel: 'info',
    mongoUrl: 'mongodb://localhost:27017',
    database: 'metalArchives',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss:SSS',
    morganFormat: ':date :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
};