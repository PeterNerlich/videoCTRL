var http = require('http');
var Primus = require('primus');
var fs = require('fs');
var path = require('path');


var stage = {
	width: 400,
	height: 300
};
var scene = '001';
var overlay = null;

var devices = function() {
	var list = [];
	var add = function(s) {
		return list.push(s);
	};
	var get = function(id) {}
	var remove = function(id) {
		for (var i = 0; i < list.length; i++) {
			if (id == list[i].id) {
				list.splice(i,1);
				return true;
			}
		}
	};

	return {
		list: list,
		add: add,
		get: get,
		remove: remove
	};
};
devices = new devices();

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

	send({type:'overlay',data:overlay}, spark);
	sendScene(spark);

	spark.on('data', function(msg) {
		if (typeof msg === 'object') {
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
		}
	});
});

primus.on('disconnection', function (spark) {
	console.log('disconnected: ['+spark.id+']');
	devices.remove(spark.id);
});


function broadcast(data) {
	console.log('broadcasting '+JSON.stringify(data)+'  ('+devices.list.length+')');
	for (var i = 0; i < devices.list.length; i++) {
		devices.list[i].write(data);
	}
}

function broadcastScene(data) {
	var data = data || {scene: scene, stage: stage};
	console.log('broadcasting scene ['+data.scene+']  ('+devices.list.length+')');
	for (var i = 0; i < devices.list.length; i++) {
		sendScene(devices.list[i], data);
	}
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