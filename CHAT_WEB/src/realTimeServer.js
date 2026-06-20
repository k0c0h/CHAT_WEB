module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const Sentry = require("@sentry/node");
  const io = new Server(httpServer);
  const Message = require('./models/Message');

  const getUsernameFromCookie = (cookieHeader = "") => {
    const cookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("username="));

    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
  };

  const formatMessage = (messageDocument) => ({
    user: messageDocument.user,
    avatar: messageDocument.avatar,
    alertType: messageDocument.alertType || 'General',
    message: messageDocument.message,
    date: messageDocument.date || messageDocument.createdAt.toLocaleTimeString(),
  });

  io.on("connection", (socket) => {
    const username = getUsernameFromCookie(socket.request.headers.cookie);
    if (!username) {
      const error = new Error("Conexion sin cookie de username. Asegúrate de que el cliente envíe la cookie correctamente.");
      Sentry.captureException(error, {
        tags: { source: "socket.io", event: "error" },
        extra: { socketID: socket.id },
      });
    }

    Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .then((messages) => {
        const messagesInChronologicalOrder = messages.reverse();
        socket.emit('history', messagesInChronologicalOrder.map(formatMessage));
      })
      .catch((err) => {
        console.error('Error fetching history:', err && err.message);
      });

    socket.on("registerUser", ({ user: registeredUsername, avatar }) => {
      socket.data.user = registeredUsername || username;
      socket.data.avatar = avatar || "/img/anonimo.png";
    });

    socket.on("message", (message) => {
      const payload = {
        user: socket.data.user || username,
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
      }).catch((err) => {
        Sentry.captureException(err, {
          tags: { source: "socket.io", event: "message" },
          extra: { socketID: socket.id },
        });
        console.error('Persist message error:', err && err.message);
      });

      io.emit('message', payload);
    });

    socket.on("typing", () => {
      socket.broadcast.emit("typing", { user: socket.data.user || username });
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("stopTyping", { user: socket.data.user || username });
    });
  });
};