// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBI41EwRowGEIaIAwNTdwt8NT8EvXqr42U",
    authDomain: "giochat-d1382.firebaseapp.com",
    projectId: "giochat-d1382",
    storageBucket: "giochat-d1382.appspot.com",
    messagingSenderId: "230361253130",
    appId: "1:230361253130:web:3613fd10fbcb1f1d7ca6f3",
    measurementId: "G-TJ6X39W1LB"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const socket = io();
let roomId;
let username;
let termsAccepted = false;

// Initialize total user count starting from 23
let totalUsersOverall = 23;
const dailyIncrease = 3;

// Calculate the total users based on the number of days since a specific date
const calculateTotalUsers = () => {
    const startDate = new Date("2024-09-23");
    const today = new Date();
    const timeDifference = today - startDate;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return totalUsersOverall + daysPassed * dailyIncrease;
};

// Show terms modal immediately on page load
$(document).ready(() => {
    $("#termsModal").modal("show");
    document.getElementById("totalUserCount").textContent = calculateTotalUsers();
});

document.getElementById("joinBtn").onclick = () => {
    roomId = document.getElementById("roomId").value;
    username = document.getElementById("username").value;

    if (roomId && username && document.getElementById("acceptTerms").checked) {
        termsAccepted = true;
        $("#termsModal").modal("hide");
        document.getElementById("chat-form").style.display = "block";
        socket.emit("joinRoom", roomId, username);
        document.getElementById("totalUserCount").textContent = calculateTotalUsers();
    } else if (!document.getElementById("acceptTerms").checked) {
        alert("You must accept the terms and conditions to proceed.");
    } else {
        alert("Please enter both Room ID and Username.");
    }
};

socket.on("message", (msg) => {
    const item = document.createElement("li");
    item.innerHTML = msg;
    document.getElementById("messages").appendChild(item);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
});

socket.on("updateUserCount", (count) => {
    document.getElementById("userCount").textContent = count;
    document.getElementById("totalUserCount").textContent = calculateTotalUsers();
});

document.getElementById("sendBtn").onclick = () => {
    const msg = document.getElementById("chat-input").value;
    if (msg) {
        socket.emit("chatMessage", msg, roomId, username);
        document.getElementById("chat-input").value = "";
    }
};

document.getElementById("sendImageBtn").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgData = e.target.result;
            socket.emit("imageMessage", imgData, roomId, username);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };
    input.click();
};

const chatInput = document.getElementById("chat-input");
chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = chatInput.scrollHeight + "px";
});
