const socket = io();

const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message");
const allMessages = document.querySelector("#all-messages");
const typingIndicator = document.querySelector("#typing-indicator");
const chatDate = document.querySelector("#chat-date");
const chatUser = localStorage.getItem("chatUser") || "Usuario";
const chatAvatar = localStorage.getItem("chatAvatar") || "/img/anonimo.png";

chatDate.textContent = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

socket.emit("registerUser", {
  user: chatUser,
  avatar: chatAvatar,
});

// render helper
const appendMessage = ({ user, avatar, message, date }) => {
  const msg = document.createRange().createContextualFragment(`
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
  allMessages.append(msg);
};

const typingUsers = new Set();
let typingTimeoutId;

const renderTypingIndicator = () => {
  if (typingUsers.size === 0) {
    typingIndicator.textContent = "";
    typingIndicator.classList.add("d-none");
    return;
  }

  const users = Array.from(typingUsers);
  const label =
    users.length === 1
      ? `${users[0]} está escribiendo...`
      : `${users.slice(0, 2).join(" y ")} están escribiendo...`;

  typingIndicator.textContent = label;
  typingIndicator.classList.remove("d-none");
};

const emitTyping = () => {
  socket.emit("typing");

  clearTimeout(typingTimeoutId);
  typingTimeoutId = setTimeout(() => {
    socket.emit("stopTyping");
  }, 900);
};

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (message === "") {
    messageInput.focus();
    return;
  }

  socket.emit("message", message);
  socket.emit("stopTyping");
  messageInput.value = "";
  messageInput.focus();
});

messageInput.addEventListener("input", () => {
  if (messageInput.value.trim() === "") {
    clearTimeout(typingTimeoutId);
    socket.emit("stopTyping");
    return;
  }

  emitTyping();
});

messageInput.addEventListener("blur", () => {
  clearTimeout(typingTimeoutId);
  socket.emit("stopTyping");
});

socket.on("message", ({ user, avatar, message, date }) => {
  appendMessage({ user, avatar, message, date });
});

socket.on('history', (messages) => {
  messages.forEach((m) => appendMessage(m));
});

socket.on("typing", ({ user }) => {
  typingUsers.add(user);
  renderTypingIndicator();
});

socket.on("stopTyping", ({ user }) => {
  typingUsers.delete(user);
  renderTypingIndicator();
});
