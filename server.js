var http = require('http');
var Primus = require('primus');
var fs = require('fs');
var path = require('path');

var settings = {
	stage: {
		width: 400,
		height: 300,
		overlay: null,
		scene: 0,
		scenes: [],
		bg: 0,
		bgs: []
	},
	gui: require('./admin/defaultgui.js'),
	devices: []
};
//settings.gui = new require('./admin/defaultgui.js')(settings);

var devices = {
	add: function(spark) {
		settings.devices.push({
			spark: spark,
			type: null,
			info: {
				width: null,
				height: null
			}
		});
		return spark.id;
	},
	get: function(id) {
		for (var i = 0; i < settings.devices.length; i++) {
			if (id == settings.devices[i].spark.id) {
				return settings.devices[i];
			}
		}
		return false;
	},
	remove: function(id) {
		for (var i = 0; i < settings.devices.length; i++) {
			if (id == settings.devices[i].spark.id) {
				settings.devices.splice(i,1);
				return true;
			}
		}
		return false;
	},
	broadcast: function(msg, type) {
		for (var i = 0; i < settings.devices.length; i++) {
			if (!type || type == settings.devices[i].type) {
				settings.devices[i].spark.write(msg);
			}
		}
		return i;
	}
};


var server = http.createServer(function(req, res) {
	if ((file = /^\/admin(\/|\/.+)?$/.exec(req.url)) !== null) {
		file = file[1] || '/';
		if (file == '/') {
			file = 'index.html';
		}
		fs.readFile(path.join(__dirname,'admin',file), function(err, data) {
			if (err) {
				console.error('ERR: '+JSON.stringify(err));
				res.end('error piping: 404');
			} else {
				res.end(data);
			}
		});
	} else if ((file = /^\/bgs(\/|\/.+)?$/.exec(req.url)) !== null) {
		file = file[1] || '/';
		fs.readFile(path.join(__dirname,'bgs',file), function(err, data) {
			if (err) {
				console.error('ERR: '+JSON.stringify(err));
				res.end('error piping: 404');
			} else {
				res.end(data);
			}
		});
	} else if ((file = /^\/scenes\/stage.css$/.exec(req.url)) !== null) {
		fs.readFile(path.join(__dirname,'scenes','stage.css'), function(err, data) {
			if (err) {
				console.error('ERR: '+JSON.stringify(err));
				res.end('error piping: 404');
			} else {
				res.end(data);
			}
		});
	} else {
		fs.readFile(path.join(__dirname,'scenes','landing.html'), function(err, data) {
			if (err) {
				console.error('ERR: '+JSON.stringify(err));
				res.end('error piping: 404');
			} else {
				res.end(data);
			}
		});
	}
});

scenescan(function(err, scenes){
	if (err) {
		return console.error('ERR: scene scan '+err);
	}
	server.listen(8000, function() {
		console.log('server listening on port 8000');
	});
	bgscan();
});

var primus = new Primus(server, {/* options */});

primus.on('connection', function (spark) {
	console.log('connected: ['+spark.id+']');
	devices.add(spark);

	spark.on('data', function(msg) {
		var device = devices.get(spark.id);
		if (device.type === null) {
			if (msg == 'admin' || msg == 'display') {
				device.type = msg;
				if (device.type == 'admin') {
					device.spark.write({
						type: 'gui settings',
						data: resolvegui(new settings.gui(settings.stage))
					});
				}
				getScene(function(err, file){
					device.spark.write({
						type: 'stage cmd',
						data: {
							scene: file,
							width: settings.stage.width,
							height: settings.stage.height,
							overlay: settings.stage.overlay
						}
					});
				});
			} else {
				spark.write('giveinfo');
				console.warn('NULL spark ['+spark.id+']: '+JSON.stringify(msg));
			}
		} else {
			if (typeof msg === 'object') {
				switch (msg.type) {
					case 'info':
						device.info = msg.data;
						break;
					case 'gui cmd':
						switch (msg.data.signal) {
							case 'gui reload':
								settings.gui = require('./admin/defaultgui.js');
								device.spark.write({
									type: 'gui settings',
									data: resolvegui(new settings.gui(settings.stage))
								});
								break;
							case 'scene reload':
								getScene(function(err, file){
									devices.broadcast({
										type: 'stage cmd',
										data: {
											scene: file
										}
									});
								});
								break;
							case 'scene scan':
								scenescan(function(err, scenes) {
									if (err) {
										console.error('ERR: scenescan '+err);
									} else {
										devices.broadcast({
											type: 'gui settings',
											data: resolvegui(new settings.gui(settings.stage))
										});
									}
								});
								break;
							case 'scene select':
								var scene = settings.stage.scenes.indexOf(msg.data.value);
								if (scene >= 0) {
									getScene(function(err, file){
										devices.broadcast({
											type: 'stage cmd',
											data: {
												scene: file
											}
										});
									}, scene);
									settings.stage.scene = scene;
									devices.broadcast({
										type: 'gui settings',
										data: resolvegui(new settings.gui(settings.stage))
									});
								}
								break;
							case 'scene prev':
								var scene = (settings.stage.scene > 0) ?
									settings.stage.scene - 1 :
									settings.stage.scenes.length - 1;
								getScene(function(err, file){
									devices.broadcast({
										type: 'stage cmd',
										data: {
											scene: file
										}
									});
								}, scene);
								settings.stage.scene = scene;
								devices.broadcast({
									type: 'gui settings',
									data: resolvegui(new settings.gui(settings.stage))
								});
								break;
							case 'scene next':
								var scene = (settings.stage.scene < settings.stage.scenes.length - 1) ?
									settings.stage.scene + 1 :
									0;
								getScene(function(err, file){
									devices.broadcast({
										type: 'stage cmd',
										data: {
											scene: file
										}
									});
								}, scene);
								settings.stage.scene = scene;
								devices.broadcast({
									type: 'gui settings',
									data: resolvegui(new settings.gui(settings.stage))
								});
								break;
							case 'clear':
								devices.broadcast({
									type: 'stage cmd',
									data: {
										overlay: null
									}
								});
								break;
							case 'blackout':
								devices.broadcast({
									type: 'stage cmd',
									data: {
										overlay: 'blackout'
									}
								});
								break;
							case 'whiteout':
								devices.broadcast({
									type: 'stage cmd',
									data: {
										overlay: 'whiteout'
									}
								});
								break;
							case 'blankout':
								devices.broadcast({
									type: 'stage cmd',
									data: {
										overlay: 'blankout'
									}
								});
								break;
							case 'stage bg scan':
								bgscan(function(err, scenes) {
									if (err) {
										console.error('ERR: bgscan '+err);
									} else {
										devices.broadcast({
											type: 'gui settings',
											data: resolvegui(new settings.gui(settings.stage))
										});
									}
								});
								break;
							case 'stage bg select':
								var bg = settings.stage.bgs.indexOf(msg.data.value);
								if (bg >= 0) {
									/*getBg(function(err, file){
										if (err) {
											return console.error('ERR: getBg '+err);
										}
										devices.broadcast({
											type: 'stage cmd',
											data: {
												bg: file
											}
										});
									}, bg);*/
									settings.stage.bg = bg;
									devices.broadcast({
										type: 'stage cmd',
										data: {
											bg: 'url(../bgs/'+settings.stage.bgs[bg]+')'
										}
									});
									devices.broadcast({
										type: 'gui settings',
										data: resolvegui(new settings.gui(settings.stage))
									});
								}
								break;
							default:
								console.warn('ignoring signal '+JSON.stringify(msg.data));
								device.spark.write({
									type: 'gui settings',
									data: resolvegui(new settings.gui(settings.stage))
								});
								return;
						}
						break;
					default:
						console.warn('ignoring msg '+JSON.stringify(msg));
				}
			} else {
				console.warn('ignoring msg '+JSON.stringify(msg));
			}
		}
	});
});

primus.on('disconnection', function(spark) {
	console.log('disconnected: ['+spark.id+']');
	devices.remove(spark.id);
});


function resolvegui(tree) {
	if (typeof tree !== 'object') {
		return false;
	}

	for (var key in tree) {
		if (typeof tree[key] === 'function') {
			tree[key] = tree[key]();
		} else if (typeof tree[key] === 'object') {
			tree[key] = resolvegui(tree[key]);
		}
	}
	return tree;
}

function scenescan(callback, writetosettings) {
	var callback = callback || function(){};
	var writetosettings = writetosettings || true;

	var scene = settings.stage.scenes[settings.stage.scene];
	var scenes = [];
	fs.readdir(path.join(__dirname,'scenes'), function(err, list) {
		if (err) {
			callback(err);
			return false;
		}
		var pending = list.length;
		if (!pending) {
			if (writetosettings) {
				settings.stage.scenes = scenes;
				settings.stage.scene = (settings.stage.scenes.indexOf(scene) >= 0) ? settings.stage.scenes.indexOf(scene) : 0;
			}
			callback(null, scenes);
		}
		list.forEach(function(dir) {
			fs.stat(path.resolve(path.join(__dirname,'scenes'), dir), function(err, stat) {
				if (err) {
					callback(err);
					return false;
				} else if (stat.isDirectory()) {
					fs.stat(path.resolve(path.join(__dirname,'scenes', dir), 'info.json'), function(err, stat) {
						if (err) {
							callback(err);
							return false;
						} else if (stat.isFile()) {
							scenes.push(dir);
							if (!--pending) {
								if (writetosettings) {
									settings.stage.scenes = scenes;
									settings.stage.scene = (settings.stage.scenes.indexOf(scene) >= 0) ? settings.stage.scenes.indexOf(scene) : 0;
								}
								callback(null, scenes);
							}
						} else {
							if (!--pending) {
								if (writetosettings) {
									settings.stage.scenes = scenes;
									settings.stage.scene = (settings.stage.scenes.indexOf(scene) >= 0) ? settings.stage.scenes.indexOf(scene) : 0;
								}
								callback(null, scenes);
							}
						}
					});
				} else {
					if (!--pending) {
						if (writetosettings) {
							settings.stage.scenes = scenes;
							settings.stage.scene = (settings.stage.scenes.indexOf(scene) >= 0) ? settings.stage.scenes.indexOf(scene) : 0;
						}
						callback(null, scenes);
					}
				}
			});
		});
	});
}

function bgscan(callback, writetosettings) {
	var callback = callback || function(){};
	var writetosettings = writetosettings || true;

	var bg = settings.stage.bgs[settings.stage.bg];
	var bgs = [];
	fs.readdir(path.join(__dirname,'bgs'), function(err, list) {
		if (err) {
			callback(err);
			return false;
		}
		var pending = list.length;
		if (!pending) {
			if (writetosettings) {
				settings.stage.bgs = bgs;
				settings.stage.bg = (settings.stage.bgs.indexOf(bg) >= 0) ? settings.stage.bgs.indexOf(bg) : 0;
			}
			callback(null, bgs);
		}
		list.forEach(function(file) {
			fs.stat(path.resolve(path.join(__dirname,'bgs'), file), function(err, stat) {
				if (err) {
					callback(err);
					return false;
				} else if (stat.isFile()) {
					bgs.push(file);
					if (!--pending) {
						if (writetosettings) {
							settings.stage.bgs = bgs;
							settings.stage.bg = (settings.stage.bgs.indexOf(bg) >= 0) ? settings.stage.bgs.indexOf(bg) : 0;
						}
						callback(null, bgs);
					}
				} else {
					if (!--pending) {
						if (writetosettings) {
							settings.stage.bgs = bgs;
							settings.stage.bg = (settings.stage.bgs.indexOf(bg) >= 0) ? settings.stage.bgs.indexOf(bg) : 0;
						}
						callback(null, bgs);
					}
				}
			});
		});
	});
}

function getScene(callback, scene) {
	switch (typeof scene) {
		case 'string':
			break;
		case 'number':
			scene = settings.stage.scenes[scene];
			break;
		default:
			scene = settings.stage.scenes[settings.stage.scene];
	}
	fs.stat(path.resolve(path.join(__dirname,'scenes'),scene), function(err, stat) {
		if (err) {
			callback(err);
			return false;
		} else if (stat.isDirectory()) {
			fs.stat(path.resolve(path.join(__dirname,'scenes', scene), 'scene.html'), function(err, stat) {
				if (err) {
					callback(err);
					return false;
				} else if (stat.isFile()) {
					fs.readFile(path.resolve(__dirname,'scenes',scene,'scene.html'), 'utf-8', function(err, file) {
						if (err) {
							console.error('ERR: '+JSON.stringify(err));
							callback(err);
						} else {
							callback(null,file);
						}
					});
				} else {
					callback(false);
					return false;
				}
			});
		} else {
			callback(false);
			return false;
		}
	});
}

function getBg(callback, bg) {
	switch (typeof bg) {
		case 'string':
			break;
		case 'number':
			bg = settings.stage.bgs[bg];
			break;
		default:
			bg = settings.stage.bgs[settings.stage.bg];
	}
	fs.stat(path.resolve(path.join(__dirname,'bgs'),bg), function(err, stat) {
		if (err) {
			callback(err);
			return false;
		} else if (stat.isFile()) {
			fs.readFile(path.resolve(__dirname,'bgs',bg), 'utf-8', function(err, file) {
				if (err) {
					console.error('ERR: '+JSON.stringify(err));
					callback(err);
				} else {
					callback(null, new Buffer(file).toString('base64'));
				}
			});
		} else {
			callback(false);
			return false;
		}
	});
}

function send(msg, spark) {
	if (typeof spark === 'undefined') {
		return false;
	}
	spark.write(msg);
}


function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0; i < obj.length; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}
	throw new Error("Unable to copy obj! Its type isn't supported.");
}
