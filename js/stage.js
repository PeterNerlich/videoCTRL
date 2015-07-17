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
			db = msg.data;
			update();
		} else if (msg.action == 'whichStage') {
			stage = msg.data;
			update();
		};
	});
}

function update() {
	if (stage === null || db === {} || stage === null) {
		return false;
	} else {
		$('#stage')[0].innerHTML = doScene(dbTools.getStage(stage).scene, '');
		applySources($('#stage')[0]);

		function doScene(id, html) {
			var html = html || '';
			html += '<div data-id="'+id+'" class="scene">';
			for (var ch in dbTools.getScene(id).channel) {
				html += doChannel(dbTools.getScene(id).channel[ch]);
			}
			html += '</div>';
			return html;
		}
		function doChannel(id, html) {
			var html = html || '';
			html += '<div data-id="'+id+'" class="channel">';
			for (var obj in dbTools.getChannel(id).object) {
				html += doObject(dbTools.getChannel(id).object[obj]);
			}
			html += '</div>';
			return html;
		}
		function doObject(id, html) {
			var html = html || '';
			html += '<div data-id="'+id+'" class="object">';
			if (dbTools.getObject(id).object === false) {
				//applying sources after building DOM
			} else if (dbTools.getObject(id).src === false) {
				for (var obj in dbTools.getObject(id).object) {
					html += doObject(dbTools.getObject(id).object[obj]);
				}
			} else {
				console.log('ERROR: object holds neither source nor further objects');
			}
			html += '</div>';
			return html;
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
					p.innerText = src.content;
					node.appendChild(p);
				} else if (src.type == 'h3') {
					var h = document.createElement('h3');
					h.innerText = src.content;
					node.appendChild(h);
				} else {
					console.log('ERROR: '+JSON.stringify(src));
				}
			}
		}
	}
}