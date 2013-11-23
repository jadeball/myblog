前端性能优化之一 系统架构
=====
前端性能与浏览器、网络运营商、CDN、负载均衡、静态服务器、Web服务器、系统开发等各个环节都息息相关，这次讲讲和系统整体架构相关。
<div style="margin: 0 auto 20px;text-align:center;">
    <img src="../images/youhua01.png" width="1000px" alt="avatar">
</div>

前端的性能对于一个Web应用来说非常重要，如果一个Web应用的页面加载速度非常快、那么产品的用户体验将会极大地提升
<div style="margin: 0 auto 20px;text-align:center;">
    <img src="../images/youhua02.png" width="1000px" alt="avatar">
</div>

由于Web服务器如tomcat、jboss、websphere、weblogic等这些处理静态资源的读写速度没有静态服务器apache、nginx速度快，所以我们要把
就太资源部署到静态服务器上，做到动静分离，理论上，如何前置再部署了CDN只要缓存规则配置得恰当，则动静分离效果没太大区别，只是大部分网站
程序都没太大必要购买专业的CDN服务。

大名鼎鼎的apache大家都熟悉，本站前置使用apache做前置静态服务器，在其下挂了多个服务网站（都是基于node.js开发）,
下面以为本服务器部署三个服务如<a href="http://www.jadeball.cn" target="_blank">Jade's Blog</a>、<a href="http://www.shtxcapital.com" target="_blank">上海天厦资产管理公司</a>、<a href="http://www.canku.me" target="_blank">餐库</a>为列子：
第一步：vi编辑apache的http.conf文件 去掉如下之前的#注释 开启其功能
<pre class="prettyprint">
LoadModule deflate_module modules/mod_deflate.so
LoadModule headers_module modules/mod_headers.so
LoadModule expires_module modules/mod_expires.so

#打开httpd.conf后，先将上面两行配置前面的#号去掉，这样apache就会启用这两个模块，其中
#mod_deflate是压缩模块，就是对要传输到客户端的代码进行gzip压缩；
#mod_headers模块的作用是告诉浏览器页面使用了gzip压缩，如果不开启mod_headers那么浏览器就会对gzip压缩过的页面进行下载，而无法正常显示。
#mod_expires模块是缓存有效期控制
</pre>

第二步：配置gzip压缩规则
<pre class="prettyprint">
&lt;IfModule mod_deflate.c&gt;
    SetOutputFilter DEFLATE    #必须的，就像一个开关一样，告诉apache对传输到浏览器的内容进行压缩

    SetEnvIfNoCase Request_URI .(?:gif|jpe?g|png)$ no-gzip dont-vary #设置不对后缀gif，jpg，jpeg，png的图片文件进行压缩
    SetEnvIfNoCase Request_URI .(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary #同上，就是设置不对exe，tgz，gz。。。的文件进行压缩
    SetEnvIfNoCase Request_URI .(?:pdf|mov|avi|mp3|mp4|rm)$ no-gzip dont-vary

    AddOutputFilterByType DEFLATE text/* #设置对文件是文本的内容进行压缩，例如text/html  text/css  text/plain等
    AddOutputFilterByType DEFLATE application/ms* application/vnd* application/postscript application/javascript application/x-javascript

    BrowserMatch ^Mozilla/4 gzip-only-text/html # Netscape 4.x 有一些问题，所以只压缩文件类型是text/html的
    BrowserMatch ^Mozilla/4.0[678] no-gzip # Netscape 4.06-4.08 有更多的问题，所以不开启压缩
    BrowserMatch \bMSIE !no-gzip !gzip-only-text/html # IE浏览器会伪装成 Netscape ，但是事实上它没有问题

    Header append Vary User-Agent env=!dont-vary #确保代理不会发送错误的内容

    ＃到这apache对静态资源的压缩配置规则就完成了
&lt;/IfModule&gt;
</pre>

第三步：配置缓存有效期
<pre class="prettyprint">
&lt;IfModule mod_expires.c&gt;
    ExpiresActive On #激活http缓存，也就是个开关，必须有的一段代码
    ExpiresDefault A604800 #默认缓存时间为604800秒，也就是7天，A表示以客户端时间为准
    ExpiresByType text/css A3600 #对css文件缓存3600秒，也就是1小时，A表示以客户端时间为准
    ExpiresByType text/html A3600 #对html文件缓存3600秒，也就是1小时，A表示以客户端时间为准
    ExpiresByType application/x-javascript A3600 #对javascript文件缓存3600秒，也就是1小时，A表示以客户端时间为准
    ExpiresByType image/gif "access plus 2 month" #对gif图片缓存2个月，以客户端时间为准
    ExpiresByType image/jpeg "access plus 2 month" #对jpeg和jpg图片缓存2个月，以客户端时间为准
    ExpiresByType image/png "access plus 2 month" #对png图片缓存2个月，以客户端时间为准
    ExpiresByType image/x-icon "access plus 2 month" #对浏览器小图标缓存2个月，以客户端时间为准
    ExpiresByType application/x-shockwave-flash A2592000 #对flash文件缓存2592000秒，也就是1个月，A表示以客户端时间为准

    #特别注意也可以使用 ExpiresByType text/css M3600  这里的M表示以文件最后修改时间为准缓存1小时，例如有些时候，我们的HTML是大批量定时更新的，这个时候就可以用到M

    Header unset Pragma #删除掉http头信息中的Pragma，不懂的可以google一下Pragma，他也是控制浏览器缓存的，不过是用于http1.0标准
    FileETag None
    Header unset ETag #这段代码和上面一段的作用是不使用http1.1标准中的ETag属性
    &lt;FilesMatch "\.(js|css|ico|pdf|flv|jpg|jpeg|png|gif|mp3|mp4|swf)$"&gt; #针对js|css|ico等后缀的文件进行单独设置
    #Header set Expires "Thu, 15 Apr 2013 20:00:00 GMT"
    Header unset Last-Modified #不使用http头信息中的Last-Modified属性，Last-Modified是指文件最后修改时间
    Header append Cache-Control "public" #设置为可被任何缓存区缓存
  &lt;/FilesMatch&gt;
&lt;/IfModule&gt;
</pre>

第四步：域名转向配置
<pre class="prettyprint">
NameVirtualHost 184.82.227.58:80
&lt;VirtualHost 184.82.227.58:80&gt;
    ServerAdmin 3644461@qq.com
    ServerName shtxcapital.com
    ServerAlias www.shtxcapital.com

    ProxyRequests off
    &lt;Proxy *&gt;
        Order deny,allow
        Allow from all
    &lt;/Proxy&gt;
    &lt;Location /&gt;
        ProxyPass http://localhost:8887/
        ProxyPassReverse http://localhost:8887/
    &lt;/Location&gt;
&lt;/VirtualHost&gt;
&lt;VirtualHost 184.82.227.58:80&gt;
    ServerAdmin 3644461@qq.com
    ServerName canku.me
    ServerAlias www.canku.me

    ProxyRequests off
    &lt;Proxy *>
        Order deny,allow
        Allow from all
    &lt;/Proxy>
    &lt;Location /&gt;
        ProxyPass http://localhost:8888/
        ProxyPassReverse http://localhost:8888/
    &lt;/Location&gt;
&lt;/VirtualHost&gt;
&lt;VirtualHost 184.82.227.58:80&gt;
    ServerAdmin 3644461@qq.com
    ServerName jadeball.cn
    ServerAlias www.jadeball.cn

    ProxyRequests off
    &lt;Proxy *&gt;
        Order deny,allow
        Allow from all
    &lt;/Proxy&gt;
    &lt;Location /&gt;
        ProxyPass http://localhost:8001/
        ProxyPassReverse http://localhost:8001/
    &lt;/Location&gt;
&lt;/VirtualHost&gt;
&lt;VirtualHost 184.82.227.58:80&gt;
    ServerAdmin 3644461@qq.com
    ServerName blog.canku.me
    ServerAlias blog.canku.me

    ProxyRequests off
    &lt;Proxy *>
        Order deny,allow
        Allow from all
    &lt;/Proxy&gt;
    &lt;Location /&gt;
        ProxyPass http://localhost:8001/
        ProxyPassReverse http://localhost:8001/
    &lt;/Location&gt;
&lt;/VirtualHost&gt;
</pre>

第五步：重启apache服务 使配置生效
<pre class="prettyprint">
service httpd restart
</pre>

至此我们完成了apache的gzip 浏览器客户端缓存规则配置，接下来我们就得在开发得时候遵循动静分离的原则，把静态资源部署在apache服务器端，
后面再挂web服务器端 分布式部署了多台web应用，在其配置文件也得配置些静态资源压缩 缓存规则，避免一些无法动静分离的业务场景，当然除了
web服务器配置，我们也可以在应用程序的servlet规范里面配置：
<pre class="prettyprint">
    &lt;filter&gt;
		&lt;filter-name&gt;NoCache&lt;/filter-name&gt;
		&lt;filter-class&gt;com.unionpay.upop.web.filter.CacheFilter&lt;/filter-class&gt;
		&lt;init-param&gt;
			&lt;param-name&gt;Cache-Control&lt;/param-name&gt;
			&lt;param-value&gt;no-store,no-cache,must-revalidate&lt;/param-value&gt;
		&lt;/init-param&gt;
	&lt;/filter&gt;
	&lt;filter&gt;
		&lt;filter-name&gt;CacheForWeek&lt;/filter-name&gt;
		&lt;filter-class&gt;com.unionpay.upop.web.filter.CacheFilter&lt;/filter-class&gt;
		&lt;init-param&gt;
			&lt;param-name&gt;Cache-Control&lt;/param-name&gt;
			&lt;param-value&gt;max-age=604800, public&lt;/param-value&gt;
		&lt;/init-param&gt;
	&lt;/filter&gt;
	&lt;filter&gt;
		&lt;filter-name&gt;CacheFor3Days&lt;/filter-name&gt;
		&lt;filter-class&gt;com.unionpay.upop.web.filter.CacheFilter&lt;/filter-class&gt;
		&lt;init-param&gt;
			&lt;param-name&gt;Cache-Control&lt;/param-name&gt;
			&lt;param-value&gt;max-age=259200, public&lt;/param-value&gt;
		&lt;/init-param&gt;
        &lt;init-param&gt;
            &lt;param-name&gt;Vary&lt;/param-name&gt;
            &lt;param-value&gt;Accept-Encoding&lt;/param-value&gt;
        &lt;/init-param&gt;
	&lt;/filter&gt;
    &lt;filter-mapping&gt;
		&lt;filter-name&gt;NoCache&lt;/filter-name&gt;
		&lt;url-pattern&gt;*.action&lt;/url-pattern&gt;
	&lt;/filter-mapping&gt;
	&lt;filter-mapping&gt;
		&lt;filter-name&gt;CacheForWeek&lt;/filter-name&gt;
		&lt;url-pattern&gt;*.jpg&lt;/url-pattern&gt;
        &lt;url-pattern&gt;*.png&lt;/url-pattern&gt;
        &lt;url-pattern&gt;*.gif&lt;/url-pattern&gt;
        &lt;url-pattern&gt;*.swf&lt;/url-pattern&gt;
        &lt;url-pattern&gt;*.ico&lt;/url-pattern&gt;
	&lt;/filter-mapping&gt;
	&lt;filter-mapping&gt;
		&lt;filter-name&gt;CacheFor3Days&lt;/filter-name&gt;
		&lt;url-pattern&gt;*.js&lt;/url-pattern&gt;
		&lt;url-pattern&gt;*.css&lt;/url-pattern&gt;
	&lt;/filter-mapping&gt;
</pre>

最后如果我们有CDN的话，CDN都会遵循同源策略，也可以放到CDN层配置。
所以在每个环节都可以配置，都可以控制静态资源，但是需要配置正确，才能使流量、带宽的资源占用达到最佳效果。

上述是在服务器架构层面静态资源展示、缓存的最佳配置，接下来如何保证在代码开发环节做到静态资源集最小，前端代码是需要重用、架构的
=====