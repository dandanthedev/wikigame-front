import io from 'socket.io-client';
import { goto } from '$app/navigation';
import { name } from './stores.js';

import { env } from '$env/dynamic/public';
const socket = io(env.PUBLIC_SOCKET_URL);

socket.on('noName', () => {
    goto('/');
});
socket.on('join', (pin) => {
    goto('/' + pin);
});

socket.on('name', (newName) => {
    name.set(newName);
});

socket.on('start', (url) => {
    goto(url);
});

socket.on('gameEnded', () => {
    name.set('');
    goto('/');
});

export default socket;