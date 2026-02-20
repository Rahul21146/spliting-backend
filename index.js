// require("dotenv").config();

// // Ensure models and associations are registered before routes/controllers are required
// const { syncDatabase } = require("./database/init");

// const express = require("express");
// const cors = require('cors');
// const fileUpload = require("express-fileupload");
// const { cloudinaryConnect } = require("./config/cloudnary");

// const app = express();

// app.use(express.json());
// // Allow the frontend origin to be configured via `FRONTEND_URL` in the environment.
// // Useful when backend is deployed separately (Render) and frontend is on Vercel or similar.
// const frontendOrigin = process.env.FRONTEND_URL || "https://spliting-frontend.vercel.app";
// app.use(cors({ origin: frontendOrigin }));
// app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// // Now require routes/controllers (models & associations are already registered when database/init was required above)
// const authRoutes = require("./routes/route");
// app.use("/spliting/v1", authRoutes);

// (async () => {
//   try {
//   // Ensure DB models & associations are synced before handling requests
//   // Use { alter: true } only in development to apply safe schema changes
//   const dev = process.env.NODE_ENV === 'development' || process.env.DEV === 'true';
//   await syncDatabase({ alter: dev });
//   } catch (err) {
//     console.log("DB Error:", err);
//   }
// })();

// cloudinaryConnect();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

require("dotenv").config();

const { syncDatabase } = require("./database/init");

const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { cloudinaryConnect } = require("./config/cloudnary");

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const LedgerMember = require("./models/LedgerMember");
const ChatMessage = require("./models/chatMessage");

const app = express();

app.use(express.json());

const frontendOrigin =
  process.env.FRONTEND_URL || "https://spliting-frontend.vercel.app";

app.use(cors({ origin: frontendOrigin }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

const authRoutes = require("./routes/route");
app.use("/spliting/v1", authRoutes);

(async () => {
  await syncDatabase({ alter: true });
})();

cloudinaryConnect();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: frontendOrigin,
    methods: ["GET", "POST"],
  },
});

// 🔐 SOCKET AUTH
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.user.id);

  socket.on("join_ledger", async ({ ledger_id }) => {
    const member = await LedgerMember.findOne({
      where: {
        ledger_id,
        user_id: socket.user.id,
      },
    });

    if (!member) {
      return socket.emit("error", "Not authorized");
    }

    socket.join(`ledger_${ledger_id}`);
  });

  socket.on("send_message", async ({ ledger_id, message }) => {
    const member = await LedgerMember.findOne({
      where: {
        ledger_id,
        user_id: socket.user.id,
      },
    });

    if (!member) return;

    const savedMessage = await ChatMessage.create({
      ledger_id,
      sender_id: socket.user.id,
      message,
    });

    io.to(`ledger_${ledger_id}`).emit(
      "receive_message",
      savedMessage
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
