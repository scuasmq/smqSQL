//原JS对象能力扩展部分=======================================================
String.prototype.len=function()//获得String的字节长度（汉字或全角符号的长度为2）
{	
	  return   this.replace(/[^\x00-\xff]/g,"**").length;	
};
String.prototype.trim= function()
{// 用正则表达式将前后空格	
	return this.replace(/(^\s+)|(\s+$$)/g,"");  
};
String.prototype.trimW= function()
{//trim包括全角空格
	return this.replace(/(^[\s　]+)|([\s　]+$$)/g,"");  
};
String.prototype.toHTML= function()
{
	return this.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
String.prototype.toText= function()
{
	return this.replace(/&amp;/g,"&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
};
//页面全局对象、变量和环境初始化========================================
function $$(selector,root,incRoot)
{
	if(!selector) return new $$([]);
	if(selector.constructor==String)
	{//字串选择器
		if(/^<[^>]+>$/.test(selector))//创建
			return $$(document.createElement(selector.substr(1,selector.length-2)));
		if(!document.querySelectorAll) return null;
		if(root && String==root.constructor)
			root=$$(root)[0];
		return new $$((root?root:document).querySelectorAll(selector),(incRoot?root:undefined));
	}
	if($$==selector.constructor)
		return selector;
	if(selector.nodeType && 1===selector.nodeType)
		return new $$([selector]);//直接定位单个节点对象
	//:创建选择结果集
	this.length=selector.length+(root?1:0);
	var i0=0;
	if(root)
	{
		this[i0]=root;
		i0++;
	}
	for(var i=0;i<selector.length;i++,i0++)
		this[i0]=selector[i];
};
$$.Ajax=function(url,isGet,data,asyner,noCredentials)
{
	/*发送一个ajax请求，同步方式下返回对应的ajax对象,处理后需自行删除回收
	如为异步方式，本函数返回undefined，ajax对象会自动删除回收，不要在响应函数的实现中删除ajax对象
	(	url=请求网址,
		isGet=是否采用GET方式发送/否则是POST方式,
		data=发送的内容，可略去
		{
			head:['headKey1','headValue1',...],//一定有偶数个成员，略去表示不特别指明头
			content:'...'//POST方式时要传送的数据/可以略去或是null,
		}
		asyner=//异步响应对象，null或略去即为同步方式
		{
			ready:异步响应函数，此函数参数：(a:对应的ajax对象,id)，可通过如a.readyState!=4，表示超时；不指定此响应函数即为同步方式,
			evtHost:响应函数中this所引用的对象，可略去，表示不关心this
			t:超时的毫秒数,不设定则表示无限等待
			id:指定回调中的id参数，不设定则没有这个参数
		}
	)*/
	if(!$$.Ajax.Void) $$.Ajax.Void=function(){};
	var a,i,f;
	if (window.XMLHttpRequest)
		a=new XMLHttpRequest();
	else if (window.ActiveXObject)
		a=new ActiveXObject("Microsoft.XMLHTTP");
	var isAsyn=((asyner && asyner.ready)?1:0);
	a.open((isGet?"GET":"POST"),url,isAsyn?true:false);
	if(data && data.head)
		for(i=1;i<data.head.length;i+=2)
			a.setRequestHeader(data.head[i-1],data.head[i]);
	if(isAsyn)
	{//指定了异步响应函数
		f=function(evt,t)
		{
			var F=arguments.callee;
			try{if(!t && F._A.readyState!=4) return;}catch(e){return;};
			if(F._t) clearTimeout(F._t);//清除超时timer
			F._t=null;
			var A=F._A;
			F._A=null;//消除交叉引用
			A.onreadystatechange=$$.Ajax.Void;//消除交叉引用
			delete A.onreadystatechange;
			if(t) A.abort();
			var E=null;
			try
			{
				if(F._host)
					F._onReady.call(F._host,A,F._id);
				else
					F._onReady(A,F._id);
			}
			catch(e){E=e;}//捕获响应函数中的实现错误
			A=null;//回收ajax对象
			F._id=null;
			if(null!=E) throw(E);
		};
		f._host=asyner.evtHost;
		f._onReady=asyner.ready;
		f._A=a;
		f._id=(null!=asyner.id)?asyner.id:null;
		if(asyner.t) f._t=setTimeout(f,asyner.t,null,1);
		a.onreadystatechange=f;
		f=null;
	}
	try
	{
		if(null!=a.withCredentials && !noCredentials)
			a.withCredentials=true;
		if (!isGet) a.send((data && data.content)?data.content:null);
		else a.send();
	}
	catch(e)
	{//发生了服务端口被拒绝之类的错误
		if(isAsyn) f(null,1);
	}
	return a;//返回xhr对象
};
$$.Parm=function(name,raw)
{//获取页面的Get参数;raw:get参数是否不解码，保持原有数据
	var arr=document.location.href.match(new RegExp("\\?(?:.*&|)\\s*"+name+"=([^&]*)&?","i"));
	if(arr != null) return (raw?arr[1]:decodeURIComponent(arr[1]));
	return "";
};
$$.StrTime=function(D,fmt)
{//Date转换为字串表达(D=Date或Date的字串,fmt=格式，目前只支持"yyyy,mm,dd,hh,nn,ss"几个符号)
	if(String==D.constructor || Number==D.constructor)
		D=new Date(D);
	var d=(100000000+10000*D.getFullYear()+100*(D.getMonth()+1)+D.getDate()).toString();
	var t=(1000000+10000*D.getHours()+100*D.getMinutes()+D.getSeconds()).toString();
	return fmt.replace("yyyy",d.substr(1,4)).replace("mm",d.substr(5,2)).replace("dd",d.substr(7,2)).replace(
		"hh",t.substr(1,2)).replace("nn",t.substr(3,2)).replace("ss",t.substr(5,2)).replace("yy",d.substr(3,2));
};

