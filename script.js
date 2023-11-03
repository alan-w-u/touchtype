// Constants
const randomWordsAPI = "https://random-word-api.herokuapp.com/word?number=100";
const userText = document.getElementById("user-text");
const targetText = document.getElementById("target-text");
const timer = document.getElementById("timer");
const wpm = document.getElementById("wpm");
const restart = document.getElementById("restart");

// Variables
let startedTest = false;
let initialTime = timer.value;
let time = 0;
let dataMain; // The random word data being displayed
let dataSide; // A queued set of random words (for reset performance)

// Actions when loading the webpage
window.onload = () => {
    getRandomWords();
}

// Keyboard inputs (e)
document.addEventListener("keydown", function (e) {
    // Add functions below that require key inputs
    keyReset(e);
}, false);

// Reset the typing test when clicking the shortcut hint
restart.onclick = function () {
    resetTest();
};

// Fetch random words from the API
const getRandomWords = async () => {
    if (dataMain == null) {
        const response = await fetch(randomWordsAPI);
        dataMain = await response.json();
    }

    let randomWordsArray = dataMain; // Array of random words fetched from the API
    let randomWordsString = randomWordsArray.join(" "); // Convert array of words into single string

    // Split the string into <span> elements to allow changing colours of individual chars
    let randomWordsChars = randomWordsString.split("").map((targetChar) => {
        return "<span class='target-chars'>" + targetChar + "</span>"; // Return the char <span> element
    });

    targetText.innerHTML = randomWordsChars.join(""); // Set target text to the string of random words
    const response = await fetch(randomWordsAPI);
    dataSide = await response.json(); // Queue next set of random words (for reset performance)
}

// Check if the user text matches the target text
userText.addEventListener("input", () => {
    let userChars; // The chars of the user text
    let targetChars; // The chars of the target text

    targetChars = document.querySelectorAll(".target-chars");
    targetChars = Array.from(targetChars); // Create an array from <span> elements
    userChars = userText.value.split(""); // Array of user text

    targetChars.forEach((char, index) => {
        if (char.innerText == userChars[index]) { // If user text char matches target text char
            char.classList.add("correct");
        } else if (userChars[index] == null) { // No user text written
            if (char.classList.contains("correct")) {
                char.classList.remove("correct");
            } else {
                char.classList.remove("incorrect");
            }
        } else { // If user text char does not match target text char
            if (!char.classList.contains("incorrect")) {
                char.classList.add("incorrect");
            }
        }
    });
});

// Set the timer
const startTimer = () => {
    typingTimer = setInterval(updateTimer, 1000);
}

// Update the timer
function updateTimer() {
    if (timer.value == 0) {
        endTest();
    } else {
        timer.value--;
        time++;
    }
}

// Reset the typing test by pressing ESC
function keyReset(e) {
    if (e.keyCode == 27 && startedTest) {
        resetTest();
    }
}

// Reset the typing test
const resetTest = () => {
    clearInterval(typingTimer);
    dataMain = dataSide;
    getRandomWords();
    userText.value = "";
    userText.removeAttribute("readonly");
    timer.value = initialTime;
    timer.removeAttribute("disabled");
    timer.style.color = "var(--side-grey)";
    timer.style.border = "0.1rem solid var(--side-grey)";
    wpm.value = "";
    wpm.style.border = "0.1rem solid transparent";
    startedTest = false;
    time = 0;
}

// Start the typing test
const startTest = () => {
    if (startedTest) {
        return;
    }
    if (timer.value === "" || timer.value < 0) {
        timer.value = 60;
    }
    timer.setAttribute("disabled", "true");
    timer.style.color = "var(--main-grey)";
    timer.style.border = "0.1rem solid transparent";
    startedTest = true;
    startTimer();
}

// End the typing test
const endTest = () => {
    clearInterval(typingTimer);
    userText.setAttribute("readonly", "true");
    timer.style.color = "var(--off-grey)";

    // Calculate the WPM (incorrect > correct -> negative WPM -> 0)
    totalChars = document.querySelectorAll(".correct").length - document.querySelectorAll(".incorrect").length;
    wpm.value = Math.max(Math.round(totalChars / 5 / (time / 60)), 0);
    wpm.style.border = "0.1rem solid var(--side-grey)";
}
