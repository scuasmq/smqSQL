/** 应用的初始化|场景对象获取函数
 * @param {null|{URL_option}|String} url 默认值 | {base:'页面的base url',srv:'调用服务器接口时的root url',scene:'场景资源root url'} | 场景名
 		url.srv以'/'开始表示同域，APP.Srv不使用代理方式；否则表示APP.Srv使用代理方式
 * @param {Animation_option} sceneAni {'动画名':{t:动画秒时长,d:切入时是否延时},'动画名2':{...},...}
 		此处的动画名不是全名，且在css中实际上是成对出现的，如:"scale"，表示有两个动画分别名为"kf_scale_in","kf_scale_out"，分别用于切入和切出
 * @param {element} boxSC 场景容器
 * @param {element} boxWait 等待时显示的DOM元件
 * @param {Number} dtWait ajax超时限制(默认30000ms)
 * @param {{event handle}} evts
 * {
		"OnSceneInit":function('场景名') 场景刚刚加载完成，html元件已经生成，即将初始化
		,"OnSceneChg":function(['前一个场景','老场景(当前)','新场景'],parm,modal){返回true表示允许,false阻止} 其中parm和scene.OnShow得到的parm参数相同
		,"AfterSceneChg":function(['前一个场景','老场景','新场景(当前)']){不关心返回值}
	}
 * @returns {undefine|scene_obj}
 */
function APP(url,sceneAni,boxSC,boxWait,dtWait,evts)
{	if(1>=arguments.length)
		return APP['sc_'+(url?url:APP.scene)];//这种情况表示是想通过名字获得当前场景对象
	if(!url) url={};
	var debug=document.location.search.substr(1);
	if(!debug)
		debug=window.ENV || {};
	else
	{
		if('{'!=debug[0])
			debug=$$.Parm('debug');
		if(!debug) debug='{}';
		try{debug=JSON.parse(decodeURIComponent(debug));}
		catch(e)
		{
			alert('调试参数不合法('+e.message+'):\n'+decodeURIComponent(debug[1]));
			debug={};
		}
	}
	if(debug.log)
		window.LOG=function(s){console.log($$.StrTime(new Date(),'◇hh:nn ')+s);};
	else
		window.LOG=function(){};
	APP.useJS=debug.useJS?debug.useJS:0;
	APP.debug=debug.debug?debug.debug:0;
	if(debug.srv) url.srv=debug.srv;
	if(debug.scene) url.scene=debug.scene;
	if(debug.base) url.base=debug.base;

	if(null==url.srv) url.srv='/';
	APP.Srv.proxy=('/'==url.srv[0])?undefined:{};
	if(null==url.scene) url.scene=url.base?url.base:'/';
	APP.Scene._Load.proxy=('/'==url.scene[0])?undefined:{};
	APP.m_url=url;
	APP.m_ani=sceneAni;
	APP.m_aniName=[];
	for(var k in sceneAni)
		APP.m_aniName.push(k);
	if(url.base)
		$$('head')[0].appendChild($$('<base>').prop('href',url.base)[0]);
	APP.m_boxSC=boxSC?boxSC:$$('body')[0];
	APP.m_wait=boxWait;//加载等待画面
	APP.m_dtWait=dtWait?dtWait:30000;//等待加载超时时长(ms)
	APP.m_modalCnt=0;//模态场景嵌套深度
	APP.m_evts=evts?evts:{};
 	if(APP.useJS)
	{//添加和$$APP.js在同一目录下的$$API_useJS.js
		var src=$$('script[src$="$$APP.js"]').attr("src");
		if(src)
		{
			//$$('head')[0].appendChild($$('<script>').prop('type','text/javascript').prop('src',src.substr(0,src.length-8)+'$$API_useJS.js')[0]);
			src=$$.Ajax(src.substr(0,src.length-8)+'$$API_useJS.js',true);
			eval(src.responseText);
		}
	}
};
APP.Show=function(tgt,ani,t,delay,keep)
{
	var objs=$$(tgt);
	if(objs.length<=0) return;
	if(objs[0]._ani_t)
	{
		clearTimeout(objs[0]._ani_t);
		delete objs[0]._ani_t;
	}
	objs.each(function(obj)
	{
		obj.style.display=(null!=obj._oldDisp && 'none'!=obj._oldDisp)?obj._oldDisp:'block';
		if(!t && !delay) return;
		obj.style[$$.jsAniName]='kf_'+(ani?ani:'fade')+'_in '+(t?t:0)+'s ease '+(delay?delay:0)+'s forwards';
	});
	if(!keep) objs[0]._ani_t=setTimeout(function(x)
	{
		$$(x).css($$.jsAniName,'none');
	},((t?t*1000:10)+(delay?delay*1000:0)),tgt);
};
APP.Hide=function(tgt,ani,t,delay,keep)
{
	var objs=$$(tgt);
	if(objs.length<=0) return;
	if(objs[0]._ani_t)
	{
		clearTimeout(objs[0]._ani_t);
		delete objs[0]._ani_t;
	}
	objs.each(function(obj)
	{
		if(null==obj._oldDisp)
			obj._oldDisp=obj.style.display;
		if(!t && !delay)
		{
			obj.style.display='none';
			return;
		}
		obj.style[$$.jsAniName]='kf_'+(ani?ani:'fade')+'_out '+(t?t:0.01)+'s ease '+(delay?delay:0)+'s forwards';
	});
	objs[0]._ani_t=setTimeout(function(x,kp)
	{
		$$(x).css('display','none');
		if(!kp) $$(x).css($$.jsAniName,'none');
	},((t?t*1000:10)+(delay?delay*1000:0)),tgt,keep);
};
APP.SetBtnClick=function(btn,func)
{//设定按钮的onclick事件，并使得它在动画效果后生效\
	if(!APP.SetBtnClick.OnClick)
	{
 		APP.SetBtnClick.OnAniEnd=function(btn)
		{
			$$(btn).css($$.jsAniName,'none');
			if(btn._onclick) btn._onclick.call(btn);
		};
		APP.SetBtnClick.OnClick=function()
		{
			if(null!=this.getAttribute('disabled')) return;
			$$.Animation(this,'kf_scale_shock 0.15s ease');
			setTimeout(APP.SetBtnClick.OnAniEnd,160,this);
		};
	}
	$$(btn).each(function(b,lst,i,par)
	{
		if(!func)
		{
			b._onclick=undefined;
			b.onclick=undefined;
			return;
		}
		b._onclick=func;
		b.onclick=APP.SetBtnClick.OnClick;
		//b.addEventListener("webkitAnimationEnd",APP.SetBtnClick.OnAniEnd);
	},func);
};
/** 切换场景
 * @param {String|null} scene {目标场景名称|上一个场景}
 * @param {String|null|Function} method {切换动画名|随机选择|仅第一次加载的时候使用，加载后不切换场景，执行此函数}
 * @param {*} parm 新场景的OnShow事件的第一个参数
 * @param {Function|undefined} callback 新场景在关闭时的回调(关闭的场景名,关闭场景在AfterClose函数中返回的对象)
 * @param {Boolean} modal 是否"模态"方式,模态方式下老场景并不关闭(不发生close系列事件)，新场景只是叠加在老场景之上
 * @public
 */
APP.Scene=function(scene,method,parm,callback,modal)
{
	var scOld=APP.scene?APP['sc_'+APP.scene]:null;//老场景(当前场景)
	if(!scene) scene=scOld?scOld['(pre)']:'';
	if(!scene) return;//无效的调用
	if(APP.Scene.m_busy)
	{
		APP.Scene.m_que.unshift([scene,method,parm,callback,modal]);
		return;
	}
	if(scOld && scOld['(modal)'] && ((!modal && scene!=scOld['(pre)']) || (modal && scene==scOld['(pre)'])))
	{
		alert('禁止从模态场景直接切换非父场景，或模态地切换到父场景');
		return APP.Scene.Next();
	}
	if(!APP.Scene._Load(scene,method,parm,callback,modal))
	{//需要加载该场景
		APP.Scene.m_busy=1;
		return;
	}
	
	var sc=APP['sc_'+scene]?APP['sc_'+scene]:null;//新场景js对象
	if(sc && !sc.inited)
	{
		sc.call(sc);
		sc.inited=true;
	}

	if(sc==scOld) return APP.Scene.Next();//场景没有变化
	
	var sLog='null';
	if(parm) try{sLog=JOSN.stringify(parm);} catch(e){};
	LOG('场景变化:'+(APP.scene?APP.scene:'null')+"-("+method+")→"+scene+':'+sLog);
	if(scOld && !modal && scOld.BeforeClose && false===scOld.BeforeClose([scOld['(pre)'],scOld['(self)'],scene]))
		return APP.Scene.Next();//老场景将关闭；且老场景有BeforeClose，调用，如老场景拒绝关闭，直接返回
	if(APP.m_evts['OnSceneChg'] && !APP.m_evts['OnSceneChg']((scOld?[scOld['(pre)'],scOld['(self)'],scene]:[null,null,scene]),parm,modal))
		return APP.Scene.Next();
	if(scOld && !modal && scOld['(modal)'])//老模态场景将关闭==有老场景 && 新场景不是模态方式 && 老场景是模态
		APP.m_modalCnt--;//模态场景关闭计数

	//:开始切换
	APP.Scene.m_busy=1;
	var t,ani=APP.m_ani[method?method:(method=APP.m_aniName[Math.floor(Math.random()*APP.m_aniName.length)])];//动画效果
	if(!ani)
	{
		ani=APP.m_ani['fade'];
		method='fade';
	}
	if(scOld && !modal)
		APP.Hide('#sc_'+APP.scene,method,ani.t,0);//关闭老场景
	if(modal)
	{
		APP.m_modalCnt++;
		$$('#sc_'+scene).css('zIndex',APP.m_modalCnt);
	}
	t=scOld?ani.t:0;//如果没有老场景，则表示立刻显示
	if(!scOld || !scOld['(modal)'] || modal)
	{//不是模态场景切换到父场景
		APP.Show('#sc_'+scene,method,t,t*(APP.scene?ani.d:0));
		sc['(callback)']=callback;
		sc['(modal)']=modal;
		sc['(pre)']=APP.scene;
		sc['(self)']=scene;
		if(sc.OnShow) sc.OnShow(parm,[APP.scene,scene,scene],callback,modal);
	}
	APP.scene=scene;
	setTimeout(APP.Scene._OnAniEnd,t*1000+10,scOld,sc,scene);
};
APP.Scene.m_que=[];//排队等待切换的场景们
APP.Scene.Next=function()
{
	var args=APP.Scene.m_que.pop();
	if(!args) return;
	APP.Scene.apply(APP.Scene,args);
};
APP.Scene._OnAniEnd=function(scOld,scNew,scene)
{
	var scs=[scNew['(pre)'],scNew['(self)'],scene];
	var oldIsModal=(scOld && scOld['(modal)']);
	if(scOld && (!scNew['(modal)'] || scNew['(self)']==scOld['(pre)']))
	{//新场景非模态或新场景是老场景的父场景，则老场景应该发生afterClose
		var ret=undefined;
		if(scOld.AfterClose)
			ret=scOld.AfterClose([scOld['(pre)'],scOld['(self)'],scene]);
		if(scOld['(callback)'])
		{
			scOld['(callback)'].call(scNew,scOld['(self)'],ret);
			delete scOld['(callback)'];//释放
		}
		if(scOld['(modal)'])
		{
			$$('#sc_'+scOld['(modal)']).css('zIndex',undefined);
			delete scOld['(modal)'];
		}
	}
	if(scNew && scNew.AfterShow && (!oldIsModal || scNew['(self)']!=scOld['(pre)']))
		scNew.AfterShow(scs);
	if(APP.m_evts['AfterSceneChg'])
		APP.m_evts['AfterSceneChg'](scs);
	APP.Scene.m_busy=0;
	APP.Scene.Next();
};
APP.Scene._Load=function(scene,method,parm,callback,modal)
{//private:判断场景是否需要加载，如需要，则加载，加载完成后自动切换到该场景(参见APP.Scene的参数说明)
	var res=[],sc=APP['sc_'+scene];
	if(!sc)//需要load场景js
	{
		res.push({url:APP.m_url.scene+'sc_'+scene+'.js',type:'js'});
		//res.push({url:APP.m_url.scene+'sc_'+scene+'.css',type:'css'});
	}
	if(0>=$$('#sc_'+scene).length)
		res.push({url:APP.m_url.scene+'sc_'+scene+'.htm',type:'htm'});
	if(0>=res.length)
	{
		if(!sc.inited)
		{
			$$('.tab>div','#sc_'+scene).bind('click',APP.Tab);
			if(APP.m_evts['OnSceneInit'])
				APP.m_evts['OnSceneInit'](scene);
			try{sc.call(sc);sc.inited=true;}
			catch(err)
			{
				LOG('sc_'+scene+'.Init 错误:'+err.message);
			};
		}
		return true;//无需加载
	}
	APP.Show(APP.m_wait);
	var loader=APP.Scene._Load;
	loader.netResCnt=res.length;//计数器
	loader.scene=scene;
	loader.method=method;
	loader.parm=parm;
	loader.callback=callback;
	loader.modal=modal;
	for(var i=0;i<res.length;i++)
	{
		if('js'==res[i].type)
			$$('head')[0].appendChild($$('<script>').prop('onload',APP.Scene._OnJs).prop('type','text/javascript').prop('src',res[i].url)[0]);
		else
			$$.Ajax(res[i].url,true,null,{ready:APP.Scene._OnRes,evtHost:APP.Scene._Load,t:30000,id:res[i].type},APP.Scene._Load.proxy);
	}
	return false;
};
APP.Scene._OnJs=function()
{
	APP.Scene._OnRes({status:200,readyState:4,responseText:''},'js');
};
APP.Scene._OnRes=function(a,type)
{
	var H=APP.Scene._Load,sc;
	if(a.readyState!=4)
	{//超时处理
		alert("网络连接超时");
		APP.Scene.m_busy=0;
		return;
	}
	if('htm'==type)
	{
		if(200!=a.status)
		{
			alert("网络错误#"+a.status);
			APP.Scene.m_busy=0;
			return;
		}
		sc=$$('<div>').prop('id','sc_'+H.scene).prop('className','scene').css('display','none').html(a.responseText)[0];
		var scx=$$('.scene[id^="sc_"]',APP.m_boxSC);
		if(scx.length>0) scx=scx[scx.length-1].nextSibling;
		else scx=APP.m_boxSC.firstChild;
		APP.m_boxSC.insertBefore(sc,scx);
	}
	else if('css'==type && 200==a.status)
	{
		if(!H.sty)
		{
			H.sty=$$('<style>')[0];
			$$('head')[0].appendChild(H.sty);
		}
		H.sty.innerHTML=H.sty.innerHTML+a.responseText;
	}
	H.netResCnt--;
	if(H.netResCnt<=0)
	{
		sc=APP['sc_'+H.scene];
		setTimeout(APP.Scene._OnLoaded,((sc && sc.OPT && sc.OPT.loadDelay)?sc.OPT.loadDelay:0),H,sc);
	}
};
APP.Scene._OnLoaded=function(H,sc)
{
	APP.Scene.m_busy=0;
	APP.Hide(APP.m_wait);
	if(!sc)
	{
		alert('场景:['+H.scene+']缺少js关联对象');
		return APP.Scene.Next();
	}
	$$('.tab>div','#sc_'+H.scene).bind('click',APP.Tab);
	if(APP.m_evts['OnSceneInit'])
		APP.m_evts['OnSceneInit'](H.scene);
	try{sc.call(sc);sc.inited=true;}
	catch(err)
	{
		LOG('sc_'+H.scene+'.Init 错误:'+err.message);
	};
	$$('#sc_'+H.scene).css({"opacity":'',"zIndex":'',"display":"none"});
	if(H.method && Function==H.method.constructor)
		H.method(H.scene);
	else
		APP.Scene(H.scene,H.method,H.parm,H.callback,H.modal);
};
APP.Tab=function()
{
	var sc=this;
	for(;sc && sc.parentNode!=APP.m_boxSC;sc=sc.parentNode);
	sc=APP[sc.id];
	var id=$$(this).attr('_id');
	if(sc && sc.OnTab && false===sc.OnTab.call(sc,id))
		return;
	$$('div[_id]',this.parentNode).attr('focus',undefined);
	$$(this).attr('focus','');
	$$('.pg:not(.dlg)',this.parentNode.parentNode).each(function(pg)
	{
		pg.style.display=(pg.getAttribute("_id")==id)?'block':'none';
	});
};
/** 从dom元件封装JSON数据对象
 * @param {{key:selector,...}} lst selector选中的dom元件必须具有js的value属性(一般是form控件)
	元件上可定义如下属性，控制处理方式:
	_type=类型检查参数:int|float 未定义表示string
	_reg=必须符合此正则表达式
	_trim=自动trim: h=trim半角空格,w=trim全半角空格
	_lbl=提示信息显示名
	_sample=正确格式示例
	_len=长度限制范围[min,max]:大于等于min，小于等于max
	_range=取值范围限制[min,max],可以使用()做开区间
	_def=无填写时的默认值
	_need=有此项表示即使没有填写且无默认值，也要传送空字串
 * @param {boolean} silent 如果出现了错误，是否禁止alert
 * @return {{key:value,...}}
 */
APP.PackData=function(lst,silent)
{
	var data={};
	var par={lst:lst,silent:silent,err:0};
	for(var key in lst)
	{
		var eds=$$(lst[key]);
		if(eds.length<=0)
		{
			alert('PackData:无法定位元件<'+lst[key]+'>');
			continue;
		}
		par.v=[];
		par.key=key;
		par.err=0;
		eds.each(APP.PackData._push,par);
		if(par.err) return null;
		if(par.v.length>0)
			data[key]=(par.v.length>1?par.v.toString():par.v[0]);
	}
	return data;
};
APP.PackData._push=function(it,lst,idx,p)
{
	p.err=true;
	var ed=$$(it);
	var v=ed.prop('value'),isStr=0;
	if(null==v)
	{
		alert('PackData:元件<'+p.lst[p.key]+'['+idx+']>没有合法的value属性');//这个错误提示不受silent影响
		return false;
	}
	var lbl=ed.attr("_lbl"),need=(null!=ed.attr("_need"));
	var sample=ed.attr('_sample');
	sample=sample?'\n如：'+sample:'';
	if(!lbl) lbl=p.key;
	lbl="["+lbl+"]";
	var x;
	if(x=ed.attr("_trim"))
		v=(x.toLowerCase()=="h"?v.trim():v.trimW());
	if((x=ed.attr("_def")) && !v)
		v=x;
	if(!v && !need)
	{//不是必须填写的，也的确没有填写，就直接返回了
		delete p.err;
		return;
	}
	if(x=ed.attr("_reg"))
	{
		if(!eval(x).test(v))
		{
			if(!p.silent) alert(lbl+"格式错误，请按正确格式填写"+sample);
			ed[0].focus();
			return false;
		}
	}
	x=ed.attr("_len");
	if(x)
	{
		x=APP.PackData._range(v.length,x,true);
		if(x)
		{
			if(!p.silent) alert(lbl+"的字数必须"+x);
			ed[0].focus();
			return false;
		}
	}
	x=(ed.attr("_type")+"").toLowerCase();
	switch(x)
	{
	case 'int':
		v=parseInt(v,10);break;
	case 'float':
		v=parseFloat(v);break;
	default:
		isStr=1;
	}
	if(!isStr && isNaN(v))
	{
		if(!p.silent) alert(lbl+"中需要填写数值"+sample);
		ed[0].focus();
		return false;
	}
	x=ed.attr("_range");
	if(x)
	{
		x=APP.PackData._range(v,x,true);
		if(x)
		{
			if(!p.silent) alert(lbl+"必须"+x);
			ed[0].focus();
			return false;
		}
	}
	delete p.err;
	if(!isStr || v || need)
		p.v.push(v);//如果是空字串，且没有标明必须有，就不push到结果中了
};
APP.PackData._range=function(v,range)
{
	var cl=range.substr(0,1),cr=range.substr(-1,1);
	var rng=JSON.parse("["+range.substr(1,range.length-2)+"]");
	var s;
	if(rng[0]==rng[1])
		s="是"+rng[0];
	else
		s=(null==rng[0]?'':(cl=="["?"大于等于":"大于")+rng[0])+(null==rng[1]?'':(null==rng[0]?'':'且')+(cr=="]"?"小于等于":"小于")+rng[1]);
	if(null!=rng[0] && (cl=="["?(v<rng[0]):(v<=rng[0]))) return s;
	if(null!=rng[1] && (cr=="]"?(v>rng[1]):(v>=rng[1]))) return s;
	return 0;
};
/** 调用服务器接口
 * @param {String} op 接口名
 * @param {{}} arg POST数据(键值对对象)
 * @param {*} id onRet函数的返回参数
 * @param {Number|undefined} t 超时毫秒|无限等待
 * @param {Function|undefined} onRet 回调函数(ret=返回结果,id=回调参数)
 * @returns {JSON|xhr} 同步方式返回结果|异步方式返回xhr
 * 返回结果是一个JSON对象,其中no属性为0表示超时,-1表示无法解析的json返回，其他<0表示常见http返回code的负值，>0的值参见接口定义
 */
APP.Srv=function(op,arg,id,t,onRet)
{
	APP.Show(APP.m_wait);
	APP.Srv.m_cnt++;
	LOG('ajax提交:'+op+'?'+JSON.stringify(arg?arg:null));
	if(APP.useJS)//调试
		return APP.Srv._useJS(op,arg,id,t,onRet);
	var data='';
	var isForm=(window.FormData && window.FormData==arg.constructor);
	if(isForm)
		data=arg;
	else
		for(var key in arg)
		{
			var v=arg[key];
			if(v && v.constructor!=String)
				v=JSON.stringify(v);
			data+='&'+key+'='+encodeURIComponent(v);
		}
	var asyner=null;
	if(onRet)
	{
		asyner={id:id,t:t,ready:function(a,id)
		{
			var f=arguments.callee._onRet;
			delete arguments.callee._onRet;
			f(APP.Srv.ParseRet(a),id);
		}};
		asyner.ready._onRet=onRet;
	}
	var a=$$.Ajax(APP.m_url.srv+op,false,{head:isForm?null:['Content-Type','application/x-www-form-urlencoded;charset=utf-8'],content:(isForm?data:data.substr(1))},asyner,APP.Srv.proxy);
	return asyner?a:APP.Srv.ParseRet(a);
};
APP.Srv.m_cnt=0;
APP.Srv.ParseRet=function(a,onlyParse)
{
	if(!onlyParse)
	{
		APP.Srv.m_cnt--;
		if(APP.Srv.m_cnt<=0)
		{
			APP.Hide(APP.m_wait);
			APP.Srv.m_cnt=0;
		}
	}
	if(a.readyState!=4)
		return {no:0,msg:"请求超时(请确保网络畅通)"};
	if(200!=a.status)
		return {no:-a.status,msg:"请求返回错误#"+a.status+":"+a.responseText};
	var ret;
	try
	{
		ret=JSON.parse(a.responseText);
	}
	catch(e)
	{
		ret={no:-1,msg:"非法json返回:\n"+e.toString()+"\n"+a.responseText};
	}
	return ret;
};
APP.Srv.Str2Json=function(str)
{
	var ret;
	try{ret=JSON.parse(str);}
	catch(e){ret=undefined;}
	return ret;
};
