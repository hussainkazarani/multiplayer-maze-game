export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setupCanvas();
window.addEventListener('resize', setupCanvas);
