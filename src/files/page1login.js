const user = document.getElementById('LoginUser');
const password = document.getElementById('LoginPassword');
const msg = document.getElementById('LoginMessage');
const button = document.getElementById('loginButton');
const loginPage = document.getElementById('loginPage');

button.addEventListener('click' , (d)=> {
    if(user.value === ''){
        msg.textContent = 'you must hava a name';
    }
    let a = password.value;
    if (a.length < 8 )
    msg.textContent = 'the password shoud be 8 digt or more';
    else {
        socket.emit('user login' ,{
            username:user.value,
            pass:password.value
        })
        user.value = '';
        password.value = '';
    }
})