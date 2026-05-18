module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer);
  const Message = require('./models/Message');

  const getUserFromCookie = (cookieHeader = "") => {
    const cookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("username="));

    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "Usuario";
  };

  io.on("connection", (socket) => {
    const user = getUserFromCookie(socket.request.headers.cookie);

    Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .then((messages) => {
        const ordered = messages.reverse();
        socket.emit('history', ordered.map((m) => ({
          user: m.user,
          avatar: m.avatar,
          alertType: m.alertType || 'General',
          message: m.message,
          date: m.date || m.createdAt.toLocaleTimeString(),
        })));
      })
      .catch((err) => {
        console.error('Error fetching history:', err && err.message);
      });

    socket.on("registerUser", ({ user: registeredUser, avatar }) => {
      socket.data.user = registeredUser || user;
      socket.data.avatar = avatar || "/img/anonimo.png";
    });

    socket.on("message", (message) => {
      const payload = {
        user: socket.data.user || user,
        avatar: socket.data.avatar || '/img/anonimo.png',
        message,
        date: new Date().toLocaleTimeString(),
      };

      Message.create({
        user: payload.user,
        avatar: payload.avatar,
        alertType: payload.alertType,
        message: payload.message,
        date: payload.date,
      }).catch((err) => console.error('Persist message error:', err && err.message));

      io.emit('message', payload);
    });

    socket.on("typing", () => {
      socket.broadcast.emit("typing", { user: socket.data.user || user });
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("stopTyping", { user: socket.data.user || user });
    });
  });
};