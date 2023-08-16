const socket = io();

document.querySelector("#codeContainer").style.display = "none";
document.querySelector("#createFolder").style.display = "none";
document.querySelector("#saveRoom").style.display = "none";

// Join a room by enter Key
let roomName = document.getElementById('RoomName');
roomName.addEventListener('keypress', (event)=>
{
    if(event.key=='Enter')
    {
        event.preventDefault();
        SubmitRoomId(); 
    }
});

// join a room by button
const joinButton = document.getElementById("join");
joinButton.addEventListener("click",(event)=>
{
    event.preventDefault();
    SubmitRoomId(); 
});

//create a room
const createRoomButton = document.getElementById("newRoom")
createRoomButton.addEventListener("click",async (event)=>
{
    event.preventDefault();
    try
    {
        const response = await fetch('http://localhost:4000/api/createNewRoom');
        if(response.ok)
        {
            const roomDetails = await response.json();
            roomName.value = roomDetails.roomId;
        }
    }
    catch(err)
    {
        alert("faiiled to create room");
    }
});

// Enter a room
async function SubmitRoomId()
{
    const roomId = roomName.value;
    //checking if room exist
    try {
        const response = await fetch(`http://localhost:4000/api/checkRoomExists/${roomId}`);
        const data = await response.json();

        if (data.exists =='1') 
        {
            const roomDetails = data.data;
            document.querySelector("#codeContainer").style.display = "flex";
            document.querySelector("#createFolder").style.display = "block";
            document.querySelector("#saveRoom").style.display = "block";
            document.querySelector(".lobby").style.display = "none";
            document.querySelector("#RoomTitle").innerText = `room : ${roomId}`;

            // restoring room previous state
            document.getElementById("html-code").value = roomDetails.HtmlData;
            document.getElementById("css-code").value = roomDetails.CssData;
            document.getElementById("js-code").value = roomDetails.JavaScriptData;

            socket.emit("join-room",roomId);
            window.addEventListener('beforeunload', (e)=> {
                e.preventDefault();
                socket.emit("exit-room",roomId);
            });
        }
        else
        {
          alert(`Room with ID ${roomId} does not exist.`);
        }
      } 
      catch (error)
       {
        console.log('Error checking if room exists:');
      }
}

// running the code, gets invoked on every change.
function run() 
{
    HtmlData = document.getElementById("html-code").value;
    CssData = document.getElementById("css-code").value;
    JavaScriptData = document.getElementById("js-code").value;
    
    socket.emit("coding", {room: document.querySelector("#RoomName").value, html: HtmlData, css: CssData, js: JavaScriptData});
    output.contentDocument.body.innerHTML = HtmlData + "<style>" + CssData + "</style>";
    output.contentWindow.eval(JavaScriptData);
}
// Receiving update signal from server
socket.on("coding", (e) => {
    HtmlData = e.html;
    CssData = e.css;
    JavaScriptData = e.js;
    document.getElementById("html-code").value = HtmlData;
    document.getElementById("css-code").value = CssData;
    document.getElementById("js-code").value = JavaScriptData;
    output.contentDocument.body.innerHTML = HtmlData + "<style>" + CssData + "</style>";
    output.contentWindow.eval(JavaScriptData);
});

function saveRoom()
{
    HtmlData = document.getElementById("html-code").value;
    CssData = document.getElementById("css-code").value;
    JavaScriptData = document.getElementById("js-code").value;
    socket.emit("saveRoom",{
        html:HtmlData,
        css:CssData,
        js:JavaScriptData,
        room:document.querySelector("#RoomName").value
    })
}

// Saving Code locally
function createFolder() {
    const folderName = document.querySelector("#RoomName").value;
    const HtmlData = document.getElementById('html-code').value;
    const CssData = document.getElementById('css-code').value;
    const JavaScriptData = document.getElementById('js-code').value;

    // Create a zip file to hold the folder and files
    const zip = new JSZip();
    const folder = zip.folder(folderName);

    // Add the HTML, CSS, and JS files to the folder
    folder.file('index.html', HtmlData);
    folder.file('style.css', CssData);
    folder.file('script.js', JavaScriptData);

    // Generate the zip file
    zip.generateAsync({ type: 'blob' })
      .then(function (blob) {
        // Create a download link for the zip file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = folderName + '.zip';
        link.click();
      });
  }