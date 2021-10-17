// @ Logs req details to console
const logger = (req, res, next) => {
    // req.hello = 'Hello World'
    console.log(`Logger Middleware Ran ${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
}

module.exports = logger;
