var navigatorString = '{';

window.onload = function() {
	var primus = new Primus();

	//window.navigator is strigified as {}
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

	primus.on('data', function received(data) {
		console.log(data);
	});
}

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