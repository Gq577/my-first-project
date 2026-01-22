
function maintain(){
   loginPage.style.display = 'none';
   lobby.style.display = 'none';
   roomPage.style.display = 'grid';
   socket.emit("test" , 'heelo')
}
maintain();