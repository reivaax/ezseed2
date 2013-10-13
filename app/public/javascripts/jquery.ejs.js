if (!Object.create) {
	Object.create = function(obj) {
		function F() {}
		F.prototype = obj;
		
		return new F();
	}
}

$(function($){
	var ejs = function(){function require(p){if("fs"==p)return{};var path=require.resolve(p),mod=require.modules[path];if(!mod)throw new Error('failed to require "'+p+'"');return mod.exports||(mod.exports={},mod.call(mod.exports,mod,mod.exports,require.relative(path))),mod.exports}return require.modules={},require.resolve=function(path){var orig=path,reg=path+".js",index=path+"/index.js";return require.modules[reg]&&reg||require.modules[index]&&index||orig},require.register=function(path,fn){require.modules[path]=fn},require.relative=function(parent){return function(p){if("."!=p.substr(0,1))return require(p);var path=parent.split("/"),segs=p.split("/");path.pop();for(var i=0;i<segs.length;i++){var seg=segs[i];".."==seg?path.pop():"."!=seg&&path.push(seg)}return require(path.join("/"))}},require.register("ejs.js",function(module,exports,require){var utils=require("./utils"),fs=require("fs");exports.version="0.7.2";var filters=exports.filters=require("./filters"),cache={};exports.clearCache=function(){cache={}};function filtered(js){return js.substr(1).split("|").reduce(function(js,filter){var parts=filter.split(":"),name=parts.shift(),args=parts.shift()||"";return args&&(args=", "+args),"filters."+name+"("+js+args+")"})}function rethrow(err,str,filename,lineno){var lines=str.split("\n"),start=Math.max(lineno-3,0),end=Math.min(lines.length,lineno+3),context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?" >> ":"    ")+curr+"| "+line}).join("\n");throw err.path=filename,err.message=(filename||"ejs")+":"+lineno+"\n"+context+"\n\n"+err.message,err}var parse=exports.parse=function(str,options){var options=options||{},open=options.open||exports.open||"<%",close=options.close||exports.close||"%>",buf=["var buf = [];","\nwith (locals) {","\n  buf.push('"],lineno=1,consumeEOL=!1;for(var i=0,len=str.length;i<len;++i)if(str.slice(i,open.length+i)==open){i+=open.length;var prefix,postfix,line="__stack.lineno="+lineno;switch(str.substr(i,1)){case"=":prefix="', escape(("+line+", ",postfix=")), '",++i;break;case"-":prefix="', ("+line+", ",postfix="), '",++i;break;default:prefix="');"+line+";",postfix="; buf.push('"}var end=str.indexOf(close,i),js=str.substring(i,end),start=i,n=0;"-"==js[js.length-1]&&(js=js.substring(0,js.length-2),consumeEOL=!0);while(~(n=js.indexOf("\n",n)))n++,lineno++;js.substr(0,1)==":"&&(js=filtered(js)),buf.push(prefix,js,postfix),i+=end-start+close.length-1}else str.substr(i,1)=="\\"?buf.push("\\\\"):str.substr(i,1)=="'"?buf.push("\\'"):str.substr(i,1)=="\r"?buf.push(" "):str.substr(i,1)=="\n"?consumeEOL?consumeEOL=!1:(buf.push("\\n"),lineno++):buf.push(str.substr(i,1));return buf.push("');\n}\nreturn buf.join('');"),buf.join("")},compile=exports.compile=function(str,options){options=options||{};var input=JSON.stringify(str),filename=options.filename?JSON.stringify(options.filename):"undefined";str=["var __stack = { lineno: 1, input: "+input+", filename: "+filename+" };",rethrow.toString(),"try {",exports.parse(str,options),"} catch (err) {","  rethrow(err, __stack.input, __stack.filename, __stack.lineno);","}"].join("\n"),options.debug&&console.log(str);var fn=new Function("locals, filters, escape",str);return function(locals){return fn.call(this,locals,filters,utils.escape)}};exports.render=function(str,options){var fn,options=options||{};if(options.cache){if(!options.filename)throw new Error('"cache" option requires "filename".');fn=cache[options.filename]||(cache[options.filename]=compile(str,options))}else fn=compile(str,options);return options.__proto__=options.locals,fn.call(options.scope,options)},exports.renderFile=function(path,options,fn){var key=path+":string";"function"==typeof options&&(fn=options,options={}),options.filename=path;try{var str=options.cache?cache[key]||(cache[key]=fs.readFileSync(path,"utf8")):fs.readFileSync(path,"utf8");fn(null,exports.render(str,options))}catch(err){fn(err)}},exports.__express=exports.renderFile,require.extensions?require.extensions[".ejs"]=function(module,filename){source=require("fs").readFileSync(filename,"utf-8"),module._compile(compile(source,{}),filename)}:require.registerExtension&&require.registerExtension(".ejs",function(src){return compile(src,{})})}),require.register("filters.js",function(module,exports,require){exports.first=function(obj){return obj[0]},exports.last=function(obj){return obj[obj.length-1]},exports.capitalize=function(str){return str=String(str),str[0].toUpperCase()+str.substr(1,str.length)},exports.downcase=function(str){return String(str).toLowerCase()},exports.upcase=function(str){return String(str).toUpperCase()},exports.sort=function(obj){return Object.create(obj).sort()},exports.sort_by=function(obj,prop){return Object.create(obj).sort(function(a,b){return a=a[prop],b=b[prop],a>b?1:a<b?-1:0})},exports.size=exports.length=function(obj){return obj.length},exports.plus=function(a,b){return Number(a)+Number(b)},exports.minus=function(a,b){return Number(a)-Number(b)},exports.times=function(a,b){return Number(a)*Number(b)},exports.divided_by=function(a,b){return Number(a)/Number(b)},exports.join=function(obj,str){return obj.join(str||", ")},exports.truncate=function(str,len){return str=String(str),str.substr(0,len)},exports.truncate_words=function(str,n){var str=String(str),words=str.split(/ +/);return words.slice(0,n).join(" ")},exports.replace=function(str,pattern,substitution){return String(str).replace(pattern,substitution||"")},exports.prepend=function(obj,val){return Array.isArray(obj)?[val].concat(obj):val+obj},exports.append=function(obj,val){return Array.isArray(obj)?obj.concat(val):obj+val},exports.map=function(arr,prop){return arr.map(function(obj){return obj[prop]})},exports.reverse=function(obj){return Array.isArray(obj)?obj.reverse():String(obj).split("").reverse().join("")},exports.get=function(obj,prop){return obj[prop]},exports.json=function(obj){return JSON.stringify(obj)}}),require.register("utils.js",function(module,exports,require){exports.escape=function(html){return String(html).replace(/&(?!\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}}),require("ejs")}();;
	
	$.Ejs = function(options) {
		var view = Object.create(EjsView);
		
		view.options = $.extend({}, view.defaults, options);
		
		return view;
	}
	
	var EjsView = {
		defaults: {
			path: '/views/',
			extension: '.ejs',
			open: '<%',
			close: '%>',
			async: true,
			cache: true,
			memory: true
		},
		
		options: {},
		
		cache: {},
		
		load: function(template, options, callback) {
		  var View = this;

		  var path = options.path + template + options.extension;

		  if (options.memory && View.cache[path]) {
			  template = View.cache[path];

			  callback(null, template);
		  } else {
			  $.ajax({
					async: options.async,
					cache: options.cache,

					url: path,
					type: 'GET',

					success: function(templ) {
						template = templ;

						if (options.memory) { View.cache[path] = template; }

						callback(null, template);
					},

					error: function(error) {
						callback(error);
					}
				})
		  }
		},

		compile: function(template, opts, callback) {
			var View = this;

			if (typeof(opts) == 'function') {
				callback = opts;
				opts = {};
			}

			if (!opts) { opts = {}; }

			var compiled;
			var options = $.extend({}, View.options, opts);

			View.load(template, options, function(error, template) {
				if (error) { return callback(error); }

				ejs.open = options.open;
				ejs.close = options.close;

				try {
		      compiled = ejs.compile(template, { View: View });
	      } catch (error) {
		      return (callback ? callback(error) : null);
	      }

	      callback && callback(null, compiled);
			});

			return compiled;
		},

		render: function(template, data, opts, callback) {
			var View = this;

      if (typeof(data) == 'function') {
	      callback = data;
	      data = {};
      }

			if (typeof(opts) == 'function') {
				callback = opts;
				opts = {};
			}

			if (!data) { data = {}; }
			if (!opts) { opts = {}; }

			var html;
			var options = $.extend({}, View.options, opts);

			View.load(template, options, function(error, template) {
				if (error) { return callback(error); }

				ejs.open = options.open;
				ejs.close = options.close;

				data.View = View;

				try {
		      html = ejs.render(template, data);
	      } catch (error) {
		      return (callback ? callback(error) : null);
	      }

	      callback && callback(null, html);
			});

			return html;
		},

		partial: function(template, data, opts) {
			var View = this;

			if (!opts) { opts = {}; }

			opts.async = false;

			return View.render(template, data, opts);
		},

		update: function(el, template, data, opts, callback) {
			return this.action('update', el, template, data, opts, callback);
		},

		before: function(el, template, data, opts, callback) {
			return this.action('before', el, template, data, opts, callback);
		},

		after: function(el, template, data, opts, callback) {
			return this.action('after', el, template, data, opts, callback);
		},

		prepend: function(el, template, data, opts, callback) {
			return this.action('prepend', el, template, data, opts, callback);
		},

		append: function(el, template, data, opts, callback) {
			return this.action('append', el, template, data, opts, callback);
		},

		replace: function(el, template, data, opts, callback) {
			return this.action('replace', el, template, data, opts, callback);
		},

		action: function(type, el, template, data, opts, callback) {
			var View = this;

			if (typeof(opts) == 'function') {
				callback = opts;
				opts = {};
			}

			if (!opts) { opts = {}; }

			var html;

			return View.render(template, data, opts, function(error, content) {
				if (!error) {
					html = content;

	        var methods = {
		        update: 'html',
		        before: 'before',
		        after: 'after',
		        prepend: 'prepend',
		        append: 'append',
		        replace: 'replaceWith'
	        };

	        $(el)[methods[type]](html);
				}

				callback && callback(error, html);
			});

			return html;
		}
	}
}(jQuery));