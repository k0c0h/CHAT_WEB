const socket = io();

const alertForm = document.querySelector("#alert-form");
const alertMessageInput = document.querySelector("#alert-message");
const alertTypeInput = document.querySelector("#alert-type");
const alertsList = document.querySelector("#all-alerts");
const dashboardDate = document.querySelector("#dashboard-date");
const emitterBadge = document.querySelector("#emitter-name");

const getCookieValue = (name) => {
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!match) {
    return "Usuario";
  }

  return decodeURIComponent(match.split("=").slice(1).join("="));
};

const chatUser = getCookieValue("username");

dashboardDate.textContent = new Date().toLocaleDateString("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

emitterBadge.textContent = chatUser;

socket.emit("registerUser", {
  user: chatUser,
});

const appendAlert = ({ user, alertType, message, date }) => {
  const card = document.createElement("article");
  card.className = "alert-item";

  const header = document.createElement("div");
  header.className = "alert-item__header";

  const userLabel = document.createElement("span");
  userLabel.className = "alert-item__user";
  userLabel.textContent = user;

  const typeLabel = document.createElement("span");
  typeLabel.className = `alert-chip alert-chip--${String(alertType || "general").toLowerCase()}`;
  typeLabel.textContent = alertType || "General";

  const timeLabel = document.createElement("span");
  timeLabel.className = "alert-item__time";
  timeLabel.textContent = date;

  const body = document.createElement("p");
  body.className = "alert-item__message";
  body.textContent = message;

  header.append(userLabel, typeLabel, timeLabel);
  card.append(header, body);
  alertsList.prepend(card);
};

alertForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const alertMessage = alertMessageInput.value.trim();

  if (alertMessage === "") {
    alertMessageInput.focus();
    return;
  }

  socket.emit("alert", {
    alertType: alertTypeInput.value,
    message: alertMessage,
  });

  alertMessageInput.value = "";
  alertMessageInput.focus();
});

socket.on("alert", ({ user, alertType, message, date }) => { 
  appendAlert({ user, alertType, message, date });
});

socket.on("history", (alerts) => {
  alerts.forEach((item) => appendAlert(item));
});

alertMessageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    alertForm.requestSubmit();
  }
});

document.querySelectorAll("[data-alert-type]").forEach((button) => {
  button.addEventListener("click", () => {
    alertTypeInput.value = button.dataset.alertType;
    alertMessageInput.focus();
  });
});
