import express from 'express';
import http from "http";
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app);
app.use(express.static("files"));
const io = new Server (server);

/*-----------------------------------------------
play data
----------------------------------*/
let unieqID = 0;
let numberOfUser = 0;
const gameState = {
    PlussCardTotal:0,
    indexOfplayer: 0,
    lastcard : {
    number:-1,
    color:-1
    },
    state:true,
}
let players = [
    {ID:'ID0' , socket:null , cards:[]},
    {ID:'ID1' , socket:null , cards:[]},
    {ID:'ID2' , socket:null , cards:[]}
]
/*-------------------------------------------
main tools
-------------------------------------*/
function nextPlyer(){
    gameState.indexOfplayer = (gameState.indexOfplayer + (gameState.state ? 1:-1) +players.length)%players.length;
}

function userSend(type,index , data){
        players[index].socket.emit(type,JSON.stringify(data))
}

function sendTOall(data){
    io.emit('lastcard' , JSON.stringify(data))
}

function deletCardFromUser(data){
    players[gameState.indexOfplayer].cards.splice(data.indexOfCard , 1)
}

/*------------------------------------------------
create cards
---------------------------------------------------*/
function cards(number){
    if (number === '+4')number = 4;
    
    if (number === '+2')number = 2;
    let arr2 = [];
    const color = ['blue' , 'red' , 'yellow' , 'green'];
    color.forEach(color => {
        for (let i = 0 ; i < 10 ; i++)
        {
            arr2.push({c:color , n:i , Id:0});
        }
    })
    const speicals = ['change dirction', '+2', 'stop']
    color.forEach(color => {
        speicals.forEach(speical => {
            arr2.push({c:color , n:speical , Id:0})
        });
    });
    const balckCard = ['+4' , 'select color'];
    balckCard.forEach(Card => {
        arr2.push({c:'black' , n:Card , Id:0});
    })
let cardPlay = [];
 for(let i = 0 ; i <number ; i++)
 {
    let min = 0;
    let max = arr2.length - 1;   
    let random = Math.floor(Math.random() *(max - min + 1)) + min;
    let FirstDeepCopyCard = structuredClone(arr2[random]);
    if (cardPlay.includes(FirstDeepCopyCard))
    {
        let NextDeepCopyCard = structuredClone(FirstDeepCopyCard);
        cardPlay.push(NextDeepCopyCard);
    }
    else cardPlay.push(FirstDeepCopyCard);
    
 }
 for (let i= 0 ; i < cardPlay.length ; i++)
 {
    cardPlay[i].Id = unieqID++
 }

 return cardPlay;
}
/*----------------------------------------------------------
check card
-----------------------------------------------------------*/
function checkCard (){
    let arrOfindexs = [];

    players[gameState.indexOfplayer].cards.forEach((card , i) => {
        if (   card.n === gameState.lastcard.number 
            || card.c === gameState.lastcard.color
            || card.c === 'black'|| gameState.lastcard.number === -1 )
        {
            arrOfindexs.push(i);
        }
    });
    return arrOfindexs;
}

function checkPlusCard(x){
    let arrOfindexs = [];
    players[gameState.indexOfplayer].cards.forEach((card  , i)=> {
        if (('+2' === card.n &&(gameState.lastcard.color === card.c || x))|| card.n === '+4')
            {
                arrOfindexs.push(i)//is it important?
            }
        })
        return arrOfindexs;
    
}
/*-------------------------------------------------------------
play event
-----------------------------------------------*/

function play(data){
            setpsAfterPlay(data);
            switch(data.number){
                case"change dirction":
                    gameState.state = !gameState.state;
                    if (players.length === 2){
                        nextPlyer();
                        playNowFunction();
                    }
                    else playNowFunction();
                    break;
                case'+4':
                    shortWayPlusCard(false ,data);
                    break;
                case'+2':
                    shortWayPlusCard(true ,data);
                    break;
                case'stop':
                    nextPlyer();
                    playNowFunction();
                    break;
                default:
                    playNowFunction();
                    break;
            }
}
function help(data){
            if (gameState.PlussCardTotal === 0)
            {
                sendCard(1 , gameState.indexOfplayer);
                playNowFunction();
            }
            else if (gameState.PlussCardTotal > 0)
            {
                sendCard(gameState.PlussCardTotal , gameState.indexOfplayer);
                playNowFunction();
            }
}

function shortWayPlusCard(x ,data)
{
    let value = data.number.split('')
    gameState.PlussCardTotal = gameState.PlussCardTotal + Number(value[1]);
    nextPlyer()
    userSend('playNow',gameState.indexOfplayer , {
        index:checkPlusCard(x)
    })
}

function playNowFunction(){
    nextPlyer();
    userSend('playNow',gameState.indexOfplayer , {
        index:checkCard(),
    });
}

function setpsAfterPlay(data){
    if (players[gameState.indexOfplayer].cards.length === 1)
    {
        console.log("someone  end the game");
        userSend('winner',gameState.indexOfplayer ,{})
        nextPlyer();
        userSend('loser',gameState.indexOfplayer , {})
    }
    else {
    gameState.lastcard.number = data.number;
    gameState.lastcard.color  = data.color;
    deletCardFromUser(data);
    sendTOall({
        type:'lastcard',
        card:gameState.lastcard
    })
    }
}
function sendCard(count , index){
    let storgeCardForUser = [...cards(count)];
    userSend('cards',index ,  {
        cards:storgeCardForUser
    })
    gameState.PlussCardTotal = 0;
    storgeCardForUser.forEach(element => {
        players[index].cards.push(element)
    })
}

/**----------------------------------------------
 * io connection
 * -----------------------------------------*/

io.on('connection' , socket => {
    if (numberOfUser <players.length  ) players[numberOfUser].socket =socket;
    numberOfUser++;
    if (numberOfUser === players.length)
    {
        for (let i = 0 ; i < players.length ; i++)
        {
            userSend('order',i , {
                order:i
            })
            sendCard(10 , i);
            nextPlyer();
        }
        gameState.indexOfplayer = players.length -1 
        playNowFunction();   
    }

    socket.on('from user' , event => {
        let data;
        try {
             data = JSON.parse(event);
            play(data);
        } catch(error)
        {
            console.error('some one try to hack')
        }
    })
    socket.on('help' , data => {
        help();
    })
})

server.listen(3000 , () => {
    console.log('server is running');
});