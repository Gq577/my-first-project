const fs = require("fs");
const http  =require('http');
const Websocket = require('ws');

const server = http.createServer((req ,res) => {
    if (req.url === '/')
    {
        fs.readFile('index.html' , (err,data) => {
            if (err) console.log(err);
            res.end(data);
        })
    }
    if (req.url === '/style.css')
    {
        fs.readFile('style.css' , (err,data) => {
            if (err) console.log(err);
            res.end(data)
        })
    }
});
const ws = new Websocket.Server({server:server});

let MainEvent =  {
    play(data){
            setpsAfterPlay(data) 
            if(data.number === 'change dirction')
            {
                gameState.state = !gameState.state;
                playNowFunction();  
            }
            if (data.number === '+4')shortWayPlusCard(false ,data);
            if (data.number === '+2')shortWayPlusCard(true ,data);
            if (data.number === 'stop') 
            {
                if (gameState.state) gameState.indexOfplayer ++;
                else gameState.indexOfplayer--;
                playNowFunction();
            }
           
            else if (data.number !=='+4' && data.number !== '+2')playNowFunction();
    },
    help(data){
            if (gameState.PlussCardTotal === 0)
            {
                let storgeCardForUser = [...cards(1)];
                userSend(gameState.indexOfplayer ,  {
                    type:'cards',
                    cards:storgeCardForUser
                })
                storgeCardForUser.forEach(element => {
                    players[gameState.indexOfplayer].cards.push(element)
                })
                playNowFunction();
            }
            else if (gameState.PlussCardTotal > 0)
            {
                let storgeCardForUser = [...cards(gameState.PlussCardTotal)];
                userSend(gameState.indexOfplayer ,  {
                    type:'cards',
                    cards:storgeCardForUser
                })
                gameState.PlussCardTotal = 0;
                storgeCardForUser.forEach(element => {
                    players[gameState.indexOfplayer].cards.push(element)
                })
                playNowFunction();
            }
    }
}

let unieqID = 0;
const clients = new Map();
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

function cards(number){
    if (number === '+4')number = 4;
    
    if (number === '+2')number = 2;
    let arr2 = [];
    const color = ['blue' , 'red' , 'yellow' , 'green'];
    color.forEach(color => {
        for (i = 0 ; i < 10 ; i++)
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

function nextPlyer(state){
    if (gameState.indexOfplayer === players.length ) {gameState.indexOfplayer = 0;}
    else if (gameState.indexOfplayer === -1) {gameState.indexOfplayer = 1;}
    if (state) {gameState.indexOfplayer++}
    else {gameState.indexOfplayer--};
    if (gameState.indexOfplayer === players.length ) {gameState.indexOfplayer = 0;}
    else if (gameState.indexOfplayer === -1) {gameState.indexOfplayer = 1;}
}
function checkCard (){
    let arrOfindexs = [];
    // console.log(players[gameState.indexOfplayer].cards)
    players[gameState.indexOfplayer].cards.forEach(card => {
        if (   card.n === gameState.lastcard.number 
            || card.c === gameState.lastcard.color
            || card.c === 'black'|| gameState.lastcard.number === -1 )
        {
            arrOfindexs.push(players[gameState.indexOfplayer].cards.indexOf(card));
        }
    });
    return arrOfindexs;
}
function deletCardFromUser(data){
    players[gameState.indexOfplayer].cards.splice(data.indexOfCard , 1)
}

function userSend(index , data){
    if (players[index].socket.readyState === Websocket.OPEN)
    {
        players[index].socket.send(JSON.stringify(data))
    }
}

function checkPlusCard(x){
    let arrOfindexs = [];
    players[gameState.indexOfplayer].cards.forEach(card => {
        if (('+2' === card.n &&(gameState.lastcard.color === card.c || x))|| card.n === '+4')
            {
                arrOfindexs.push(players[gameState.indexOfplayer].cards.indexOf(card))//is it important?
            }
        })
        return arrOfindexs;
    
}
let players = [
    {ID:'ID0' , socket:null , cards:[]},
    {ID:'ID1' , socket:null , cards:[]}

]
function playNowFunction(){
    nextPlyer(gameState.state);
    userSend(gameState.indexOfplayer , {
        type:'playNow',
        index:checkCard(),
    });
}
function shortWayPlusCard(x ,data)
{
    let value = data.number.split('')
    gameState.PlussCardTotal = gameState.PlussCardTotal + Number(value[1]);
    nextPlyer(gameState.state)
    userSend(gameState.indexOfplayer , {
        type:'playNow',
        index:checkPlusCard(x)
    })
}
function sendTOall(data){
    ws.clients.forEach(element => {
        if (element &&element.readyState === Websocket.OPEN)
        {
            element.send(JSON.stringify(data))
        }                
    });
}

function setpsAfterPlay(data){
    console.log(players[gameState.indexOfplayer].cards.length)
    if (players[gameState.indexOfplayer].cards.length === 1)
    {
        console.log("someone  end the game");
        userSend(gameState.indexOfplayer , {
            type:'winner',
        })
        nextPlyer();
        userSend(gameState.indexOfplayer , {
            type:'loser',
        })
    }
    else {
    gameState.lastcard.number = data.number;
    gameState.lastcard.color =data.color;
    deletCardFromUser(data);
    sendTOall({
        type:'lastcard',
        card:gameState.lastcard
    })
    }
}
ws.on('connection' , socket => {
    players[numberOfUser].socket = socket;
    numberOfUser++;
    if (numberOfUser === 2)
    {

        for (let i = 0 ; i < players.length ; i++)
        {
            userSend(i , {
                type:'order',
                order:i
            })
            let copycard = [...cards(10)];
            userSend(i , {
                type:'cards',
                cards:copycard
            })

            players[i].cards = [...copycard];
            nextPlyer();
        }
        playNowFunction();
    }

    socket.on('message' , event => {
        let data;
        try {
             data = JSON.parse(event);
        } catch(error)
        {
            console.error(error)
        }
        const stateOfPlay = MainEvent[data.type];
        if (stateOfPlay)stateOfPlay(data);
    })
})

server.listen(3000 , () => {
    console.log('server is running');
});