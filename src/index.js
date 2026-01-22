import express from 'express';
import {Server} from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("src/files"));

import { cards } from "./functions/createCardFun.js";

const map = new Map();
const rooms = new Map();
const privateRoom = new Map();


class CreateRoom {
    PlussCardTotal=0;
    indexOfplayer= 0;
    lastcard = {
    number:-1,
    color:-1
    };
    state=true;
    players=[];

    numberOfUser = 0;

    nextPlyer(){
        this.indexOfplayer = (this.indexOfplayer + (this.state ? 1:-1) +this.players.length)%this.players.length;
    }
     userSend(type,index , data){
        this.players[index].socket.emit(type,data)
    }
    sendTOall(data){
        this.players.forEach(player => {
            player.socket.emit('lastcard' , data);
        })
    }
    sendCard(count , index){
        let storgeCardForUser = [...cards(count)];
        this.userSend('cards',index ,  {
            cards:storgeCardForUser
        })
        this.PlussCardTotal = 0;
        storgeCardForUser.forEach(element => {
            this.players[index].cards.push(element);
        })

    }

    play(data){
            this.setpsAfterPlay(data);
            switch(data.number){
                case"change dirction":
                    this.state = !this.state;
                    if (this.players.length === 2){
                        this.nextPlyer();
                        this.playNowFunction();
                    }
                    else this.playNowFunction();
                    break;
                case'+4':
                    this.shortWayPlusCard(false ,data);
                    break;
                case'+2':
                    this.shortWayPlusCard(true ,data);
                    break;
                case'stop':
                    this.nextPlyer();
                    this.playNowFunction();
                    break;
                default:
                    this.playNowFunction();
                    break;
            }
    }
    help(data){
            if (this.PlussCardTotal === 0)
            {
                this.sendCard(1 , this.indexOfplayer);
                this.playNowFunction();
            }
            else if (this.PlussCardTotal > 0)
            {
                this.sendCard(this.PlussCardTotal , this.indexOfplayer);
                this.playNowFunction();
            }
    }
    shortWayPlusCard(x ,data)
    {
        let value = data.number.split('')
        this.PlussCardTotal = this.PlussCardTotal + Number(value[1]);
        this.nextPlyer()
        this.userSend('playNow',this.indexOfplayer , {
            index:this.checkPlusCard(x)
        })
    }
    playNowFunction(){
    this.nextPlyer();
    this.userSend('playNow',this.indexOfplayer , {
        index:this.checkCard(),
    });
}

    setpsAfterPlay(data){
    if (this.players[this.indexOfplayer].cards.length === 1)
    {
        console.log("someone  end the game");
        this.userSend('winner',this.indexOfplayer ,{})
        this.nextPlyer();
        this.userSend('loser',this.indexOfplayer , {})
    }
    else {
    this.lastcard.number = data.number;
    this.lastcard.color  = data.color;
    this.deletCardFromUser(data);
    this.sendTOall({
        type:'lastcard',
        card:this.lastcard
    })
    }
}
 checkCard (){
    let arrOfindexs = [];

    this.players[this.indexOfplayer].cards.forEach((card , i) => {
        if (   card.n === this.lastcard.number 
            || card.c === this.lastcard.color
            || card.c === 'black'|| this.lastcard.number === -1 )
        {
            arrOfindexs.push(i);
        }
    });
    return arrOfindexs;
}

 checkPlusCard(x){
    let arrOfindexs = [];
    this.players[this.indexOfplayer].cards.forEach((card  , i)=> {
        if (('+2' === card.n &&(this.lastcard.color === card.c || x))|| card.n === '+4')
            {
                arrOfindexs.push(i);
            }
        })
        return arrOfindexs;
    
}
 deletCardFromUser(data){
    this.players[this.indexOfplayer].cards.splice(data.indexOfCard , 1)
}
 startGame(){
    for (let i = 0 ; i < this.players.length ; i++)
    {
        this.userSend('order',i , {
            order:i
        })
        this.sendCard(10 , i);
        this.nextPlyer();
    }
    this.indexOfplayer = this.players.length -1 
    this.playNowFunction();   
}



}

/*************************************************************
 *  create rooms
 **************************************************************/

function createGame(socket, data , name) {
    let thisRoom = new CreateRoom();
    privateRoom.set(name,thisRoom);
    
    for (let i = 0 ; i < data.number ; i++)
        thisRoom.players.push({socket:null , cards:[]});
    thisRoom.players[0].socket = socket;
    thisRoom.numberOfUser++;
}

function joinPlayer(socket,data) {
    let thisRoom = privateRoom.get(data);
    if (thisRoom.numberOfUser < thisRoom.players.length)
        {
            thisRoom.players[thisRoom.numberOfUser].socket = socket;
            thisRoom.numberOfUser++
        }
        if (thisRoom.numberOfUser === thisRoom.players.length)
        {
            thisRoom.startGame();
        }
}
let testCount = 0;
/****************************************************************** 
io connection
***************************************************************/
io.on('connection' , socket => {
    socket.on('user login' , event => {
        map.set(socket.id , event.username);
        socket.emit('lobby', 'this is looby');
    })
    socket.on('msg' , msg => {
        let clint = map.get(socket.id);

        io.emit('msg to ALL' , {
            user:clint,
            msg:msg
        })
    })
    socket.on('create a room' , (event) => {
        let name  = map.get(socket.id);

        socket.join(name);
        createGame(socket, event , name);        
        socket.emit("you join the room" , name);
        socket.broadcast.emit("new room" , name);
    })
    socket.on('join to room' , event => {
            socket.join(event);
            joinPlayer(socket,event);
            socket.emit("you join the room" , event);
    })
    socket.on("privet msg" , (msg,roomName) => {
        let user = map.get(socket.id)
        io.to(roomName).emit("to privet server" , msg , user);
    })

    /************************************************** */ 
    socket.on('from user' , event => {
        let currentRoom = privateRoom.get(event.room);
        currentRoom.play(event);
        
    })
    socket.on('help' , event => {
        let currentRoom = privateRoom.get(event.room);
        currentRoom.help(event);
    })
    /**************** test ******************** */

    socket.on("test" , event => {
        if (testCount === 0 ){
        let name  = "ali";
        let data ={
            number:2,
        }
        socket.join(name);
        createGame(socket , data, name);        
        socket.emit("you join the room" , name);
        socket.broadcast.emit("new room" , name);
        testCount++
        }
        else {
            let event = "ali"
            socket.join(event);
            joinPlayer(socket,event);
            socket.emit("you join the room" , event);
        }

    })
})

server.listen(3000 , () => {
    console.log('server is runing');
})
