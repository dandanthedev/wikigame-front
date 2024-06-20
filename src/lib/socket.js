import io from 'socket.io-client';
import { goto } from '$app/navigation';
import { name } from './stores.js';

import { env } from '$env/dynamic/public';
const socket = io(env.PUBLIC_SOCKET_URL);

let socketsListening = false;


if (localStorage.getItem('name')) {
    name.set(localStorage.getItem('name'));
    socket.emit('name', localStorage.getItem('name'));
}



function listenToSockets() {
    socketsListening = true;


    socket.on('noName', () => {
        goto('/');
    });
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


    socket.on('gameCreated', (pin) => {
        socket.emit('join', pin);
    });

    socket.on('gotoScores', (theGame) => {
        goto(`${window.location.host}/${theGame}/scores`);
    });
}

if (!socketsListening) listenToSockets();

export default socket;