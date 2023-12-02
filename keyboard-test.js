// Constants
const restart = document.getElementById("reset");
const keyMap = {};

// Add every key to a map
document.querySelectorAll(".key").forEach(key => {
    keyMap[key.id] = key;
})

// Keyboard inputs for the webpage
document.addEventListener("keydown", function (e) {
    // e.preventDefault();

    if (keyMap[e.code]) {
        keyMap[e.code].classList.remove("pressed");
        keyMap[e.code].classList.add("press");
    }
})

document.addEventListener("keyup", async function (e) {
    if (keyMap[e.code]) {
        await new Promise(r => setTimeout(r, 200));
        keyMap[e.code].classList.remove("press");
        keyMap[e.code].classList.add("pressed");
    }
})

// Reset the keyboard test
const resetKeyboardTest = () => {
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("pressed");
    })
}

// Reset the keyboard test when clicking the shortcut hint
restart.onclick = function () {
    resetKeyboardTest();
}
