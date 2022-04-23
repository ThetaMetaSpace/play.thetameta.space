/*
Hook call from UnityInstance
Input is Json in string => must parse
Incoming struct {id:<UID>, text:<data>}
Each hook must return result to Unity with same UID
Retrun struct returnMsg = {id: <UID>, text: <String>}
unityInstance.SendMessage(
      "BrowserConnect (Singleton)",//GameObjectName will get this message
      "ResponseFromBrowser",//Method
      JSON.stringify(returnMsg)
    );
*/
SendBackToUnity = returnMsg => {
    unityInstance.SendMessage(
        "BrowserConnect (Singleton)",
        "ResponseFromBrowser",
        JSON.stringify(returnMsg)
    );
}

DetectMetamask = incommingMsgStr => {
    let incommingMsg = JSON.parse(incommingMsgStr);
    let returnMsg = {
        id: incommingMsg.id,
        text: "",
    };
    if (!window.ethereum) {
        returnMsg.text = "ERROR: Please install Metamask wallet";
    }
    else {
        returnMsg.text = "Installed";
    }
    SendBackToUnity(returnMsg);
};

GetStartLocation = incommingMsgStr => {
    let incommingMsg = JSON.parse(incommingMsgStr);
    let loc = new URL(location.href).searchParams.get("location");
    let returnMsg = { id: incommingMsg.id, text: loc == null ? "0:0" : loc };
    SendBackToUnity(returnMsg);
};

Sign = async incommingMsgStr => {
    let incommingMsg = JSON.parse(incommingMsgStr);
    let returnMsg = { id: incommingMsg.id, text: "" };
    try {
        const message = incommingMsg.text;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const signature = await ethereum.request({ method: 'personal_sign', params: [message, account] });
        returnMsg.text = signature;
    } catch (error) {
        returnMsg.text = "ERROR: " + error.message;//Must return start with ERROR
    }
    SendBackToUnity(returnMsg)
};

SignTransaction = async incommingMsgStr => {
    let incommingMsg = JSON.parse(incommingMsgStr);
    let returnMsg = { id: incommingMsg.id, text: "" };
    try{
        let txData = JSON.parse(incommingMsg.text);
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        txData.from = account;
        await ethereum.request({
            method: 'eth_sendTransaction',
            params: [txData],
          });
        returnMsg.text = "SUCCESS";
    }
    catch(e){
        returnMsg.text = "ERROR: "+ e.message;
    }
    SendBackToUnity(returnMsg)
};


//Mutil player
let socket;

MutilPlayerSendMessage = function (str) {
    let msg = JSON.parse(str);
    if (msg.text.startsWith("JOIN")) {
        socket = new WebSocket("wss://thetametachat.glitch.me/chat");
        // Connection opened
        socket.addEventListener("open", function (event) {
            socket.send(msg.text);
        });
        socket.addEventListener("close", function (event) {
            alert("Disconnected with chat server, another user don't see you anymore");
        });
        // Listen for messages
        socket.addEventListener("message", function (event) {
            console.log("Message from server ", event.data);

            unityInstance.SendMessage(
                "MutilPlayerManager",
                "IncomeMessage",
                event.data
            );
        });
    } else {
        if (socket && socket.readyState == 1) socket.send(msg.text);
    }
};

//End-MutilPlayer

//Paster Plugin
RequestPasteText = function (ID) {
    var pastedtext = prompt(
        ID + "\ThetaMetaSpace\nPlease paste here:",
        ""
    );
    var pasteTempl = {
        id: ID,
        text: pastedtext,
    };
    unityInstance.SendMessage(
        "SYS_PASTER_HELPER",
        "GetPastedText",
        JSON.stringify(pasteTempl)
    );
};

CloseLoadingBar = function(){
    var loadingBar = document.querySelector("#unity-loading-bar");
    loadingBar.style.display = "none";
}
console.log("HookLoaded!")