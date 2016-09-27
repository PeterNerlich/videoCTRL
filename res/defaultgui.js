var gui = new require('./gui.js')();

module.exports = function(stage) {
	this.children = [
		new gui.Button('gui reload', 'Reload GUI'),
		new gui.Group('stage nav', 'bordered labeled', [
			new gui.Button('clear', 'CLEAR'),
			new gui.Button('blackout', 'Blackout'),
			new gui.Button('whiteout', 'Whiteout'),
			new gui.Button('blankout', 'Blankout')
		]),
		new gui.Group('scene nav', 'bordered labeled horizontal', [
			new gui.Group('scene nav', 'horizontal', [
				new gui.Button('scene prev', '←'),
				new gui.List('scene select', function(){return stage.scenes;}, function(){return stage.scene;}),
				new gui.Button('scene next', '→')
			]),
			new gui.Button('scene reload', 'Reload Scene'),
			new gui.Button('scene scan', 'Rescan')
		]),
		new gui.Group('scene settings', 'bordered labeled', [
			new gui.SceneGui(gui)
		]),
		new gui.Group('stage background', 'bordered labeled', [
			new gui.Button('stage bg scan', 'Rescan'),
			new gui.List('stage bg select', function(){return stage.bgs;}, function(){return stage.bg;})
		])
	];

	return this;
};