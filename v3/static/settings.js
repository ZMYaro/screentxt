var disps = [];

function init() {
	if (!window.XMLHttpRequest) {
 		document.getElementsByTagName("body")[0].innerHTML = "This browser does not support features needed to use ScreenTxt_Z.  Please switch to a better browser such as <a href='http://google.com/chrome' target='_blank'>Google Chrome</a>."
	}
}

function set(setting, newVal) {
	newVal = encodeURIComponent(newVal);
//	console.log("1: " + newVal);
	newVal = newVal.replace("/", "%2F");
//	console.log("2: " + newVal);
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/set/" + setting + "/" + newVal, true);
	xhr.onreadystatechange = function() {
 		if (xhr.readyState == 4) { // the XHR is done
			if (xhr.status == 200) { // success!
				document.getElementById(setting + "LoadingIcon").src = "/static/check.gif";
			} else if (xhr.status == 403) { // forbidden - user has probably signed out
				document.getElementsByTagName("body")[0].innerHTML = "You have been signed out.  Please refresh to sign in again.";
			} else {
				document.getElementById("serverResponse").innerHTML += "<br/>" + xhr.responseText;
			}
			// if a different status, ignore it and hope the problem goes away :P
		}
	}
	document.getElementById(setting + "LoadingIcon").src = "/static/loading.gif";
	xhr.send();
}
function setEverything() {
	set("font", document.getElementById("fontSetting").value);
	set("color", document.getElementById("colorSetting").value);
	set("bgcolor", document.getElementById("bgcolorSetting").value);
	set("msg", document.getElementById("msgSetting").value);
}
function spawnDisps() {
	var dispCount = parseInt(document.getElementById("dispSpawnDisps").value);
	if (isNaN(dispCount) || dispCount <= 0) {
		dispCount = 1;
	}
	var rows = parseInt(document.getElementById("dispSpawnRows").value);
	if (isNaN(rows) || rows <= 0) {
		rows = 1;
	}
	var start = parseInt(document.getElementById("dispSpawnStart").value);
	if (isNaN(start) || start < 0) {
		start = 0;
	}
	var dispsPerRow = Math.ceil(dispCount * 1.0 / rows);
	var width = Math.floor(screen.availWidth / dispsPerRow);
	var height = Math.floor(screen.availHeight / rows);
	for (var i = 0; i < dispCount; i++) {
		disps.push(window.open("/disp#" + (i + start), "_blank", "toolbar=false,width=" + width + ",height=" + height));
	}
}
function closeDisps() {
	for (var i = disps.length - 1; i >= 0; i--) {
		var disp = disps.pop();
		try {
			disp.socket.close();
		} catch(e) {
			console.log("An error occurred while trying to close the socket for a display.");
		}
		disp.close();
	}
}
