const login = document.querySelector("#form");
const usernameInput = document.querySelector("#username");

login.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = usernameInput.value.trim();

  if (user === "") {
    alert("Ingresa tu nombre para continuar");
    usernameInput.focus();
    return;
  }

  document.cookie = `username=${encodeURIComponent(user)}; path=/; max-age=86400`;
  document.location.href = "/";
});
