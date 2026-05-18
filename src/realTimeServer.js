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

  const buildTimeLabel = () =>
    new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  io.on("connection", (socket) => { 
    const user = getUserFromCookie(socket.request.headers.cookie);

    Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .then((messages) => {
        const ordered = messages.reverse();
        socket.emit('history', ordered.map((m) => ({
          user: m.user,
          alertType: m.alertType || 'General',
          message: m.message,
          date: m.date || m.createdAt.toLocaleTimeString(),
        })));
      })
      .catch((err) => {
        console.error('Error fetching history:', err && err.message);
      });

    socket.on("registerUser", ({ user: registeredUser }) => {
      socket.data.user = registeredUser || user;
    });

    socket.on("alert", ({ alertType, message }) => {
      const payload = {
        user: socket.data.user || user,
        alertType: alertType || 'General',
        message: (message || '').trim(),
        date: buildTimeLabel(),
      };

      if (payload.message === '') {
        return;
      }

      Message.create({
        user: payload.user,
        alertType: payload.alertType,
        message: payload.message,
        date: payload.date,
      }).catch((err) => console.error('Persist message error:', err && err.message));

      io.emit('alert', payload);
    });
  });
};
