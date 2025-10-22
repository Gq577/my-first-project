const Websocket = require('ws');
const http = require('http');
const fs = require('fs');
const { type } = require('os');

const server = http.createServer((req,res) => {
    if (req.url === '/')
    {
        fs.readFile('index.html' , (err,data) => {
            res.end(data);
        })
    }
    if(req.url === '/css.css')
    {
        fs.readFile('css.css' , (err,data) => {
            res.end(data);
        })
    }
})

function cards(number){
    if (number === '+4')
    {
        number = 4;
    }
    if (number === '+2')
    {
        number = 2;
    }
    let b = 'blue';
    let g = 'green';
    let y = 'yellow';
    let r = 'red';
    let bl = 'black';
const arr = [{n:1, c:b} , {n:2 , c:b} , {n:3 , c:b} ,  {n:4, c:b} , {n:5 , c:b} , {n:6 , c:b},  {n:7 , c:b} ,{n:8 , c:b} , {n:9 , c:b} , {n:0 , c:b}
    ,        {n:1, c:g} , {n:2 , c:g} , {n:3 , c:g} ,  {n:4, c:g} , {n:5 , c:g} , {n:6 , c:g},  {n:7 , c:g} ,{n:8 , c:g} , {n:9 , c:g} , {n:0 , c:g}
    ,        {n:1, c:y} , {n:2 , c:y} , {n:3 , c:y} ,  {n:4, c:y} , {n:5 , c:y} , {n:6 , c:y},  {n:7 , c:y} ,{n:8 , c:y} , {n:9 , c:y} , {n:0 , c:y}
    ,        {n:1, c:r} , {n:2 , c:r} , {n:3 , c:r} ,  {n:4, c:r} , {n:5 , c:r} , {n:6 , c:r},  {n:7 , c:r} ,{n:8 , c:r} , {n:9 , c:r} , {n:0 , c:r},
             {n:'+4' , c:bl} , {n:"select color" , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , {n:'+4' , c:bl} , 
             {n:'stop' , c:y} , {n:'chenge dirction' , c:y} , {n:'+2' ,  c:y},
             {n:'stop' , c:b} , {n:'chenge dirction' , c:b} , {n:'+2' ,  c:b},
             {n:'stop' , c:g} , {n:'chenge dirction' , c:g} , {n:'+2' ,  c:g},
             {n:'stop' , c:r} , {n:'chenge dirction' , c:r} , {n:'+2' ,  c:r}
]
let cardPlay = [];
 for(let i = 0 ; i <number ; i++)
 {
    let min = 0;
    let max = 64;   
    let random = Math.floor(Math.random() *(max - min + 1)) + min;
    cardPlay.push(arr[random]);
 }
 console.log(arr.length)
 return cardPlay;
}

let cardPlus = {
    color: -1,
    number:-1
}
const clients = new Map();

const ws =new Websocket.Server({server:server})

let contOFplay = 0;

ws.on('connection' , (socket) => {
    contOFplay++

        clients.set(`ID${contOFplay}` ,socket);

        function userSend(number , data){
            if (number === 2){number = 0};
            const user = ['ID1' , 'ID2'];
            const player = clients.get(user[number])
            if (player && player.readyState === Websocket.OPEN)
            {
                player.send(JSON.stringify(data))
            }
        }

        function sendTOall(data){
            ws.clients.forEach(element => {
                if (element &&element.readyState === Websocket.OPEN)
                {
                    element.send(JSON.stringify(data))
                }                
            });
        }
        if (contOFplay ===2)
        {
            userSend(0 ,{
                type:'order',
                order:0
            })
            userSend(1 , {
                type:'order',
                order:1
            })
            /*send to all doesnt work */
            userSend(0 , {
                type:'cards',
                cards:cards(10)
            })
            userSend(1 , {
                type:'cards',
                cards:cards(10)
            })
            userSend(0 , {
                type:'start',
            })
        }

    socket.on('message' , (event) => {

        const data = JSON.parse(event);
        let cardInfo  = {
            type:'lastcard',
            color:data.color,
            number:data.number,
            playerNumber: data.order
        }
        if (data.type === 'play a card')
        {
            if (data.number === 'select color')
            {
                sendTOall(cardInfo);
                userSend(data.order + 1 , {type:'start'});
            }
            else if (data.number === 'stop' || data.number === 'chenge dirction')
            {
                sendTOall(cardInfo);
                userSend(data.order , {type:'start'});
            }
            else if (data.number === '+4')
            {
                let x = data.number.split('');
                cardPlus.number = Number(x[1]);
                sendTOall(cardInfo)
                userSend(data.order +1 , {type:"ready-or-not"});
            }
            else if (data.number === '+2')
            {
                let x = data.number.split('');
                cardPlus.number = Number(x[1]);
                sendTOall({
                    type:'lastcard',
                    color:data.color,
                    number:data.number,
                    playerNumber: data.order
                })
                userSend(data.order +1 , {type:"+2"});
            }
            else 
            {
                sendTOall(cardInfo);
                userSend(data.order + 1, {type: 'start'})
            }
        }
        if (data.type === 'help')
        {
            if (data.state)
            {
                userSend(data.order , {
                    type:'cards',
                    cards:cards(1)
                })
                userSend(data.order + 1, {type:'start'})
            }
            else {
                userSend(data.order , {
                    type:'cards',
                    cards:cards(cardPlus.number),
                })
                cardPlus.number = 0;
                userSend(data.order + 1 , {type:'start'});
            }
        }
        if (data.type === 'yes')
        {
            let x = data.number.split('');
            cardPlus.number += Number(x[1]);
            sendTOall(cardInfo)
            userSend(data.order + 1, {type:'ready-or-not'})
        }
    })
})
server.listen(3000 , ()=> {
    console.log('server is running')
})