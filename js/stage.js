var primus = new Primus();

primus.write(JSON.stringify({
	action: 'deviceinfo',
	data: {
		baseURI: document.baseURI,
		clientHeight: document.clientHeight,
		clientWidth: document.clientWidth,
		clientTop: document.clientTop,
		clientLeft: document.clientLeft,
		offsetHeight: document.offsetHeight,
		offsetWidth: document.offsetWidth,
		offsetTop: document.offsetTop,
		offsetLeft: document.offsetLeft
	}
}));

primus.on('data', function received(data) {
	console.log(data);
});

/*var serverURL = 'ws://'+window.location.hostname+':8081';

console.log('connecting to '+serverURL);

window.onload = function() {
	connection = new WebSocket(serverURL);
	connection.onopen = function () {
		console.log('Connection opened');
		connection.send(JSON.stringify({
			action: 'deviceinfo',
			data: {
				baseURI: document.baseURI,
				clientHeight: document.clientHeight,
				clientWidth: document.clientWidth,
				clientTop: document.clientTop,
				clientLeft: document.clientLeft,
				offsetHeight: document.offsetHeight,
				offsetWidth: document.offsetWidth,
				offsetTop: document.offsetTop,
				offsetLeft: document.offsetLeft
			}
		}));
	}
	connection.onclose = function () {
		console.log('Connection closed');
	}
	connection.onerror = function () {
		console.error('Connection error');
	}
	connection.onmessage = function (event) {
		//event.data
	}
};*/