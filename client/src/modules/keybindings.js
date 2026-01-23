export const keys = {
    up: false,
    right: false,
    down: false,
    left: false,
};

function handleKeyDown(event) {
    if (event.code == 'ArrowUp') keys.up = true;
    if (event.code == 'ArrowRight') keys.right = true;
    if (event.code == 'ArrowDown') keys.down = true;
    if (event.code == 'ArrowLeft') keys.left = true;
}
function handleKeyUp(event) {
    if (event.code == 'ArrowUp') keys.up = false;
    if (event.code == 'ArrowRight') keys.right = false;
    if (event.code == 'ArrowDown') keys.down = false;
    if (event.code == 'ArrowLeft') keys.left = false;
}

addEventListener('keydown', handleKeyDown);
addEventListener('keyup', handleKeyUp);

addEventListener('blur', () => {
    keys.up = false;
    keys.down = false;
    keys.left = false;
    keys.right = false;
});
