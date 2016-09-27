
var Gui = function(elem, settingScene, lSigHandler, schema) {
	if (typeof document === 'object') {
		this.elem = document.querySelector(elem) || null;
		//if (!elem) { return false; }
		this.schema = schema || {};

		var signals = [];
		var Signal = function(elem, event, sig, val) {
			if (!elem || typeof elem !== 'object' || typeof event !== 'string' || typeof sig !== 'string') {
				return {err:'arguments'};
			}
			this.element = elem;
			this.event = event || 'click';
			this.signal = sig || 'undefined';
			this.scene = null;
			this.value = val || true;
			var s = this;
			this.eventHandler = function(e) {
				return gui.trigger(s, e);
			};

			return this;
		};

		this.rebuild = function(data, scenegui) {
			this.elem.innerHTML = '';
			if (typeof data === 'object' && data !== null) {
				this.schema = data;
			}
			/* check how much of the tree has actually to be rebuilt */
			var children = this.build(this.schema.children, scenegui);
			for (var i = 0; i < children.length; i++) {
				this.elem.appendChild(children[i]);
			}
			this.bindactions(this.elem);
			return true;
		};

		this.build = function(tree, scenegui) {
			if (typeof scenegui !== 'object') {
				scenegui = {}
			}
			var dom = [];
			for (var i = 0; (typeof tree == 'object' && i < tree.length); i++) {
				switch (tree[i].type) {
					case 'group':
						var id = dom.push(document.createElement('div')) - 1;
						dom[id].appendChild(document.createElement('label'));
						dom[id].children[0].innerText = tree[i].title;
						if (typeof tree[i].scene === 'string') {
							dom[id].setAttribute('data-scene', tree[i].scene);
						}
						if (typeof tree[i].children === 'object' && tree[i].children.length > 0) {
							var children = this.build(tree[i].children, scenegui);
							for (var j = 0; j < children.length; j++) {
								dom[id].appendChild(children[j]);
							}
						}
						break;
					case 'button':
						var id = dom.push(document.createElement('button')) - 1;
						dom[id].innerText = tree[i].title;
						dom[id].setAttribute('data-signal',tree[i].signal);
						if (typeof tree[i].scene === 'string') {
							dom[id].setAttribute('data-scene', tree[i].scene);
						}
						if (typeof tree[i].value !== 'undefined') {
							dom[id].setAttribute('value', tree[i].value);
						}
						break;
					case 'list':
						var id = dom.push(document.createElement('select')) - 1;
						dom[id].setAttribute('data-signal',tree[i].signal);
						if (typeof tree[i].scene === 'string') {
							dom[id].setAttribute('data-scene', tree[i].scene);
						}
						if (typeof tree[i].options === 'object' && tree[i].options.length > 0) {
							for (var j = 0; j < tree[i].options.length; j++) {
								dom[id].appendChild(document.createElement('option'));
								dom[id].children[j].setAttribute('value', tree[i].options[j]);
								dom[id].children[j].innerText = tree[i].options[j];
							}
						}
						if (tree[i].current < j) { dom[id].children[tree[i].current].setAttribute('selected', true); }
						break;
					case 'sceneGui':
						var id = dom.push(document.createElement('div')) - 1;
						if (typeof tree[i].title === 'string') {
							dom[id].appendChild(document.createElement('label'));
							dom[id].children[0].innerText = tree[i].title;
						}
						if (typeof scenegui === 'object' && scenegui !== null) {
							var children = this.build([
								new gui.Group('scene select', 'horizontal', [
									new gui.List('[l] scene settings select', scenegui.scenes, scenegui.index),
									//new gui.Button('scene reload', 'Reload Scene', '', function(){return this.scene})
								])
							]);
							if (typeof tree[i].children === 'object') {
								children = children.concat(this.build(tree[i].children, scenegui));
							}
							children = children.concat(this.build(scenegui.gui));
							for (var j = 0; j < children.length; j++) {
								dom[id].appendChild(children[j]);
							}
						}
/*						var s = this.build(scenegui, settingScene);
						console.log(s);
						for (var j = 0; j < s.length; j++) {
							tree[i].children.push(s[j]);
						}
						for (var j = 0; j < tree[i].children; j++) {
							dom.appendChild(tree[i].children[j]);
						}*/
						break;
					default:
						console.warn('unknown node type', tree[i].type, ', treating as group');
						var id = dom.push(document.createElement('div')) - 1;
						if (typeof tree[i].scene === 'string') {
							dom[id].setAttribute('data-scene', tree[i].scene);
						}
						if (typeof tree[i].children === 'object' && tree[i].children.length > 0) {
							var children = this.build(tree[i].children, scenegui);
							for (var j = 0; j < children.length; j++) {
								dom[id].appendChild(children[j]);
							}
						}
				}
				dom[id].setAttribute('data-role', tree[i].type);
				if (typeof tree[i].class === 'string') {dom[id].setAttribute('class', tree[i].class);}
				if (tree[i].title) { dom[id].setAttribute('label', tree[i].title); }
			}
			return dom;
		};

		this.bindactions = function(dom) {
			var signals = [];
			if (dom.getAttribute('data-signal')) {
				var sig = new Signal(dom, '', dom.getAttribute('data-signal'));
				var id = signals.push(sig) - 1;
				if (typeof dom.getAttribute('data-scene')) {
					signals[id].scene = dom.getAttribute('data-scene');
				}
				switch (dom.getAttribute('data-role')) {
					case 'button':
						signals[id].event = 'click';
						signals[id].value = function(e, elem) {
							return elem.value;
						};
						break;
					case 'list':
						signals[id].event = 'input';
						signals[id].value = function(e, elem) {
							return elem.value;
						};
						break;
					default:
						console.warn('dom has [data-signal] but no [data-role]');
				}
				dom.addEventListener(signals[id].event, signals[id].eventHandler);
			}
			for (var i = 0; i < dom.children.length; i++) {
				signals = signals.concat(this.bindactions(dom.children[i]));
			}

			return signals;
		};

		this.unbindactions = function(signals) {
			for (var i = 0; i < signals.length; i++) {
				signals[i].element.removeEventListener(signals[i].event, signals[i].eventHandler);
			}
			signals = [];

			return true;
		}

		this.trigger = function(signal, e) {
			if (!primus) {
				console.err('primus not found');
				return false;
			}

			var sig = (typeof signal.value === 'function') ? signal.value(e, signal.element) : signal.value;
			if (signal.signal.match(/^\[l] /)) {
				return lSigHandler({
					signal: signal.signal.slice(4),
					value: sig
				});
			} else if (typeof signal.scene === 'string') {
				return primus.write({
					type: 'scene cmd',
					scene: signal.scene,
					data: {
						signal: signal.signal,
						value: sig
					}
				});
			} else {
				return primus.write({
					type: 'gui cmd',
					data: {
						signal: signal.signal,
						value: sig
					}
				});
			}
		};

		this.scene = function(name) {
			var t = {};

			t.Group = function(title, cl, children) {
				this.type = 'group';
				this.title = title || '';
				this.class = cl || '';
				this.scene = name;
				this.children = children || [];
				return this;
			};

			t.Button = function(signal, title, cl, value) {
				this.type = 'button';
				this.title = title || '';
				this.class = cl || '';
				this.scene = name;
				this.signal = signal || '';
				this.value = value || true;
				return this;
			};

			t.List = function(signal, options, current, cl) {
				this.type = 'list';
				this.scene = name;
				this.signal = signal || '';
				this.class = cl || '';
				this.options = options || [];
				this.current = current || 0;
				return this;
			};

			return t;
		};
	}

	this.Group = function(title, cl, children) {
		this.type = 'group';
		this.title = title || '';
		this.class = cl || '';
		this.children = children || [];
		return this;
	};

	this.Button = function(signal, title, cl, value) {
		this.type = 'button';
		this.title = title || '';
		this.class = cl || '';
		this.signal = signal || '';
		this.value = value || true;
		return this;
	};

	this.List = function(signal, options, current, cl) {
		this.type = 'list';
		this.signal = signal || '';
		this.class = cl || '';
		this.options = options || [];
		this.current = current || 0;
		return this;
	};

	this.SceneGui = function(gui, settingScene, cl, title) {
		this.type = 'sceneGui';
		this.title = title || '';
		this.class = cl || '';
		this.children = [];
		return this;
	};

	return this;
};

if (typeof module === 'object') {
	module.exports = Gui;
}