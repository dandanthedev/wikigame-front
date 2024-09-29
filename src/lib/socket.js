import io from 'socket.io-client';
import { goto } from '$app/navigation';
import { name } from './stores.js';

import { env } from '$env/dynamic/public';
const socket = io(env.PUBLIC_SOCKET_URL);

let socketsListening = false;



if (localStorage.getItem('name')) {
    name.set(localStorage.getItem('name'));
    socket.emit('signOn', {
        name: localStorage.getItem('name'),
        id: localStorage.getItem('id')
    });
}



function listenToSockets() {
    socketsListening = true;

    socket.on('join', (pin) => {
        goto('/' + pin);
    });

    socket.on('name', (newName) => {
        name.set(newName);
    });


    socket.on('gameEnded', () => {
        name.set('');
        goto('/');
    });

    socket.on("joinError", (err) => {
        alert(err);
        goto('/');
    });

    socket.on('gotoScores', (theGame) => {
        goto(`/${theGame}/scores`);
    });


    socket.on("id", (id) => {
        localStorage.setItem('id', id);
    });


    if (!localStorage.getItem('id')) socket.emit("generateId")
}

if (!socketsListening) listenToSockets();

export default socket;