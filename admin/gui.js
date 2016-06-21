
var Gui = function(elem, schema) {
	this.elem = document.querySelector(elem) || false;
	if (!elem) { return false; }
	this.schema = schema || {};

	var signals = [];
	var Signal = function(elem, event, sig, val) {
		if (!elem || typeof elem !== 'object' || typeof event !== 'string' || typeof sig !== 'string') {
			return {err:'arguments'};
		}
		this.element = elem;
		this.event = event || 'click';
		this.signal = sig || 'undefined';
		this.value = val || true;
		var s = this;
		this.eventHandler = function(e) {
			return console.log(gui.trigger(s, e));
		};

		return this;
	};

	this.rebuild = function(data) {
		this.elem.innerHTML = '';
		this.schema = data;
		/* check how much of the tree has actually to be rebuilt */
		var children = this.build(data.children);
		for (var i = 0; i < children.length; i++) {
			this.elem.appendChild(children[i]);
		}
		this.bindactions(this.elem);
		return true;
	};

	this.build = function(tree) {
		var dom = [];
		for (var i = 0; i < tree.length; i++) {
			switch (tree[i].type) {
				case 'group':
					var id = dom.push(document.createElement('div')) - 1;
					dom[id].appendChild(document.createElement('label'));
					dom[id].children[0].innerText = tree[i].title
					if (typeof tree[i].children === 'object' && tree[i].children.length > 0) {
						var children = this.build(tree[i].children);
						for (var j = 0; j < children.length; j++) {
							dom[id].appendChild(children[j]);
						}
					}
					break;
				case 'button':
					var id = dom.push(document.createElement('button')) - 1;
					dom[id].innerText = tree[i].title;
					dom[id].setAttribute('data-signal',tree[i].signal);
					break;
				case 'list':
					var id = dom.push(document.createElement('select')) - 1;
					dom[id].setAttribute('data-signal',tree[i].signal);
					for (var j = 0; j < tree[i].options.length; j++) {
						dom[id].appendChild(document.createElement('option'));
						dom[id].children[j].setAttribute('value', tree[i].options[j]);
						dom[id].children[j].innerText = tree[i].options[j];
					}
					if (tree[i].current < j) { dom[id].children[tree[i].current].setAttribute('selected', true); }
					break;
				default:
					console.warn('unknown node type "'+tree[i].type+'", treating as group');
					var id = dom.push(document.createElement('div')) - 1;
					if (typeof tree[i].children === 'object' && tree[i].children.length > 0) {
						var children = this.build(tree[i].children);
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
			switch (dom.getAttribute('data-role')) {
				case 'button':
					signals[id].event = 'click';
					break;
				case 'list':
					signals[id].event = 'input';
					signals[id].value = function(e, elem) {
						console.log('input: '+elem.value);
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
		return primus.write({
			type: 'gui cmd',
			data: {
				signal: signal.signal,
				value: signal.value
			}
		});
	};

	return this;
};
