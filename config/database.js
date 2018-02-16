const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports = {
    uri: "mongodb://Razma:proyecto209191@ds046357.mlab.com:46357/proyecto209191" || "mongodb://localhost:27017/proyecto209191",
    secret: crypto,
    db: "proyecto209191"
}