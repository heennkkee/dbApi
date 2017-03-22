function sendData() {
    var url = document.getElementById('url').value;
    var mode = document.getElementById('mode').value;
    var pin = document.getElementById('pin').value;
    var value = document.getElementById('value').value;



    var req = new XMLHttpRequest();
    console.log(mode);
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = this.responseText;
            var logMsg = "<br>Request " + url + mode + ", <code>pin=" + pin + "&val=" + value + "</code> gave response: '" + response + "'";
            document.getElementById('log').innerHTML += logMsg;
        }
    }
    req.open("POST", "http://" + url + mode);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.send("pin=" + pin + "&val=" + value);
}

function readPin() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = this.responseText;
            document.getElementById('value').value = response;
            var logMsg = "<br>Request http://lushi.asuscomm.com:1042/read, <code>pin=2</code> gave response: '" + response + "'";
            document.getElementById('log').innerHTML += logMsg;
        }
    }
    req.open("POST", "http://lushi.asuscomm.com:1042/read");
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.send("pin=2");
}
