const MSG = document.getElementById("chatMessage");
const sendMsg = document.getElementById("sendMsg");
const msgboard = document.getElementById("msgboard");
const select = document.getElementById("select");

sendMsg.addEventListener("click" , ()=> {
    if (MSG.value !== '')
    {
        socket.emit('msg' , MSG.value);
        MSG.value = '';
    }
})

socket.on('msg to ALL' , data => {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = `${data.user} : ${data.msg}`;
    msgboard.appendChild(msgDiv);
})


////////////////////////////////////////////////////////////////////

const createAgame = document.getElementById("createAgame");

createAgame.addEventListener("click" , ()=> {
    document.getElementById("createRoomBox").style.display = 'flex';
    
})
document.getElementById("createRoomButton").addEventListener('click' , () => {
    socket.emit("create a room" ,{
        name:document.getElementById("roomName").value,
        password:document.getElementById("roomPassword").value,
        number:document.getElementById("select").value
    })
    document.getElementById("createRoomBox").style.display = 'none';
    lobby.style.display = 'none'
})


        socket.on("new room" , event => {
            const roomMsg = document.createElement("div");
            const joinButton = document.createElement("button");
            
            roomMsg.textContent = event + `'s ` + 'room';
            joinButton.textContent = 'JOIN';
            joinButton.value = event;

            joinButton.addEventListener("click" , ()=> {
                socket.emit("join to room", joinButton.value)
            })

            roomMsg.appendChild(joinButton)
            msgboard.appendChild(roomMsg);
        })