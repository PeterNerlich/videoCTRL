module.exports = function(stage) {
	this.children = [
		{
			type: 'button',
			title: 'Reload GUI',
			signal: 'gui reload'
		},
		{
			type: 'group',
			title: 'stage nav',
			class: 'bordered labeled',
			children: [
				{
					type: 'button',
					title: 'CLEAR',
					signal: 'clear'
				},
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
			type: 'group',
			title: 'scene nav',
			class: 'bordered labeled horizontal',
			children: [
				{
					type: 'group',
					title: 'overlay',
					class: 'horizontal',
					children: [
						{
							type: 'button',
							title: '←',
							signal: 'scene prev'
						},
						{
							type: 'list',
							signal: 'scene select',
							options: function(){return stage.scenes;},
							current: function(){return stage.scene;}
						},
						{
							type: 'button',
							title: '→',
							signal: 'scene next'
						}
					]
				},
				{
					type: 'button',
					title: 'Reload Scene',
					signal: 'scene reload'
				},
				{
					type: 'button',
					title: 'Rescan',
					signal: 'scene scan'
				}
			]
		},
		{
			type: 'group',
			title: 'stage background',
			class: 'bordered labeled',
			children: [
				{
					type: 'button',
					title: 'Rescan',
					signal: 'stage bg scan'
				},
				{
					type: 'list',
					signal: 'stage bg select',
					options: function(){return stage.bgs;},
					current: function(){return stage.bg;}
				}
			]
		}
	];

	return this;
};