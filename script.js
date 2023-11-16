// Constants
const textRegion = document.getElementsByClassName("text-region");
const userText = document.getElementById("user-text");
const targetText = document.getElementById("target-text");
const timer = document.getElementById("timer");
const wpm = document.getElementById("wpm");
const restart = document.getElementById("restart");
const defaultTime = 30; // The default time of the typing test
const numRandomWords = 100; // The number of random words to be called by the API

// Variables
let startedTest = false;
let initialTime = timer.value; // Value stored in the time input
let testTime = 0; // Time taken for the test
let correctStored = 0; // Number of correct characters stored when random words refreshed on the same test
let dataMain; // The random word data being displayed
let dataSide; // A queued set of random words (for reset performance)

// API
const randomWordsAPI = "https://random-word-api.herokuapp.com/word?number=" + numRandomWords;

// Actions when loading the webpage
window.onload = () => {
    timer.value = defaultTime;
    getRandomWords();
}

// Returns the current webpage 
function getPage() {
    return window.location.pathname.split("/").pop();
}

// Keyboard inputs for the webpage
document.addEventListener("keydown", function (e) {
    // Reset the typing test by pressing ESC
    if (e.key === "Escape") {
        resetTypingTest();
    }
});

// Disable moving text cursor with mouse click
userText.addEventListener("mousedown", function (e) {
    if (startedTest) {
        e.preventDefault();
        userText.focus();
    }
});

// Disable moving text cursor with arrow keys and full word delete
userText.addEventListener("keydown", function (e) {
    if (startedTest) {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowDown" || (e.ctrlKey || e.metaKey) && e.key === "Backspace") {
            e.preventDefault();
        }
    }
});

// Darken text colour when text region is focused
userText.addEventListener("focusin", function () {
    if (!startedTest) {
        textRegion[0].classList.remove("unfocused");
    }
});

// Lighten text colour when text region is unfocused
userText.addEventListener("focusout", function () {
    if (!startedTest) {
        textRegion[0].classList.add("unfocused");
    }
});

// Check if the user text matches the target text
userText.addEventListener("input", () => {
    let userChars; // The chars of the user text
    let targetChars; // The chars of the target text

    targetChars = document.querySelectorAll(".target-chars");
    targetChars = Array.from(targetChars); // Create an array from <span> elements
    userChars = userText.value.split(""); // Array of user text

    targetChars.forEach((char, index) => {
        if (char.innerText === userChars[index]) { // If user text char matches target text char
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

    // Generate new set of words when the visible words have been filled
    if (userText.value.length === targetChars.length) {
        correctStored += document.querySelectorAll(".correct").length;
        switchRandomWords();
        userText.value = "";
    }
});

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
    removeOverflow();

    const response = await fetch(randomWordsAPI);
    dataSide = await response.json(); // Queue next set of random words (for reset performance)
}

// Switch current words with queued ones
function switchRandomWords() {
    dataMain = dataSide;
    getRandomWords();
}

// Remove overflow of words
function removeOverflow() {
    while (true) {
        const lastElem = targetText.lastElementChild;

        if (lastElem) {
            const lastChar = lastElem.innerText.trim();

            if (targetText.scrollHeight > targetText.clientHeight || (lastChar !== " " && lastChar !== "")) {
                targetText.removeChild(lastElem);
            } else {
                break;
            }
        } else {
            break;
        }
    }
}

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
        testTime++;
    }
}

// Reset the typing test
const resetTypingTest = () => {
    clearInterval(typingTimer);
    switchRandomWords();
    userText.value = "";
    userText.removeAttribute("readonly");
    timer.value = initialTime;
    timer.removeAttribute("disabled");
    timer.style.color = "var(--off-grey)";
    timer.style.border = "0.1rem solid var(--side-grey)";
    wpm.value = "";
    wpm.style.border = "0.1rem solid transparent";
    startedTest = false;
    testTime = 0;
    correctStored = 0;
}

// Reset the typing test when clicking the shortcut hint
restart.onclick = function () {
    switch (getPage()) {
        case "index.html":
            textRegion[0].classList.add("unfocused");
            resetTypingTest();
    }
};

// Start the typing test
const startTest = () => {
    if (startedTest) {
        return;
    }

    initialTime = parseInt(timer.value);

    if (initialTime < 0) {
        initialTime = Math.abs(initialTime);
        timer.value = initialTime;
    }

    if (isNaN(initialTime)) {
        initialTime = defaultTime;
        timer.value = initialTime;
    }

    removeOverflow();
    
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
    wpm.style.border = "0.1rem solid var(--side-grey)";

    // Calculate the WPM (incorrect > correct -> negative WPM -> 0)
    totalChars = document.querySelectorAll(".correct").length;
    wpm.value = (testTime > 0)? Math.max(Math.round((totalChars + correctStored) / 5 / (testTime / 60)), 0) : 0;
}
