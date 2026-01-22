        const lastDiv = document.getElementById('last');
        const container = document.getElementById('container')
        const plus = document.getElementById('plus');
        const lastCardtext = document.getElementById('text');
        const lastCardAfter = document.getElementById("after");
        const lastCarBefore = document.getElementById("before");

         let myCard = [];
         let order = -1;

         function clearAll(op){
            if (op !== 1 )
            {
                op.div.style.display = 'none';
                myCard.splice(myCard.indexOf(op) , 1);
            }

            plus.style.border = 'none';
            plus.onclick = null;

            myCard.forEach(element => {
                element.div.style.opacity = '0.5';
                element.div.onclick = null;
            })
         }
         function playAcard(op ,Acolor) {
            op.div.onclick = () => {

                let newColor = (op.color === 'black') ? Acolor:op.color;

                socket.emit("from user" ,{
                    room:nameOfroom,
                    indexOfplayer:order,
                    indexOfCard:myCard.indexOf(op),
                    number:op.number,
                    color:newColor,
                })

                clearAll(op);                
            }
         }
         function helpCard(){
            plus.style.border = '1px solid black',
            plus.onclick = () => {
                socket.emit('help',{
                    room:nameOfroom,
                    typeOfHelp: 'normal',
                    indexOfplayer:order
                })
                clearAll(1);
            }
         }
         function blackCard(cardOpj){
            const blackCard = cardOpj.div;


            blackCard.onclick = () => {
                blackCard.onclick = null;

                const colors = ['red','yellow', 'green','blue'];
                colors.forEach(color => {
                    const colorDiv = document.createElement('div');
                    Object.assign(colorDiv.style , {
                        background:color,
                        width:  '50px',
                        height: '50px'
                    });
                    colorDiv.onclick = () => playAcard(cardOpj ,color);

                    blackCard.appendChild(colorDiv)
                })
            }
         }
         function creatDiv (father , text , Color)
         {
            
            const newDiv = document.createElement('div');
            newDiv.id = 'bodyCard';
            newDiv.style.backgroundColor = Color;

            if (text === '+4' || text === '+2') darwStayle(newDiv , text , Color);
            else
            {
                const cardText = document.createElement("div");
                cardText.textContent = text;
                cardText.style.color = Color;
                cardText.id = "cardText";
                newDiv.appendChild(cardText);
            }
            const beforeCardText = document.createElement("div");
            beforeCardText.textContent = text;
            beforeCardText.id = "beforeCardText";
            newDiv.appendChild(beforeCardText);

            const AfterCardText = document.createElement("div");
            AfterCardText.textContent = text;
            AfterCardText.id = "afterCardText";
            newDiv.appendChild(AfterCardText);
            newDiv.style.opacity = "0.5";
            
            father.appendChild(newDiv);
            return newDiv;
         }
         function darwStayle(father , text ,Color){
            const mainContainer = document.createElement("div");
            const card1 = document.createElement("div");
            const card2 = document.createElement("div");
            mainContainer.id = "x";
            card1.id = "x1";
            card2.id = 'x2';
            card1.style.backgroundColor = Color;
            card2.style.backgroundColor = Color;

            mainContainer.appendChild(card1)
            mainContainer.appendChild(card2);

            father.appendChild(mainContainer);
         }

         /*===========================================
         socket 
         ===========================================*/
         socket.on('order' , data => {
            order = data.order
         })
         socket.on('playNow' , data => {
            helpCard();

            data.index.forEach(index => {
                const PlayDiv = myCard[index];
                PlayDiv.div.style.opacity = '1';

                if (PlayDiv.color === 'black') blackCard(PlayDiv);
                else playAcard(PlayDiv);
            })
         })

         socket.on('cards' , data => {

            data.cards.forEach(card => {
            myCard.push({div:creatDiv(container , card.n , card.c), color:card.c , number:card.n});
            })
         }
         )
         socket.on('lastcard' , data => {
            lastDiv.style.backgroundColor = data.card.color;
            lastCarBefore.textContent = data.card.number;
            lastCardAfter.textContent = data.card.number;
            lastCardtext.textContent = data.card.number;
            lastCardtext.style.color = data.card.color;
         })
         socket.on('winner' , () => {
            alert('you are the winner')
         })
         socket.on('loser', () => {
            alert('you are the loser')
         })