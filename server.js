var http = require('http');
var url = require('url');
var Primus = require('primus');
var fs = require('fs');
var path = require('path');

var devices = [];
var db = {
	stage: [
		{
			id: 'st0001',
			scene: 'sc0001'
		}
	],
	getStage: function(id) {
		for (var i = 0; i < db.stage.length; i++) {
			if (db.stage[i].id == id)
				return db.stage[i];
		}
	},
	scene: [
		{
			id: 'sc0001',
			channel: [
				{
					id: 'o0001',
					fader: 1.0
				}
			]
		}
	],
	getScene: function(id) {
		for (var i = 0; i < db.scene.length; i++) {
			if (db.scene[i].id == id)
				return db.scene[i];
		}
	},
	channel: [
		{
			id: 'o0001',
			object: [
				'o0002',
				'o0005'
			]
		}
	],
	getChannel: function(id) {
		for (var i = 0; i < db.channel.length; i++) {
			if (db.channel[i].id == id)
				return db.channel[i];
		}
	},
	object: [
		{
			id: 'o0002',
			object: [
				'o0003',
				'o0004'
			],
			src: false
		},
		{
			id: 'o0003',
			object: false,
			src: 's0001'
		},
		{
			id: 'o0004',
			object: false,
			src: 's0002'
		},
		{
			id: 'o0005',
			object: [
				'o0006'
			],
			src: false
		},
		{
			id: 'o0006',
			object: false,
			src: 's0003'
		}
	],
	getObject: function(id) {
		for (var i = 0; i < db.object.length; i++) {
			if (db.object[i].id == id)
				return db.object[i];
		}
	},
	src: [
		{
			id: 's0001',
			type: 'img',
			url: 'https://www.google.de/images/srpr/logo11w.png'
		},
		{
			id: 's0002',
			type: 'paragraph',
			content: 'TEST'
		},
		{
			id: 's0003',
			type: 'h3',
			content: 'test'
		}
	],
	getSrc: function(id) {
		for (var i = 0; i < db.src.length; i++) {
			if (db.src[i].id == id)
				return db.src[i];
		}
	},
	schema: {
		Transform: function() {
			this.translate = {
				x: 0,
				y: 0,
				z: 0
			};
			this.scale = {
				x: 0,
				y: 0,
				z: 0
			};
			this.rotate = {
				x: 0,
				y: 0,
				z: 0
			};
			this.perspective = null;

			return this;
		}
	}
};
db.stage.default = 'st0001';


var server = http.createServer(function (req, res) {
	console.log('→ '+req.url);
	if (req.url.match(/^\/admin/)) {
		if (req.url.match(/^\/admin\/main.css/)) {
			var stream = fs.createReadStream(path.join(__dirname, 'css/admin.css'));
			stream.on('error', function (error) {console.log(error); res.writeHead(500, {"Content-Type": "text/html"}); res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body><p style="color:#555;">ERROR 500: INTERNAL SERVER ERROR</p></body></html>');});
			stream.on('readable', function () {stream.pipe(res);});
		} else if (req.url.match(/^\/admin\/main.js/)) {
			var stream = fs.createReadStream(path.join(__dirname, 'js/admin.js'));
			stream.on('error', function (error) {console.log(error); res.writeHead(500, {"Content-Type": "text/html"}); res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body><p style="color:#555;">ERROR 500: INTERNAL SERVER ERROR</p></body></html>');});
			stream.on('readable', function () {stream.pipe(res);});
		} else {
			console.log(' - requested admin');
			var stream = fs.createReadStream(path.join(__dirname, 'html/admin.html'));
			stream.on('error', function (error) {console.log(error); res.writeHead(500, {"Content-Type": "text/html"}); res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body><p style="color:#555;">ERROR 500: INTERNAL SERVER ERROR</p></body></html>');});
			stream.on('readable', function () {stream.pipe(res);});
		}
	} else if (req.url.match(/^\/stage/)) {
		if (req.url.match(/^\/stage\/main.css/)) {
			var stream = fs.createReadStream(path.join(__dirname, 'css/stage.css'));
			stream.on('error', function (error) {console.log(error); res.writeHead(500, {"Content-Type": "text/html"}); res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body><p style="color:#555;">ERROR 500: INTERNAL SERVER ERROR</p></body></html>');});
			stream.on('readable', function () {stream.pipe(res);});
		} else if (req.url.match(/^\/stage\/main.js/)) {
			var stream = fs.createReadStream(path.join(__dirname, 'js/stage.js'));
			stream.on('error', function (error) {console.log(error); res.writeHead(500, {"Content-Type": "text/html"}); res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body><p style="color:#555;">ERROR 500: INTERNAL SERVER ERROR</p></body></html>');});
			stream.on('readable', function () {stream.pipe(res);});
		} else {
			console.log(' - requested stage');
			var stream = fs.createReadStream(path.join(__dirname, 'html/stage.html'));
			stream.on('error', function (error) {console.log(error); res.writeHead(500, {"Content-Type": "text/html"}); res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body></body></html>');});
			stream.on('readable', function () {stream.pipe(res);});
		}
	} else if (req.url.match(/^\/jquery.min.js/)) {
		var stream = fs.createReadStream(path.join(__dirname, 'js/jquery-1.11.3.js'));
		stream.on('error', function (error) {console.log(error); res.writeHead(500, {"Content-Type": "text/html"}); res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body><p style="color:#555;">ERROR 500: INTERNAL SERVER ERROR</p></body></html>');});
		stream.on('readable', function () {stream.pipe(res);});
	} else {
		res.writeHead(500, {"Content-Type": "text/html"});
		res.end('<!DOCTYPE html><html><head><title></title><style>* {background:#000;color:#000;}</style></head><body><p style="color:#333;">ERROR 500: INTERNAL SERVER ERROR</p></body></html>');
	}
});

var primus = new Primus(server, {
	pathname: '/primus'
});

primus.on('connection', function (spark) {
	/*console.log('connection has the following headers', spark.headers);
	console.log('connection was made from', spark.address);
	console.log('connection id', spark.id);*/
	var id = null;

	spark.on('data', function message(msg) {
		console.log('# '+spark.id+' sent '+msg);

		msg = JSON.parse(msg);
		if (msg.action == 'deviceinfo') {
			if (id === null) {
				id = devices.push({
					spark: spark,
					deviceinfo: msg.data,
					adjust: 0, // 0; contain, 1: fill, 2: stretch, 3: 1:1
					stage: db.stage.default
				}) -1;
				firstSend(id);
			} else {
				devices[id].spark = spark;
				devices[id].deviceinfo = msg.data;
			}
		}
	});
});

primus.on('disconnection', function (spark) {
	var id = null;
	for (var i = 0; i < devices.length; i++) {
		if(devices[i].spark.id == spark.id) {
			id = i;
			break;
		}
	}
	if (id !== null) {		
		console.log('# '+spark.id+' disconnected');
	}
});

function firstSend(device) {
	send(device).wholeDb();
	send(device).whichStage();
}

var send = (function(device) {
	var spark = devices[device].spark;
	console.log('init send for '+spark.id);
	this.whichStage = function(stage) {
		console.log('whichStage');
		var stage = stage || devices[device].stage || db.stage.default;
		spark.write({
			action: 'whichStage',
			data: stage
		});
	};
	this.wholeDb = function() {
		console.log('whole db');
		spark.write({
			action: 'wholeDb',
			data: db
		});
	};
	this.closeSig = function(msg) {
		console.log('ending connection');
		spark.end(msg);
	};
	return this;
});

server.listen(8080, function() {
	console.log('server on port 8080');
});