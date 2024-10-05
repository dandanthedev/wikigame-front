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

    socket.on('checkNavigation', async (data) => {
        let { id, from, to, lang, redirectedFrom } = data;


        //check if redirect is valid
        if (redirectedFrom) {
            const redCheck = await fetch(
                `https://${lang}.wikipedia.org/w/api.php?redirects=1&format=json&origin=*&action=parse&prop=displaytitle&page=${redirectedFrom}`
            );
            const redCheckData = await redCheck.json();

            if (redCheckData?.parse?.redirects?.length > 0) {
                const last = redCheckData?.parse?.redirects[redCheckData.parse.redirects.length - 1];
                const redirectedTarget = last.to.replaceAll(' ', '_');
                if (redirectedTarget !== to) return socket.emit('checkNavigation', { id, result: false });
            }
        }

        const url = `https://api.wikimedia.org/core/v1/wikipedia/${lang}/page/${from}/with_html?redirects=0&disableeditsection=true`
        const response = await fetch(url);
        const json = await response.json();
        const html = json.html;
        if (!html) return socket.emit('checkNavigation', { id, error: true });
        if (!html.includes(`./${to}`) && !html.includes(`/${redirectedFrom}`))
            socket.emit('checkNavigation', {
                id,
                result: false
            });
        else socket.emit('checkNavigation', { id, result: true });
    });

    socket.on("cheater", () => {
        socket.disconnect();
        goto("/cheater");
    });

    if (!localStorage.getItem('id')) socket.emit("generateId")
}

if (!socketsListening) listenToSockets();

export default socket;