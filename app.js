/**
 * Created by wangyuqiu on 13-11-14.
 */
var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8001);