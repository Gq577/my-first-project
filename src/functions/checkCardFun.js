import { gameState } from "./varabils.js";

export function checkCard (){
    let arrOfindexs = [];

    gameState.players[gameState.indexOfplayer].cards.forEach((card , i) => {
        if (   card.n === gameState.lastcard.number 
            || card.c === gameState.lastcard.color
            || card.c === 'black'|| gameState.lastcard.number === -1 )
        {
            arrOfindexs.push(i);
        }
    });
    return arrOfindexs;
}

export function checkPlusCard(x){
    let arrOfindexs = [];
    gameState.players[gameState.indexOfplayer].cards.forEach((card  , i)=> {
        if (('+2' === card.n &&(gameState.lastcard.color === card.c || x))|| card.n === '+4')
            {
                arrOfindexs.push(i);
            }
        })
        return arrOfindexs;
    
}
export function deletCardFromUser(data){
    gameState.players[gameState.indexOfplayer].cards.splice(data.indexOfCard , 1)
}