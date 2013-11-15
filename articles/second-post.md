下面这段代码
===========

<pre class="prettyprint">
var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8888);
</pre>

短短这些代码就可以构建一个静态服务器，都通过javascript搞定。类似jetty的代码启动：<br>
<pre class="prettyprint">
public class WebJetty {
	private static Server server = new Server();
	public static void main(String[] args) throws Exception {
		Connector connector = new SelectChannelConnector();
		connector.setPort(8080);
		server.addConnector(connector);

		WebAppContext context = new WebAppContext("src/main/webapp", "/web");
		context.setDefaultsDescriptor("src/test/resources/webdefault.xml");

		HashUserRealm login = new HashUserRealm("login");
		login.setConfig("src/test/resources/jetty-realm.properties");

		SecurityHandler securityHandler = new SecurityHandler();
		securityHandler.setUserRealm(login);

		context.setSecurityHandler(securityHandler);
		HandlerCollection handlers= new HandlerCollection();
		handlers.setHandlers(new Handler[]{context, new DefaultHandler()});

		server.setHandler(handlers);
		server.setStopAtShutdown(true);
		server.setSendServerVersion(true);

		server.start();
		server.join();
	}
}
</pre>

本博客程序就是使用Node.js的connect模块 搭建类似于apache的静态服务器。
得好好学习node开源代码，对负载、路由等底层http协议了解有帮助
===============

