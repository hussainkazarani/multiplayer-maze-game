import { validateName } from '../../globals/global.js';

const socket = io();
const playBtn = document.querySelector('.btn');
const input = document.getElementById('player-name');
const input_class = document.querySelector('.namebox');
let isButtonClick = false;

// on load
window.addEventListener('load', () => {
    if (localStorage.getItem('playerToken')) {
        console.log('(F) Cleared LocalStorage in home');
        navigator.sendBeacon('/api/remove-player', JSON.stringify({ username: localStorage.getItem('playerToken') }));
        localStorage.clear();
    }
});

// listening to input
input.addEventListener('input', () => {
    if (input.value.length == 0) {
        input_class.classList.remove('success');
        input_class.classList.remove('error');
    }
    if (!validateName(input.value.trim())) {
        input_class.classList.remove('success');
        input_class.classList.add('error');
    }
    if (validateName(input.value.trim())) {
        isButtonClick = false;
        socket.emit('player:check-username', input.value);
    }
});

// on clicking play button
playBtn.addEventListener('click', () => {
    if (input.value.length > 0) {
        isButtonClick = true;
        if (!validateName(input.value.trim())) {
            input_class.classList.remove('success');
            input_class.classList.add('error');
            return;
        }
        socket.emit('player:check-username', input.value);
    }
});

// on username not being available
socket.on('player:username-taken', () => {
    input_class.classList.remove('success');
    input_class.classList.add('error');
});

// on username being available
socket.on('player:username-available', () => {
    input_class.classList.remove('error');
    input_class.classList.add('success');
    if (isButtonClick) {
        localStorage.setItem('playerToken', input.value);
        console.log(`(F) LocalStorage for user: ${input.value}`);
        navigateWithFade('/client/src/pages/rooms/rooms.html');
    }
});
