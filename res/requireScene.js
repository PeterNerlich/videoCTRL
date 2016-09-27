
function hasOwnProperty(obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

function Scene(id, parent) {
	this.id = id;
	this.exports = {};
	this.loaded = false;
	this.promise = null;

	return this;
}

function SceneLoader() {
	var _cache = {};

	function load(scenes, preload) {
		if (typeof scenes !== 'object' && typeof scenes !== 'string') {
			return new Error('arguments');
		}
		var scenes = scenes || [];
		var preload = (typeof preload !== 'undefined') ? (preload ? true : false) : true;

		var promise = null;

		if (typeof scenes === 'string') {
			promise = new Promise(function(resolve, reject) {
				if (hasOwnProperty(_cache, scenes)) {
					resolve(_cache[scenes].exports);
				} else {
					_cache[scenes] = new Scene(scenes);
					var xhr = new XMLHttpRequest();
					xhr.open('get', '/scenes/'+scenes+'/scene.js');
					xhr.onload = function() {
						if (xhr.status == 200 && xhr.responseText != 'error piping: 404') {
							try {
								_cache[scenes].exports = (new Function('var scene = {exports: {}};\nvar exports = scene.exports;\nvar g = gui.scene(\''+scenes+'\');\ng.rebuild = function(){return gui.scenerebuild(\''+scenes+'\')};\n'+xhr.responseText+'\nreturn scene.exports;')).call({});
								if (preload && typeof _cache[scenes].exports.preload === 'function') {
									var l = _cache[scenes].loaded;
									_cache[scenes].exports.preload(function() {l = true;});
								}
								_cache[scenes].promise = promise;
								resolve(_cache[scenes].exports);
							} catch(err) {
								unload(scenes);
								reject(new Error('couldn\'t execute scene', xhr.responseText));
							}
						} else {
							unload(scenes);
							reject((xhr.responseText == 'error piping: 404') ? new Error('/scenes/'+scenes+'/scene.js') : new Error(xhr.responseText));
						}
					};
					xhr.onerror = function() {
						resolve(new Error("Network Error"));
					};
					xhr.send();
				}
			});
		} else {
			promise = new Promise(function(resolve, reject) {
				var s = {};
				var c = scenes.length;
				scenes.forEach(function(e, i) {
					new Promise(function(res, rej) {
						//if (typeof _cache[e] !== 'undefined') {
						if (hasOwnProperty(_cache, e)) {
							s[e] = _cache[e].exports;
							res(s[e]);
							if (--c <= 0) {
								resolve(s);
							}
						} else {
							_cache[e] = new Scene(e);
							var xhr = new XMLHttpRequest();
							xhr.open('get', '/scenes/'+e+'/scene.js');
							xhr.onload = function() {
								if (xhr.status == 200 && xhr.responseText != 'error piping: 404') {
									try {
										_cache[e].exports = (new Function('var scene = {exports: {}};\nvar exports = scene.exports;\nvar g = gui.scene(\''+e+'\');\ng.rebuild = function(){return gui.scenerebuild(\''+e+'\')};\n'+xhr.responseText+'\nreturn scene.exports;')).call({});
										/*if (preload) {
											var l = _cache[e].loaded;
											_cache[e].exports.preload(function() {l = true;});
										}*/
										s[e] = _cache[e].exports;
										_cache[e].promise = promise;
										res(s[e]);
										if (--c <= 0) {
											resolve(s);
										}
									} catch(err) {
										unload(e);
										s[e] = new Error('couldn\'t execute scene', xhr.responseText);
										rej(s[e]);
										if (--c <= 0) {
											reject(s);
										}
									}
								} else {
									unload(e);
									s[e] = (xhr.responseText == 'error piping: 404') ? new Error('/scenes/'+e+'/scene.js') : new Error(xhr.responseText);
									rej(s[e]);
									if (--c <= 0) {
										reject(s);
									}
								}
							};
							xhr.onerror = function() {
								s[e] = new Error("Network Error");
								rej(s[e]);
								if (--c <= 0) {
									reject(s);
								}
							};
							xhr.send();
						}
					});
				});
			});
		}
		return promise;
	};

	function unload(scenes) {
		if (typeof scenes !== 'object' && typeof scenes !== 'string' && scenes !== true) {
			return new Error('arguments');
		}
		if (scenes === true) {
			scenes = Object.keys(_cache);
		}

		if (typeof scenes === 'string') {
			delete _cache[i-1];
		} else {
			for (var i = scenes.length; i > 0; i--) {
				delete _cache[i-1];
			}
		}

		return true;
	};

	function reload(preload) {
		if (typeof scenes !== 'object' && typeof scenes !== 'string') {
			return new Error('arguments');
		}

		unload(scenes);
		return load(scenes, preload);
	}

	function get(scenes, autoload, preload) {
		//console.log(scenes);
		if ((typeof scenes !== 'object' || scenes === null) && typeof scenes !== 'string') {
			return new Error('arguments');
		}
		var autoload = autoload || true;

		var s = {};

		if (typeof scenes === 'string') {
			s = (typeof _cache[scenes] !== 'undefined') ? _cache[scenes].promise : (autoload ? load(scenes, preload) : new Promise(function(resolve, reject){reject('not in cache');}));
		} else {
			for (var i = 0; i < scenes.length; i++) {
				s[scenes[i]] = (typeof _cache[scenes[i]] !== 'undefined') ? _cache[scenes[i]].promise : (autoload ? load(scenes[i], preload) : new Promise(function(resolve, reject){reject('not in cache');}));
			}
		}

		return s;
	};

	function getGui(scene) {
		return (typeof _cache[scene] === 'object' &&
			typeof _cache[scene].exports === 'object' &&
			typeof _cache[scene].exports.gui === 'object') ?
			_cache[scene].exports.gui :
			[];
	};

	this.load = load;
	this.unload = unload;
	this.reload = reload;
	this.get = get;
	this.getGui = getGui;

	return this;
}

/*
var requireScene = (function () {
	var cache = {};
	function loadScript(url) {
		var xhr = new XMLHttpRequest(),
			fnBody;
		xhr.open('get', url, false);
		xhr.send();
		if (xhr.status === 200*/ /* && xhr.getResponseHeader('Content-Type') === 'application/x-javascript'*/ /*&& xhr.responseText != 'error piping: 404') {
			fnBody = 'var module = {exports: {}};\nvar exports = module.exports;\n' + xhr.responseText + '\nreturn module.exports;';
			cache[url] = (new Function(fnBody)).call({});
		} else {
			console.error(new Error());//xhr);
			return;
		}
		return cache[url];
	}
	function resolve(module) {
		if (module.split('/').length == 1) {
			module = '../res/'+module;
		}
		var a = document.createElement('a');
		a.href = module;
		console.log('resolved ['+module+'] to ['+a.href+']');
		return a.href;
	}
	function requireScene(module) {
		var url = resolve(module);
		if (!Object.prototype.hasOwnProperty.call(cache, url)) {
			loadScript(url);
		}
		return cache[url] || false;
	}
	requireScene.cache = cache;
	requireScene.resolve = resolve;
	return requireScene;
}());
*/