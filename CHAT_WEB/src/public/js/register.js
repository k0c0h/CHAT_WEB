const registerForm = document.querySelector("#form");
const usernameInput = document.querySelector("#username");
const avatarInput = document.querySelector("#avatar");
const avatarPreviewContainer = document.querySelector("#avatar-preview-wrap");
const avatarPreview = document.querySelector("#avatar-preview");

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

avatarInput.addEventListener("change", async () => {
  const [file] = avatarInput.files;

  if (!file) {
    avatarPreviewContainer.classList.add("d-none");
    avatarPreview.removeAttribute("src");
    return;
  }

  const previewUrl = await fileToDataUrl(file);
  avatarPreview.src = previewUrl;
  avatarPreviewContainer.classList.remove("d-none");
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const avatarFile = avatarInput.files[0];

  if (username === "") {
    alert("Ingresa tu nombre para continuar");
    usernameInput.focus();
    return;
  }

  if (!avatarFile) {
    alert("Please upload an image");
    avatarInput.focus();
    return;
  }

  const avatarDataUrl = await fileToDataUrl(avatarFile);

  document.cookie = `username=${encodeURIComponent(username)}`;
  localStorage.setItem("chatUser", username);
  localStorage.setItem("chatAvatar", avatarDataUrl);
  document.location.href = "/";
});
