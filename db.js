var mySQL = require('mysql');
var pool = mySQL.createPool({
    connectionLimit: 100,
    host: 'localhost',//Your Host
    user: 'root',//your database username
    password: '07$3Y%l2W9Bz',// database password
    database: 'photobash'// database name
});
exports.getConnection = function (callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        callback(err, conn);
    });
};
module.exports = pool;