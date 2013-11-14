下面这段代码
===========

<pre class="prettyprint">
var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8888);
</pre>

短短这些代码就可以构建一个静态服务器，都通过javascript搞定。<br>
本博客程序就是使用Node.js的connect模块 搭建类似于apache的静态服务器。
得好好学习node开源代码，对负载、路由等底层http协议了解有帮助
===============

