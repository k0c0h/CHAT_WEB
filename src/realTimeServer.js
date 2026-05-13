module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer);

  const getUserFromCookie = (cookieHeader = "") => {
    const cookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("username="));

    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "Usuario";
  };

  io.on("connection", (socket) => {
    const user = getUserFromCookie(socket.request.headers.cookie);

    socket.on("message", (message) => {
      io.emit("message", {
        user,
        message,
        date: new Date().toLocaleTimeString(),
      });
    });

    socket.on("typing", () => {
      socket.broadcast.emit("typing", { user });
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("stopTyping", { user });
    });
  });
};
