var serverURL = 'ws://'+window.location.hostname+':8081';

document.onload(function() {
	connection = new WebSocket(serverURL);
	connection.onopen = function () {
		console.log("Connection opened");
		connection.send(/*string*/);
	}
	connection.onclose = function () {
		console.log("Connection closed");
	}
	connection.onerror = function () {
		console.error("Connection error");
	}
	connection.onmessage = function (event) {
		//event.data
	}
});