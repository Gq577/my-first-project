let unieqID = 0;

export function cards(number){
    if (number === '+4')number = 4;
    
    if (number === '+2')number = 2;
    let arr2 = [];
    const color = ['#5555fd' , '#ffaa00' , '#ff5555' , '#55aa55'];
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
    let tmpArrForTest = [{c:"#ffaa00" , n:"change dirction" , Id:0} ,  {c:"#ffaa00" , n:5 , ID:2} , {c:"black" , n:"+4" , Id:3} , {c:"black" , n:"select color" , Id:4}];
    return tmpArrForTest;
     return cardPlay;
}