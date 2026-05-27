const socket = io();

const chatForm = document.querySelector("#message-form");
const chatInput = document.querySelector("#message");
const messagesContainer = document.querySelector("#all-messages");
const typingIndicator = document.querySelector("#typing-indicator");
const dateLabel = document.querySelector("#chat-date");
const storedUsername = localStorage.getItem("chatUser") || "Usuario";
const storedAvatarUrl = localStorage.getItem("chatAvatar") || "/img/anonimo.png";

dateLabel.textContent = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

socket.emit("registerUser", {
  user: storedUsername,
  avatar: storedAvatarUrl,
});

const renderMessage = ({ user, avatar, message, date }) => {
  const messageNode = document.createRange().createContextualFragment(`
    <div class="message">
      <div class="image-container">
        <img src="${avatar || '/img/anonimo.png'}" alt="Avatar de ${user}" />
      </div>
      <div class="message-body">
        <div class="user-info">
          <span class="username">${user}</span>
          <span class="time">${date}</span>
          <p>
            ${message}
          </p>
        </div>
      </div>
    </div>
  `);
  messagesContainer.append(messageNode);
};

const usersTyping = new Set();
let typingTimeoutHandle;


const renderTypingIndicator = () => {
  if (usersTyping.size === 0) {
    typingIndicator.textContent = "";
    typingIndicator.classList.add("d-none");
    return;
  }


  const activeUsers = Array.from(usersTyping);
  const label =
    activeUsers.length === 1
      ? `${activeUsers[0]} está escribiendo...`
      : `${activeUsers.slice(0, 2).join(" y ")} están escribiendo...`;


  typingIndicator.textContent = label;
  typingIndicator.classList.remove("d-none");
};



const emitTyping = () => {
  socket.emit("typing");

  clearTimeout(typingTimeoutHandle);
  typingTimeoutHandle = setTimeout(() => {
    socket.emit("stopTyping");
  }, 900);

};



chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = chatInput.value.trim();
  if (message === "") {
    chatInput.focus();
    return;
  }

  socket.emit("message", message);
  socket.emit("stopTyping");
  chatInput.value = "";
  chatInput.focus();
});


chatInput.addEventListener("input", () => {
  if (chatInput.value.trim() === "") {
    clearTimeout(typingTimeoutHandle);
    socket.emit("stopTyping");
    return;
  }

  emitTyping();
});


chatInput.addEventListener("blur", () => {
  clearTimeout(typingTimeoutHandle);
  socket.emit("stopTyping");
});


socket.on("message", ({ user, avatar, message, date }) => {
  renderMessage({ user, avatar, message, date });
});


socket.on('history', (messages) => {
  messages.forEach((message) => renderMessage(message));
});

socket.on("typing", ({ user }) => {
  usersTyping.add(user);
  renderTypingIndicator();
});

socket.on("stopTyping", ({ user }) => {
  usersTyping.delete(user);
  renderTypingIndicator();
});