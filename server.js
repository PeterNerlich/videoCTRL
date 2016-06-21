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
		scenes: [
			'001'
		]
	},
	gui: {
		children: [
			{
				type: 'group',
				title: 'stage nav',
				class: 'bordered labeled',
				children: [
					{
						type: 'group',
						title: 'overlay',
						class: 'horizontal',
						children: [
							{
								type: 'button',
								title: 'Blackout',
								signal: 'blackout'
							},
							{
								type: 'button',
								title: 'Whiteout',
								signal: 'whiteout'
							},
							{
								type: 'button',
								title: 'Blankout',
								signal: 'blankout'
							}
						]
					},
					{
						type: 'button',
						title: 'Reload Scene',
						signal: 'reload'
					}
				]
			},
			{
				type: 'group',
				title: 'scene nav',
				class: 'bordered labeled horizontal',
				children: [
					{
						type: 'button',
						title: '←',
						signal: 'scene-prev',
						class: null
					},
					{
						type: 'list',
						signal: 'scene-select',
						class: null,
						options: [
							'001',
							'002',
							'003'
						],
						current: 0
					},
					{
						type: 'button',
						title: '→',
						signal: 'scene-next',
						class: null
					}
				]
			}
		]
	},
	devices: []
};


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
				console.log('err: '+JSON.stringify(err));
				res.end('error piping: 404');
			} else {
				res.end(data);
			}
		});
	} else if ((file = /^\/scenes\/stage.css$/.exec(req.url)) !== null) {
		fs.readFile(path.join(__dirname,'scenes','stage.css'), function(err, data) {
			if (err) {
				console.log('err: '+JSON.stringify(err));
				res.end('error piping: 404');
			} else {
				res.end(data);
			}
		});
	} else {
		fs.readFile(path.join(__dirname,'scenes','landing.html'), function(err, data) {
			if (err) {
				console.log('err: '+JSON.stringify(err));
				res.end('error piping: 404');
			} else {
				res.end(data);
			}
		});
	}
});

server.listen(8000, function() {
	console.log('server listening on port 8000');
});

var primus = new Primus(server, {/* options */});

primus.on('connection', function (spark) {
	console.log('connected: ['+spark.id+']');
	devices.add(spark);

//	send({type:'overlay',data:overlay}, spark);
//	sendScene(spark);

	spark.on('data', function(msg) {
		var device = devices.get(spark.id);
		if (device.type === null) {
			if (msg == 'admin' || msg == 'display') {
				device.type = msg;
				if (device.type == 'admin') {
					console.log('sending gui settings: '+device.spark.write({
						type: 'gui settings',
						data: settings.gui
					}));
				}
			} else {
				spark.write('giveinfo');
				console.log('NULL spark ['+spark.id+']: '+JSON.stringify(msg));
			}
		} else {
			if (typeof msg === 'object') {
				switch (msg.type) {
					case 'info':
						device.info = msg.data;
						break;
					case 'gui cmd':
						break;
					default:
						console.log('ignoring msg '+JSON.stringify(msg));
				}
			} else {
				console.log('ignoring msg '+JSON.stringify(msg));
			}
		}


return;
/*		if (typeof msg === 'object') {
			if (msg.type == 'update') {
				if (msg.data) {
					scene = msg.data.scene;
					stage = msg.data.stage;
				}

				broadcastScene(data);
			} else if (msg.type == 'reload') {
				broadcastScene();
			} else if (msg.type == 'overlay') {
				if (msg.data == 'blackout' ||
					msg.data == 'whiteout' ||
					msg.data == 'blankout' ||
					msg.data == null
				) {
					overlay = msg.data;
					broadcast(msg);
				}
			}
		} else {
			console.log('ignoring msg '+JSON.stringify(msg));
		}*/
	});
});

primus.on('disconnection', function (spark) {
	console.log('disconnected: ['+spark.id+']');
	devices.remove(spark.id);
});


function broadcastScene(data) {
	var data = data || {scene: scene, stage: stage};
	console.log('broadcasting scene ['+data.scene+']  ('+devices.list.length+')');
	devices.list.forEach(function(e,i) {
		sendScene(e, data);
	});
	return true;
}

function sendScene(spark, data) {
	var data = data || {scene: scene, stage: stage};
	fs.readFile(path.join(__dirname,'scenes',data.scene,'scene.html'), 'utf-8', function(err, file) {
		if (err) {
			console.log('err: '+JSON.stringify(err));
		} else {
			console.log(JSON.stringify(file));
			spark.write({type: 'scene', data: {scene: file, stage: data.stage}});
		}
	});
}

function send(msg, spark) {
	if (typeof spark === 'undefined') {
		return false;
	}
	spark.write(msg);
}