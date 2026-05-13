const login = document.querySelector("#form");
const usernameInput = document.querySelector("#username");
const avatarInput = document.querySelector("#avatar");
const avatarPreviewWrap = document.querySelector("#avatar-preview-wrap");
const avatarPreview = document.querySelector("#avatar-preview");

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

avatarInput.addEventListener("change", async () => {
  const [file] = avatarInput.files;

  if (!file) {
    avatarPreviewWrap.classList.add("d-none");
    avatarPreview.removeAttribute("src");
    return;
  }

  const previewUrl = await readFileAsDataUrl(file);
  avatarPreview.src = previewUrl;
  avatarPreviewWrap.classList.remove("d-none");
});

login.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = usernameInput.value.trim();
  const avatarFile = avatarInput.files[0];

  if (user === "") {
    alert("Please enter a username");
    usernameInput.focus();
    return;
  }

  if (!avatarFile) {
    alert("Please upload an image");
    avatarInput.focus();
    return;
  }

  const avatarDataUrl = await readFileAsDataUrl(avatarFile);

  document.cookie = `username=${encodeURIComponent(user)}`;
  localStorage.setItem("chatUser", user);
  localStorage.setItem("chatAvatar", avatarDataUrl);
  document.location.href = "/";
});
