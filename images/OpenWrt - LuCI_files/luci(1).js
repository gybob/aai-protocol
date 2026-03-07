
(function(window,document,undefined){'use strict';var env={};if(typeof Object.assign!=='function'){Object.defineProperty(Object,'assign',{value:function assign(target,varArgs){if(target==null)
throw new TypeError('Cannot convert undefined or null to object');var to=Object(target);for(var index=1;index<arguments.length;index++)
if(arguments[index]!=null)
for(var nextKey in arguments[index])
if(Object.prototype.hasOwnProperty.call(arguments[index],nextKey))
to[nextKey]=arguments[index][nextKey];return to;},writable:true,configurable:true});}
if(typeof Promise.prototype.finally!=='function'){Promise.prototype.finally=function(fn){var onFinally=function(cb){return Promise.resolve(fn.call(this)).then(cb);};return this.then(function(result){return onFinally.call(this,function(){return result})},function(reason){return onFinally.call(this,function(){return Promise.reject(reason)})});};}
var toCamelCase=function(s){return s.replace(/(?:^|[\. -])(.)/g,function(m0,m1){return m1.toUpperCase()});};var superContext={},classIndex=0,Class=Object.assign(function(){},{extend:function(properties){var props={__id__:{value:classIndex},__base__:{value:this.prototype},__name__:{value:properties.__name__||'anonymous'+classIndex++}};var ClassConstructor=function(){if(!(this instanceof ClassConstructor))
throw new TypeError('Constructor must not be called without "new"');if(Object.getPrototypeOf(this).hasOwnProperty('__init__')){if(typeof(this.__init__)!='function')
throw new TypeError('Class __init__ member is not a function');this.__init__.apply(this,arguments)}
else{this.super('__init__',arguments);}};for(var key in properties)
if(!props[key]&&properties.hasOwnProperty(key))
props[key]={value:properties[key],writable:true};ClassConstructor.prototype=Object.create(this.prototype,props);ClassConstructor.prototype.constructor=ClassConstructor;Object.assign(ClassConstructor,this);ClassConstructor.displayName=toCamelCase(props.__name__.value+'Class');return ClassConstructor;},singleton:function(properties){return Class.extend(properties).instantiate(Class.prototype.varargs(arguments,1));},instantiate:function(args){return new(Function.prototype.bind.apply(this,Class.prototype.varargs(args,0,null)))();},call:function(self,method){if(typeof(this.prototype[method])!='function')
throw new ReferenceError(method+' is not defined in class');return this.prototype[method].apply(self,self.varargs(arguments,1));},isSubclass:function(classValue){return(classValue!=null&&typeof(classValue)=='function'&&classValue.prototype instanceof this);},prototype:{varargs:function(args,offset){return Array.prototype.slice.call(arguments,2).concat(Array.prototype.slice.call(args,offset));},super:function(key,callArgs){if(key==null)
return null;var slotIdx=this.__id__+'.'+key,symStack=superContext[slotIdx],protoCtx=null;for(protoCtx=Object.getPrototypeOf(symStack?symStack[0]:Object.getPrototypeOf(this));protoCtx!=null&&!protoCtx.hasOwnProperty(key);protoCtx=Object.getPrototypeOf(protoCtx)){}
if(protoCtx==null)
return null;var res=protoCtx[key];if(arguments.length>1){if(typeof(res)!='function')
throw new ReferenceError(key+' is not a function in base class');if(typeof(callArgs)!='object')
callArgs=this.varargs(arguments,1);if(symStack)
symStack.unshift(protoCtx);else
superContext[slotIdx]=[protoCtx];res=res.apply(this,callArgs);if(symStack&&symStack.length>1)
symStack.shift(protoCtx);else
delete superContext[slotIdx];}
return res;},toString:function(){var s='['+this.constructor.displayName+']',f=true;for(var k in this){if(this.hasOwnProperty(k)){s+=(f?' {\n':'')+'  '+k+': '+typeof(this[k])+'\n';f=false;}}
return s+(f?'':'}');}}});var Headers=Class.extend({__name__:'LuCI.headers',__init__:function(xhr){var hdrs=this.headers={};xhr.getAllResponseHeaders().split(/\r\n/).forEach(function(line){var m=/^([^:]+):(.*)$/.exec(line);if(m!=null)
hdrs[m[1].trim().toLowerCase()]=m[2].trim();});},has:function(name){return this.headers.hasOwnProperty(String(name).toLowerCase());},get:function(name){var key=String(name).toLowerCase();return this.headers.hasOwnProperty(key)?this.headers[key]:null;}});var Response=Class.extend({__name__:'LuCI.response',__init__:function(xhr,url,duration,headers,content){this.ok=(xhr.status>=200&&xhr.status<=299);this.status=xhr.status;this.statusText=xhr.statusText;this.headers=(headers!=null)?headers:new Headers(xhr);this.duration=duration;this.url=url;this.xhr=xhr;if(content instanceof Blob){this.responseBlob=content;this.responseJSON=null;this.responseText=null;}
else if(content!=null&&typeof(content)=='object'){this.responseBlob=null;this.responseJSON=content;this.responseText=null;}
else if(content!=null){this.responseBlob=null;this.responseJSON=null;this.responseText=String(content);}
else{this.responseJSON=null;if(xhr.responseType=='blob'){this.responseBlob=xhr.response;this.responseText=null;}
else{this.responseBlob=null;this.responseText=xhr.responseText;}}},clone:function(content){var copy=new Response(this.xhr,this.url,this.duration,this.headers,content);copy.ok=this.ok;copy.status=this.status;copy.statusText=this.statusText;return copy;},json:function(){if(this.responseJSON==null)
this.responseJSON=JSON.parse(this.responseText);return this.responseJSON;},text:function(){if(this.responseText==null&&this.responseJSON!=null)
this.responseText=JSON.stringify(this.responseJSON);return this.responseText;},blob:function(){return this.responseBlob;}});var requestQueue=[];function isQueueableRequest(opt){if(!classes.rpc)
return false;if(opt.method!='POST'||typeof(opt.content)!='object')
return false;if(opt.nobatch===true)
return false;var rpcBaseURL=Request.expandURL(classes.rpc.getBaseURL());return(rpcBaseURL!=null&&opt.url.indexOf(rpcBaseURL)==0);}
function flushRequestQueue(){if(!requestQueue.length)
return;var reqopt=Object.assign({},requestQueue[0][0],{content:[],nobatch:true}),batch=[];for(var i=0;i<requestQueue.length;i++){batch[i]=requestQueue[i];reqopt.content[i]=batch[i][0].content;}
requestQueue.length=0;Request.request(rpcBaseURL,reqopt).then(function(reply){var json=null,req=null;try{json=reply.json()}
catch(e){}
while((req=batch.shift())!=null)
if(Array.isArray(json)&&json.length)
req[2].call(reqopt,reply.clone(json.shift()));else
req[1].call(reqopt,new Error('No related RPC reply'));}).catch(function(error){var req=null;while((req=batch.shift())!=null)
req[1].call(reqopt,error);});}
var Request=Class.singleton({__name__:'LuCI.request',interceptors:[],expandURL:function(url){if(!/^(?:[^/]+:)?\/\//.test(url))
url=location.protocol+'//'+location.host+url;return url;},request:function(target,options){return Promise.resolve(target).then((function(url){var state={xhr:new XMLHttpRequest(),url:this.expandURL(url),start:Date.now()},opt=Object.assign({},options,state),content=null,contenttype=null,callback=this.handleReadyStateChange;return new Promise(function(resolveFn,rejectFn){opt.xhr.onreadystatechange=callback.bind(opt,resolveFn,rejectFn);opt.method=String(opt.method||'GET').toUpperCase();if('query'in opt){var q=(opt.query!=null)?Object.keys(opt.query).map(function(k){if(opt.query[k]!=null){var v=(typeof(opt.query[k])=='object')?JSON.stringify(opt.query[k]):String(opt.query[k]);return'%s=%s'.format(encodeURIComponent(k),encodeURIComponent(v));}
else{return encodeURIComponent(k);}}).join('&'):'';if(q!==''){switch(opt.method){case'GET':case'HEAD':case'OPTIONS':opt.url+=((/\?/).test(opt.url)?'&':'?')+q;break;default:if(content==null){content=q;contenttype='application/x-www-form-urlencoded';}}}}
if(!opt.cache)
opt.url+=((/\?/).test(opt.url)?'&':'?')+(new Date()).getTime();if(isQueueableRequest(opt)){requestQueue.push([opt,rejectFn,resolveFn]);requestAnimationFrame(flushRequestQueue);return;}
if('username'in opt&&'password'in opt)
opt.xhr.open(opt.method,opt.url,true,opt.username,opt.password);else
opt.xhr.open(opt.method,opt.url,true);opt.xhr.responseType=opt.responseType||'text';if('overrideMimeType'in opt.xhr)
opt.xhr.overrideMimeType('application/octet-stream');if('timeout'in opt)
opt.xhr.timeout=+opt.timeout;if('credentials'in opt)
opt.xhr.withCredentials=!!opt.credentials;if(opt.content!=null){switch(typeof(opt.content)){case'function':content=opt.content(opt.xhr);break;case'object':if(!(opt.content instanceof FormData)){content=JSON.stringify(opt.content);contenttype='application/json';}
else{content=opt.content;}
break;default:content=String(opt.content);}}
if('headers'in opt)
for(var header in opt.headers)
if(opt.headers.hasOwnProperty(header)){if(header.toLowerCase()!='content-type')
opt.xhr.setRequestHeader(header,opt.headers[header]);else
contenttype=opt.headers[header];}
if('progress'in opt&&'upload'in opt.xhr)
opt.xhr.upload.addEventListener('progress',opt.progress);if(contenttype!=null)
opt.xhr.setRequestHeader('Content-Type',contenttype);try{opt.xhr.send(content);}
catch(e){rejectFn.call(opt,e);}});}).bind(this));},handleReadyStateChange:function(resolveFn,rejectFn,ev){var xhr=this.xhr,duration=Date.now()-this.start;if(xhr.readyState!==4)
return;if(xhr.status===0&&xhr.statusText===''){if(duration>=this.timeout)
rejectFn.call(this,new Error('XHR request timed out'));else
rejectFn.call(this,new Error('XHR request aborted by browser'));}
else{var response=new Response(xhr,xhr.responseURL||this.url,duration);Promise.all(Request.interceptors.map(function(fn){return fn(response)})).then(resolveFn.bind(this,response)).catch(rejectFn.bind(this));}},get:function(url,options){return this.request(url,Object.assign({method:'GET'},options));},post:function(url,data,options){return this.request(url,Object.assign({method:'POST',content:data},options));},addInterceptor:function(interceptorFn){if(typeof(interceptorFn)=='function')
this.interceptors.push(interceptorFn);return interceptorFn;},removeInterceptor:function(interceptorFn){var oldlen=this.interceptors.length,i=oldlen;while(i--)
if(this.interceptors[i]===interceptorFn)
this.interceptors.splice(i,1);return(this.interceptors.length<oldlen);},poll:{add:function(interval,url,options,callback){if(isNaN(interval)||interval<=0)
throw new TypeError('Invalid poll interval');var ival=interval>>>0,opts=Object.assign({},options,{timeout:ival*1000-5});var fn=function(){return Request.request(url,options).then(function(res){if(!Poll.active())
return;var res_json=null;try{res_json=res.json();}
catch(err){}
callback(res,res_json,res.duration);});};return(Poll.add(fn,ival)?fn:null);},remove:function(entry){return Poll.remove(entry)},start:function(){return Poll.start()},stop:function(){return Poll.stop()},active:function(){return Poll.active()}}});var Poll=Class.singleton({__name__:'LuCI.poll',queue:[],add:function(fn,interval){if(interval==null||interval<=0)
interval=env.pollinterval||null;if(isNaN(interval)||typeof(fn)!='function')
throw new TypeError('Invalid argument to LuCI.poll.add()');for(var i=0;i<this.queue.length;i++)
if(this.queue[i].fn===fn)
return false;var e={r:true,i:interval>>>0,fn:fn};this.queue.push(e);if(this.tick!=null&&!this.active())
this.start();return true;},remove:function(fn){if(typeof(fn)!='function')
throw new TypeError('Invalid argument to LuCI.poll.remove()');var len=this.queue.length;for(var i=len;i>0;i--)
if(this.queue[i-1].fn===fn)
this.queue.splice(i-1,1);if(!this.queue.length&&this.stop())
this.tick=0;return(this.queue.length!=len);},start:function(){if(this.active())
return false;this.tick=0;if(this.queue.length){this.timer=window.setInterval(this.step,1000);this.step();document.dispatchEvent(new CustomEvent('poll-start'));}
return true;},stop:function(){if(!this.active())
return false;document.dispatchEvent(new CustomEvent('poll-stop'));window.clearInterval(this.timer);delete this.timer;delete this.tick;return true;},step:function(){for(var i=0,e=null;(e=Poll.queue[i])!=null;i++){if((Poll.tick%e.i)!=0)
continue;if(!e.r)
continue;e.r=false;Promise.resolve(e.fn()).finally((function(){this.r=true}).bind(e));}
Poll.tick=(Poll.tick+1)%Math.pow(2,32);},active:function(){return(this.timer!=null);}});var DOM=Class.singleton({__name__:'LuCI.dom',elem:function(e){return(e!=null&&typeof(e)=='object'&&'nodeType'in e);},parse:function(s){var elem=null;try{domParser=domParser||new DOMParser();elem=domParser.parseFromString(s,'text/html').body.firstChild;}
catch(e){}
return elem;},matches:function(node,selector){var m=this.elem(node)?node.matches||node.msMatchesSelector:null;return m?m.call(node,selector):false;},parent:function(node,selector){if(this.elem(node)&&node.closest)
return node.closest(selector);while(this.elem(node))
if(this.matches(node,selector))
return node;else
node=node.parentNode;return null;},append:function(node,children){if(!this.elem(node))
return null;if(Array.isArray(children)){for(var i=0;i<children.length;i++)
if(this.elem(children[i]))
node.appendChild(children[i]);else if(children!==null&&children!==undefined)
node.appendChild(document.createTextNode(''+children[i]));return node.lastChild;}
else if(typeof(children)==='function'){return this.append(node,children(node));}
else if(this.elem(children)){return node.appendChild(children);}
else if(children!==null&&children!==undefined){node.innerHTML=''+children;return node.lastChild;}
return null;},content:function(node,children){if(!this.elem(node))
return null;var dataNodes=node.querySelectorAll('[data-idref]');for(var i=0;i<dataNodes.length;i++)
delete this.registry[dataNodes[i].getAttribute('data-idref')];while(node.firstChild)
node.removeChild(node.firstChild);return this.append(node,children);},attr:function(node,key,val){if(!this.elem(node))
return null;var attr=null;if(typeof(key)==='object'&&key!==null)
attr=key;else if(typeof(key)==='string')
attr={},attr[key]=val;for(key in attr){if(!attr.hasOwnProperty(key)||attr[key]==null)
continue;switch(typeof(attr[key])){case'function':node.addEventListener(key,attr[key]);break;case'object':node.setAttribute(key,JSON.stringify(attr[key]));break;default:node.setAttribute(key,attr[key]);}}},create:function(){var html=arguments[0],attr=arguments[1],data=arguments[2],elem;if(!(attr instanceof Object)||Array.isArray(attr))
data=attr,attr=null;if(Array.isArray(html)){elem=document.createDocumentFragment();for(var i=0;i<html.length;i++)
elem.appendChild(this.create(html[i]));}
else if(this.elem(html)){elem=html;}
else if(html.charCodeAt(0)===60){elem=this.parse(html);}
else{elem=document.createElement(html);}
if(!elem)
return null;this.attr(elem,attr);this.append(elem,data);return elem;},registry:{},data:function(node,key,val){if(!node||!node.getAttribute)
return null;var id=node.getAttribute('data-idref');if(arguments.length>1&&key==null){if(id!=null){node.removeAttribute('data-idref');val=this.registry[id]
delete this.registry[id];return val;}
return null;}
else if(arguments.length>2&&key!=null&&val==null){if(id!=null){val=this.registry[id][key];delete this.registry[id][key];return val;}
return null;}
else if(arguments.length>2&&key!=null&&val!=null){if(id==null){do{id=Math.floor(Math.random()*0xffffffff).toString(16)}
while(this.registry.hasOwnProperty(id));node.setAttribute('data-idref',id);this.registry[id]={};}
return(this.registry[id][key]=val);}
else if(arguments.length==1){if(id!=null)
return this.registry[id];return null;}
else if(arguments.length==2){if(id!=null)
return this.registry[id][key];}
return null;},bindClassInstance:function(node,inst){if(!(inst instanceof Class))
LuCI.prototype.error('TypeError','Argument must be a class instance');return this.data(node,'_class',inst);},findClassInstance:function(node){var inst=null;do{inst=this.data(node,'_class');node=node.parentNode;}
while(!(inst instanceof Class)&&node!=null);return inst;},callClassMethod:function(node,method){var inst=this.findClassInstance(node);if(inst==null||typeof(inst[method])!='function')
return null;return inst[method].apply(inst,inst.varargs(arguments,2));},isEmpty:function(node,ignoreFn){for(var child=node.firstElementChild;child!=null;child=child.nextElementSibling)
if(!child.classList.contains('hidden')&&(!ignoreFn||!ignoreFn(child)))
return false;return true;}});var Session=Class.singleton({__name__:'LuCI.session',getID:function(){return env.sessionid||'00000000000000000000000000000000';},getToken:function(){return env.token||null;},getLocalData:function(key){try{var sid=this.getID(),item='luci-session-store',data=JSON.parse(window.sessionStorage.getItem(item));if(!LuCI.prototype.isObject(data)||!data.hasOwnProperty(sid)){data={};data[sid]={};}
if(key!=null)
return data[sid].hasOwnProperty(key)?data[sid][key]:null;return data[sid];}
catch(e){return(key!=null)?null:{};}},setLocalData:function(key,value){if(key==null)
return false;try{var sid=this.getID(),item='luci-session-store',data=JSON.parse(window.sessionStorage.getItem(item));if(!LuCI.prototype.isObject(data)||!data.hasOwnProperty(sid)){data={};data[sid]={};}
if(value!=null)
data[sid][key]=value;else
delete data[sid][key];window.sessionStorage.setItem(item,JSON.stringify(data));return true;}
catch(e){return false;}}});var View=Class.extend({__name__:'LuCI.view',__init__:function(){var vp=document.getElementById('view');DOM.content(vp,E('div',{'class':'spinning'},_('Loading view…')));return Promise.resolve(this.load()).then(LuCI.prototype.bind(this.render,this)).then(LuCI.prototype.bind(function(nodes){var vp=document.getElementById('view');DOM.content(vp,nodes);DOM.append(vp,this.addFooter());},this)).catch(LuCI.prototype.error);},load:function(){},render:function(){},handleSave:function(ev){var tasks=[];document.getElementById('maincontent').querySelectorAll('.cbi-map').forEach(function(map){tasks.push(DOM.callClassMethod(map,'save'));});return Promise.all(tasks);},handleSaveApply:function(ev,mode){return this.handleSave(ev).then(function(){classes.ui.changes.apply(mode=='0');});},handleReset:function(ev){var tasks=[];document.getElementById('maincontent').querySelectorAll('.cbi-map').forEach(function(map){tasks.push(DOM.callClassMethod(map,'reset'));});return Promise.all(tasks);},addFooter:function(){var footer=E([]),vp=document.getElementById('view'),hasmap=false,readonly=true;vp.querySelectorAll('.cbi-map').forEach(function(map){var m=DOM.findClassInstance(map);if(m){hasmap=true;if(!m.readonly)
readonly=false;}});if(!hasmap)
readonly=!LuCI.prototype.hasViewPermission();var saveApplyBtn=this.handleSaveApply?new classes.ui.ComboButton('0',{0:[_('Save & Apply')],1:[_('Apply unchecked')]},{classes:{0:'btn cbi-button cbi-button-apply important',1:'btn cbi-button cbi-button-negative important'},click:classes.ui.createHandlerFn(this,'handleSaveApply'),disabled:readonly||null}).render():E([]);if(this.handleSaveApply||this.handleSave||this.handleReset){footer.appendChild(E('div',{'class':'cbi-page-actions'},[saveApplyBtn,' ',this.handleSave?E('button',{'class':'cbi-button cbi-button-save','click':classes.ui.createHandlerFn(this,'handleSave'),'disabled':readonly||null},[_('Save')]):'',' ',this.handleReset?E('button',{'class':'cbi-button cbi-button-reset','click':classes.ui.createHandlerFn(this,'handleReset'),'disabled':readonly||null},[_('Reset')]):'']));}
return footer;}});var dummyElem=null,domParser=null,originalCBIInit=null,rpcBaseURL=null,sysFeatures=null,preloadClasses=null;var classes={baseclass:Class,dom:DOM,poll:Poll,request:Request,session:Session,view:View};var naturalCompare=new Intl.Collator(undefined,{numeric:true}).compare;var LuCI=Class.extend({__name__:'LuCI',__init__:function(setenv){document.querySelectorAll('script[src*="/luci.js"]').forEach(function(s){if(setenv.base_url==null||setenv.base_url==''){var m=(s.getAttribute('src')||'').match(/^(.*)\/luci\.js(?:\?v=([^?]+))?$/);if(m){setenv.base_url=m[1];setenv.resource_version=m[2];}}});if(setenv.base_url==null)
this.error('InternalError','Cannot find url of luci.js');setenv.cgi_base=setenv.scriptname.replace(/\/[^\/]+$/,'');Object.assign(env,setenv);var domReady=new Promise(function(resolveFn,rejectFn){document.addEventListener('DOMContentLoaded',resolveFn);});Promise.all([domReady,this.require('ui'),this.require('rpc'),this.require('form'),this.probeRPCBaseURL()]).then(this.setupDOM.bind(this)).catch(this.error);originalCBIInit=window.cbi_init;window.cbi_init=function(){};},raise:function(type,fmt){var e=null,msg=fmt?String.prototype.format.apply(fmt,this.varargs(arguments,2)):null,stack=null;if(type instanceof Error){e=type;if(msg)
e.message=msg+': '+e.message;}
else{try{throw new Error('stacktrace')}
catch(e2){stack=(e2.stack||'').split(/\n/)}
e=new(window[type||'Error']||Error)(msg||'Unspecified error');e.name=type||'Error';}
stack=(stack||[]).map(function(frame){frame=frame.replace(/(.*?)@(.+):(\d+):(\d+)/g,'at $1 ($2:$3:$4)').trim();return frame?'  '+frame:'';});if(!/^  at /.test(stack[0]))
stack.shift();if(/\braise /.test(stack[0]))
stack.shift();if(/\berror /.test(stack[0]))
stack.shift();if(stack.length)
e.message+='\n'+stack.join('\n');if(window.console&&console.debug)
console.debug(e);throw e;},error:function(type,fmt){try{LuCI.prototype.raise.apply(LuCI.prototype,Array.prototype.slice.call(arguments));}
catch(e){if(!e.reported){if(classes.ui)
classes.ui.addNotification(e.name||_('Runtime error'),E('pre',{},e.message),'danger');else
DOM.content(document.querySelector('#maincontent'),E('pre',{'class':'alert-message error'},e.message));e.reported=true;}
throw e;}},bind:function(fn,self){return Function.prototype.bind.apply(fn,this.varargs(arguments,2,self));},require:function(name,from){var L=this,url=null,from=from||[];if(classes[name]!=null){if(from.indexOf(name)!=-1)
LuCI.prototype.raise('DependencyError','Circular dependency: class "%s" depends on "%s"',name,from.join('" which depends on "'));return Promise.resolve(classes[name]);}
url='%s/%s.js%s'.format(env.base_url,name.replace(/\./g,'/'),(env.resource_version?'?v='+env.resource_version:''));from=[name].concat(from);var compileClass=function(res){if(!res.ok)
LuCI.prototype.raise('NetworkError','HTTP error %d while loading class file "%s"',res.status,url);var source=res.text(),requirematch=/^require[ \t]+(\S+)(?:[ \t]+as[ \t]+([a-zA-Z_]\S*))?$/,strictmatch=/^use[ \t]+strict$/,depends=[],args='';for(var i=0,off=-1,prev=-1,quote=-1,comment=-1,esc=false;i<source.length;i++){var chr=source.charCodeAt(i);if(esc){esc=false;}
else if(comment!=-1){if((comment==47&&chr==10)||(comment==42&&prev==42&&chr==47))
comment=-1;}
else if((chr==42||chr==47)&&prev==47){comment=chr;}
else if(chr==92){esc=true;}
else if(chr==quote){var s=source.substring(off,i),m=requirematch.exec(s);if(m){var dep=m[1],as=m[2]||dep.replace(/[^a-zA-Z0-9_]/g,'_');depends.push(LuCI.prototype.require(dep,from));args+=', '+as;}
else if(!strictmatch.exec(s)){break;}
off=-1;quote=-1;}
else if(quote==-1&&(chr==34||chr==39)){off=i+1;quote=chr;}
prev=chr;}
return Promise.all(depends).then(function(instances){var _factory,_class;try{_factory=eval('(function(window, document, L%s) { %s })\n\n//# sourceURL=%s\n'.format(args,source,res.url));}
catch(error){LuCI.prototype.raise('SyntaxError','%s\n  in %s:%s',error.message,res.url,error.lineNumber||'?');}
_factory.displayName=toCamelCase(name+'ClassFactory');_class=_factory.apply(_factory,[window,document,L].concat(instances));if(!Class.isSubclass(_class))
LuCI.prototype.error('TypeError','"%s" factory yields invalid constructor',name);if(_class.displayName=='AnonymousClass')
_class.displayName=toCamelCase(name+'Class');var ptr=Object.getPrototypeOf(L),parts=name.split(/\./),instance=new _class();for(var i=0;ptr&&i<parts.length-1;i++)
ptr=ptr[parts[i]];if(ptr)
ptr[parts[i]]=instance;classes[name]=instance;return instance;});};classes[name]=Request.get(url,{cache:true}).then(compileClass);return classes[name];},probeRPCBaseURL:function(){if(rpcBaseURL==null)
rpcBaseURL=Session.getLocalData('rpcBaseURL');if(rpcBaseURL==null){var msg={jsonrpc:'2.0',id:'init',method:'list',params:undefined};var rpcFallbackURL=this.url('admin/ubus');rpcBaseURL=Request.post(env.ubuspath,msg,{nobatch:true}).then(function(res){return(rpcBaseURL=res.status==200?env.ubuspath:rpcFallbackURL);},function(){return(rpcBaseURL=rpcFallbackURL);}).then(function(url){Session.setLocalData('rpcBaseURL',url);return url;});}
return Promise.resolve(rpcBaseURL);},probeSystemFeatures:function(){if(sysFeatures==null)
sysFeatures=Session.getLocalData('features');if(!this.isObject(sysFeatures)){sysFeatures=classes.rpc.declare({object:'luci',method:'getFeatures',expect:{'':{}}})().then(function(features){Session.setLocalData('features',features);sysFeatures=features;return features;});}
return Promise.resolve(sysFeatures);},probePreloadClasses:function(){if(preloadClasses==null)
preloadClasses=Session.getLocalData('preload');if(!Array.isArray(preloadClasses)){preloadClasses=this.resolveDefault(classes.rpc.declare({object:'file',method:'list',params:['path'],expect:{'entries':[]}})(this.fspath(this.resource('preload'))),[]).then(function(entries){var classes=[];for(var i=0;i<entries.length;i++){if(entries[i].type!='file')
continue;var m=entries[i].name.match(/(.+)\.js$/);if(m)
classes.push('preload.%s'.format(m[1]));}
Session.setLocalData('preload',classes);preloadClasses=classes;return classes;});}
return Promise.resolve(preloadClasses);},hasSystemFeature:function(){var ft=sysFeatures[arguments[0]];if(arguments.length==2)
return this.isObject(ft)?ft[arguments[1]]:null;return(ft!=null&&ft!=false);},notifySessionExpiry:function(){Poll.stop();classes.ui.showModal(_('Session expired'),[E('div',{class:'alert-message warning'},_('A new login is required since the authentication session expired.')),E('div',{class:'right'},E('div',{class:'btn primary',click:function(){var loc=window.location;window.location=loc.protocol+'//'+loc.host+loc.pathname+loc.search;}},_('Log in…')))]);LuCI.prototype.raise('SessionError','Login session is expired');},setupDOM:function(res){var domEv=res[0],uiClass=res[1],rpcClass=res[2],formClass=res[3],rpcBaseURL=res[4];rpcClass.setBaseURL(rpcBaseURL);rpcClass.addInterceptor(function(msg,req){if(!LuCI.prototype.isObject(msg)||!LuCI.prototype.isObject(msg.error)||msg.error.code!=-32002)
return;if(!LuCI.prototype.isObject(req)||(req.object=='session'&&req.method=='access'))
return;return rpcClass.declare({'object':'session','method':'access','params':['scope','object','function'],'expect':{access:true}})('uci','luci','read').catch(LuCI.prototype.notifySessionExpiry);});Request.addInterceptor(function(res){var isDenied=false;if(res.status==403&&res.headers.get('X-LuCI-Login-Required')=='yes')
isDenied=true;if(!isDenied)
return;LuCI.prototype.notifySessionExpiry();});document.addEventListener('poll-start',function(ev){uiClass.showIndicator('poll-status',_('Refreshing'),function(ev){Request.poll.active()?Request.poll.stop():Request.poll.start();});});document.addEventListener('poll-stop',function(ev){uiClass.showIndicator('poll-status',_('Paused'),null,'inactive');});return Promise.all([this.probeSystemFeatures(),this.probePreloadClasses()]).finally(LuCI.prototype.bind(function(){var tasks=[];if(Array.isArray(preloadClasses))
for(var i=0;i<preloadClasses.length;i++)
tasks.push(this.require(preloadClasses[i]));return Promise.all(tasks);},this)).finally(this.initDOM);},initDOM:function(){originalCBIInit();Poll.start();document.dispatchEvent(new CustomEvent('luci-loaded'));},env:env,fspath:function(){var path=env.documentroot;for(var i=0;i<arguments.length;i++)
path+='/'+arguments[i];var p=path.replace(/\/+$/,'').replace(/\/+/g,'/').split(/\//),res=[];for(var i=0;i<p.length;i++)
if(p[i]=='..')
res.pop();else if(p[i]!='.')
res.push(p[i]);return res.join('/');},path:function(prefix,parts){var url=[prefix||''];for(var i=0;i<parts.length;i++)
if(/^(?:[a-zA-Z0-9_.%,;-]+\/)*[a-zA-Z0-9_.%,;-]+$/.test(parts[i]))
url.push('/',parts[i]);if(url.length===1)
url.push('/');return url.join('');},url:function(){return this.path(env.scriptname,arguments);},resource:function(){return this.path(env.resource,arguments);},media:function(){return this.path(env.media,arguments);},location:function(){return this.path(env.scriptname,env.requestpath);},isObject:function(val){return(val!=null&&typeof(val)=='object');},sortedKeys:function(obj,key,sortmode){if(obj==null||typeof(obj)!='object')
return[];return Object.keys(obj).map(function(e){var v=(key!=null)?obj[e][key]:e;switch(sortmode){case'addr':v=(v!=null)?v.replace(/(?:^|[.:])([0-9a-fA-F]{1,4})/g,function(m0,m1){return('000'+m1.toLowerCase()).substr(-4)}):null;break;case'num':v=(v!=null)?+v:null;break;}
return[e,v];}).filter(function(e){return(e[1]!=null);}).sort(function(a,b){return naturalCompare(a[1],b[1]);}).map(function(e){return e[0];});},naturalCompare:naturalCompare,sortedArray:function(val){return this.toArray(val).sort(naturalCompare);},toArray:function(val){if(val==null)
return[];else if(Array.isArray(val))
return val;else if(typeof(val)=='object')
return[val];var s=String(val).trim();if(s=='')
return[];return s.split(/\s+/);},resolveDefault:function(value,defvalue){return Promise.resolve(value).catch(function(){return defvalue});},get:function(url,args,cb){return this.poll(null,url,args,cb,false);},post:function(url,args,cb){return this.poll(null,url,args,cb,true);},poll:function(interval,url,args,cb,post){if(interval!==null&&interval<=0)
interval=env.pollinterval;var data=post?{token:env.token}:null,method=post?'POST':'GET';if(!/^(?:\/|\S+:\/\/)/.test(url))
url=this.url(url);if(args!=null)
data=Object.assign(data||{},args);if(interval!==null)
return Request.poll.add(interval,url,{method:method,query:data},cb);else
return Request.request(url,{method:method,query:data}).then(function(res){var json=null;if(/^application\/json\b/.test(res.headers.get('Content-Type')))
try{json=res.json()}catch(e){}
cb(res.xhr,json,res.duration);});},hasViewPermission:function(){if(!this.isObject(env.nodespec)||!env.nodespec.satisfied)
return null;return!env.nodespec.readonly;},stop:function(entry){return Poll.remove(entry)},halt:function(){return Poll.stop()},run:function(){return Poll.start()},dom:DOM,view:View,Poll:Poll,Request:Request,Class:Class});var XHR=Class.extend({__name__:'LuCI.xhr',__init__:function(){if(window.console&&console.debug)
console.debug('Direct use XHR() is deprecated, please use L.Request instead');},_response:function(cb,res,json,duration){if(this.active)
cb(res,json,duration);delete this.active;},get:function(url,data,callback,timeout){this.active=true;LuCI.prototype.get(url,data,this._response.bind(this,callback),timeout);},post:function(url,data,callback,timeout){this.active=true;LuCI.prototype.post(url,data,this._response.bind(this,callback),timeout);},cancel:function(){delete this.active},busy:function(){return(this.active===true)},abort:function(){},send_form:function(){LuCI.prototype.error('InternalError','Not implemented')},});XHR.get=function(){return LuCI.prototype.get.apply(LuCI.prototype,arguments)};XHR.post=function(){return LuCI.prototype.post.apply(LuCI.prototype,arguments)};XHR.poll=function(){return LuCI.prototype.poll.apply(LuCI.prototype,arguments)};XHR.stop=Request.poll.remove.bind(Request.poll);XHR.halt=Request.poll.stop.bind(Request.poll);XHR.run=Request.poll.start.bind(Request.poll);XHR.running=Request.poll.active.bind(Request.poll);window.XHR=XHR;window.LuCI=LuCI;})(window,document);