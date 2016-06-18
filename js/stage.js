var navigatorString = '{';
var id = null;
var stage = null;
var sourceStack = [];
var db = {};
var dbTools = {
	getStage: function(id) {
		for (var i = 0; i < db.stage.length; i++) {
			if (db.stage[i].id == id)
				return db.stage[i];
		}
		return false;
	},
	getScene: function(id) {
		for (var i = 0; i < db.scene.length; i++) {
			if (db.scene[i].id == id)
				return db.scene[i];
		}
		return false;
	},
	getChannel: function(id) {
		for (var i = 0; i < db.channel.length; i++) {
			if (db.channel[i].id == id)
				return db.channel[i];
		}
		return false;
	},
	getObject: function(id) {
		for (var i = 0; i < db.object.length; i++) {
			if (db.object[i].id == id)
				return db.object[i];
		}
		return false;
	},
	getSrc: function(id) {
		for (var i = 0; i < db.src.length; i++) {
			if (db.src[i].id == id)
				return db.src[i];
		}
		return false;
	}
};

window.onload = function() {
	var primus = new Primus();

	primus.id(function(i){
		id=i;
		console.log('id: '+id);
	});

	//window.navigator is only strigified as {}
	//workaround:
	for(obj in navigator){
		if (JSON.stringify(navigator[obj]) !== undefined) {
			navigatorString+='"'+obj+'"'+':'+JSON.stringify(navigator[obj])+',';
		}
	}
	navigatorString=JSON.parse(navigatorString.slice(0,-1)+'}');

	var data = {
		baseURI: document.baseURI,
		clientHeight: document.body.clientHeight,
		clientWidth: document.body.clientWidth,
		clientTop: document.body.clientTop,
		clientLeft: document.body.clientLeft,
		offsetHeight: document.body.offsetHeight,
		offsetWidth: document.body.offsetWidth,
		offsetTop: document.body.offsetTop,
		offsetLeft: document.body.offsetLeft,
		navigator: navigatorString
	};
	primus.write(JSON.stringify({
		action: 'deviceinfo',
		data: data
	}));

	primus.on('data', function received(msg) {
		console.log(msg);
		if (msg.action == 'wholeDb') {
			console.log('wholeDb');
			db = msg.data;
		} else if (msg.action == 'whichStage') {
			stage = msg.data;
		};
		update();
	});
}

function update() {
	console.log('update()');
	if (stage === null || db === {}) {
		return false;
	} else {
		console.log('building tree');
		console.log($('#stage')[0].appendChild(doScene(dbTools.getStage(stage).scene)));
		console.log('tree built');
		applySources($('#stage')[0]);
		console.log('sources applied');

		function doScene(id) {
			var e = document.createElement('div');
			e.setAttribute('data-id', id);
			e.setAttribute('class', 'scene');
			for (var ch in dbTools.getScene(id).channel) {
				e.appendChild(doChannel(dbTools.getScene(id).channel[ch].id), dbTools.getScene(id).channel[ch].fade);
			}
			return e;
		}
		function doChannel(id, fade) {
			var fade = fade || 1.0;
			var e = document.createElement('div');
			e.setAttribute('data-id', id);
			e.setAttribute('class', 'channel');
			for (var obj in dbTools.getChannel(id).object) {
				e.appendChild(doObject(dbTools.getChannel(id).object[obj]));
			}
			return e;
		}
		function doObject(id, transform) {
			var t = new db.schema.Transform();
			for (var obj in transform) {
				t[obj] = transform[obj];
			}
			var e = document.createElement('div');
			e.setAttribute('data-id', id);
			e.setAttribute('class', 'object');
			if (dbTools.getObject(id).object === false) {
				//applying sources after building DOM
			} else if (dbTools.getObject(id).src === false) {
				for (var obj in dbTools.getObject(id).object) {
					e.appendChild(doObject(dbTools.getObject(id).object[obj]));
				}
			} else {
				console.log('ERROR: object holds neither source nor further objects');
			}
			return e;
		}
		function applySources(e) {
			var e = e || document.body;
			for (var o in db.object) {
				if (db.object[o].object === false) {
					if ($('[data-id="'+db.object[o].id+'"]', e).length > 0) {
						var src = dbTools.getSrc(db.object[o].src);
						$('[data-id="'+db.object[o].id+'"]', e)[0].setAttribute('data-src', src.id);
					} else {
						console.log('ERROR: object '+db.object[o].id+' not in DOM');
					}
				}
			}
			for (var o = 0; o < $('[data-src]', e).length; o++) {
				var node = $('[data-src]', e)[o];
				var src = dbTools.getSrc(node.getAttribute('data-src'));
				if (src.type == 'img') {
					var i = document.createElement('img');
					i.src = src.url;
					node.appendChild(i);
				} else if (src.type == 'paragraph') {
					var p = document.createElement('p');
					p.style['color'] = '#fff';
					p.innerText = src.content;
					node.appendChild(p);
				} else if (src.type == 'h1' || src.type == 'h2'|| src.type == 'h3'|| src.type == 'h4'|| src.type == 'h5') {
					var h = document.createElement(src.type);
					h.style['color'] = '#fff';
					h.innerText = src.content;
					node.appendChild(h);
				} else {
					console.log('ERROR: '+JSON.stringify(src));
				}
			}
		}
	}
}