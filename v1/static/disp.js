// ScreenTxt disp.js

var dispNum;
var font;
var msg;

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
	
	updateFont();
	updateTxt();
}

function setDispNum() {
	var newNum = prompt("Enter display number");
	newNum = parseInt(newNum);
	if (!isNaN(newNum) && newNum >= 0) {
		dispNum = newNum;
		localStorage.dispNum = newNum;
		document.getElementById("dispNumBtn").innerText = newNum;
	}
}

function updateFont() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/get/font", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) { // the XHR is done
			if (xhr.status == 200) { // success!
				if (xhr.responseText != font) {
					font = xhr.responseText;
					document.getElementById("txt").style.fontFamily = xhr.responseText; // update the message
				}
				setTimeout(updateFont, 10); // TODO replace this with WebSockets or Channel API
			} else if (xhr.status == 403) { // forbidden - user has probably signed out
				document.getElementsByTagName("body")[0].innerText = "You have been signed out.  Please refresh to sign in again.";
			} // if a different status, ignore it and hope the problem goes away :P
		}
	}
	xhr.send();
}
function updateTxt() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/get/msg", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) { // the XHR is done
			if (xhr.status == 200) { // success!
				if (unescape(xhr.responseText) != msg) {
					msg = unescape(xhr.responseText);
					document.getElementById("txt").innerText = unescape(xhr.responseText).charAt(dispNum); // update the message
				}
				setTimeout(updateTxt, 10); // TODO replace this with WebSockets or Channel API
			} else if (xhr.status == 403) { // forbidden - user has probably signed out
				document.getElementsByTagName("body")[0].innerText = "You have been signed out.  Please refresh to sign in again.";
			} // if a different status, ignore it and hope the problem goes away :P
		}
	}
	xhr.send();
}
