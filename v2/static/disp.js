// ScreenTxt disp.js

var dispNum;
var font;
var msg;

var socket = channel.open();
socket.onmessage = function(msg) {
	var setting = msg.data.substring(0,3);
	var val = msg.data.substring(3);
	if (setting == "fon") { // font
		if (val != font) {
			font = val;
			document.getElementById("txt").style.fontFamily = val; // update the font
		}
	} else if (setting == "msg") { // message
		if (val != msg) {
			msg = unescape(val);
			document.getElementById("txt").innerText = unescape(val).charAt(dispNum);; // update the message
		}
	}
}
socket.onerror = function() {
	document.getElementsByTagName("body")[0].innerText = "A socket error has occurred.  Please refresh to try again.";
}
socket.onclose = function() {
	document.getElementsByTagName("body")[0].innerText = "The socket seems to have closed.  Please refresh to try again.";
}
window.onunload = function() {
	socket.close();
}

function init() {
	if (!window.XMLHttpRequest || !localStorage) {
 		document.getElementsByTagName("body")[0].innerHTML = "This browser does not support features needed to use ScreenTxt_Z.  Please switch to a better browser such as <a href='http://google.com/chrome' target='_blank'>Google Chrome</a>."
	}
	if (localStorage.dispNum) {
		 dispNum = parseInt(localStorage.dispNum);
	} else {
		 dispNum = 0;
	}
	if (isNaN(dispNum)) {
		dispNum = 0;
	}
	
	document.getElementById("dispNumBtn").innerText = dispNum;
	
	font = "sans-serif";
	document.getElementById("txt").style.fontSize = window.innerHeight + "px";
	
	// make a XHR
	var xhr = new XMLHttpRequest();
	
	// get the font
	xhr.open("GET", "/get/font", false);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) { // the XHR is done
			if (xhr.status == 200) { // success!
				font = xhr.responseText;
				document.getElementById("txt").style.fontFamily = xhr.responseText; // update the message
			} else if (xhr.status == 403) { // forbidden - user has probably signed out
				document.getElementsByTagName("body")[0].innerText = "You have been signed out.  Please refresh to sign in again.";
			} // if a different status, ignore it and hope the problem goes away :P
		}
	}
	xhr.send();
	
	// get the message
	xhr.open("GET", "/get/msg", false);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) { // the XHR is done
			if (xhr.status == 200) { // success!
				msg = unescape(xhr.responseText);
				document.getElementById("txt").innerText = unescape(xhr.responseText).charAt(dispNum); // update the message
			} else if (xhr.status == 403) { // forbidden - user has probably signed out
				document.getElementsByTagName("body")[0].innerText = "You have been signed out.  Please refresh to sign in again.";
			} // if a different status, ignore it and hope the problem goes away :P
		}
	}
	xhr.send();
}

function setDispNum() {
	var newNum = prompt("Enter display number");
	newNum = parseInt(newNum);
	if (!isNaN(newNum) && newNum >= 0) {
		dispNum = newNum;
		localStorage.dispNum = newNum;
		document.getElementById("dispNumBtn").innerText = newNum;
		document.getElementById("txt").innerText = msg.charAt(dispNum); // update the message
	}
}
