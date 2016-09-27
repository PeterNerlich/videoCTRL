
/* Do about anything you could do on a website with
 * HTML5 and JS! Text? IFrames? Videostreams without
 * controls, wired to buttons in the admin gui?
 * Or a simple PowerPoint text slide implementation?
 */

// dom elements to be added to the stage
scene.exports.dom = [];

// Any usual Javascript, but refrain from using long
// synchronous operations to stay responsive to
// stage commands.

var Slide = function(type, title, content, size, style) {
	this.type = type || 'text';
	this.title = title || '';
	this.content = content || '';
	this.size = size || '80px';
	this.style = style || 'centered';

	this.bake = function() {
		var e = document.createElement('div');
		e.style.width = '100%';
		e.style.height = '100%';
		switch (this.type) {
			case 'text':
				e.appendChild(document.createElement('p'));
				e.children[0].style.margin = '0';
				e.children[0].style.position = 'relative';
				e.children[0].style.top = '50%';
				e.children[0].style.transform = 'translateY(-50%)';
				e.children[0].style.textAlign = 'center';
				e.children[0].style.fontFamily = 'Ubuntu, Arial, sans-serif';
				e.children[0].style.fontSize = this.size;
				e.children[0].style.color = '#000';
				e.children[0].style.textShadow = '0 0 10px #fff';
				e.children[0].innerText = this.content;
				break;
			default:
				//
		}
		return e;
	};

	return this;
};

var slide = 0;
var slides = []

function setSlide(s) {
	if (s < 0) {
		slide = slides.length - 1;
	} else if (s >= slides.length) {
		slide = 0;
	} else {
		slide = s;
	}
	for (var i = 0; i < slides.length; i++) {
		scene.exports.dom[i].style.display = 'none';
	}
	scene.exports.dom[slide].style.display = 'inherit';
}

// The preload function to be called when loading a
// scene, before showing it
scene.exports.preload = function() {
	slides.push(new Slide('text', 'what can a scene do', 'What can a scene do?'));
	slides.push(new Slide('text', 'anything', 'Just about anything you want it to!'));
	slides.push(new Slide('text', 'HTML5, JS', 'You can use your usual HTML5 and JS like you would on any other website.', '60px'));
	slides.push(new Slide('text', 'text', 'Simply display some text? Easy.'));
	slides.push(new Slide('text', 'slides', 'Building a slideshow? No problem, that\'s what you\'re looking at!', '60px'));
	slides.push(new Slide('text', 'video, canvas', 'Including videostreams and HTML5 canvas magic? It\'s up to you!', '60px'));
	slides.push(new Slide('text', 'whatever', 'Whatever you want to do, whatever you are able to code.'));
	for (var i = 0; i < slides.length; i++) {
		scene.exports.dom.push(slides[i].bake());
	}
	setSlide(0);
	scene.exports.gui = buildgui();
};

// The unload function to be called when unloading a
// scene, freeing up resources (not used yet)
scene.exports.unload = function() {
};

// The show function to be called when revealing a
// scene
scene.exports.show = function() {
};

// The hide function to be called when hiding a
// scene, to stop intervals and such
scene.exports.hide = function() {
};

// The cmd function to be called when receiving a
// scene command, even if scene is not shown
scene.exports.cmd = function(cmd, val) {
	switch (cmd) {
		case 'prev':
			setSlide(slide-1);
			break;
		case 'next':
			setSlide(slide+1);
			break;
		case 'select':
			for (var i = 0; i < slides.length; i++) {
				if (val == '['+(i == slides.length-1 ? i+' !!!' : i)+'] '+slides[i].title) {
					setSlide(i);
					break;
				}
			}
			break;
		default:
			console.log('unknown cmd', cmd, val);
	}
	scene.exports.gui = buildgui();
	g.rebuild('001');
};

// The scene specific gui to be displayed in the
// admin interface
scene.exports.gui = [];

function buildgui() {
	return [
		new g.Button('prev', 'prev'),
		new g.List('select', (function() {
			var a = [];
			for (var i = 0; i < slides.length; i++) {
				a.push('['+(i == slides.length-1 ? i+' !!!' : i)+'] '+slides[i].title);
			}
			return a
		})(), slide),
		new g.Button('next', 'next')
	];
}
