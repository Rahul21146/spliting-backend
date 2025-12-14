require("dotenv").config();

// Ensure models and associations are registered before routes/controllers are required
const { syncDatabase } = require("./database/init");

const express = require("express");
const cors = require('cors');
const fileUpload = require("express-fileupload");
const { cloudinaryConnect } = require("./config/cloudnary");

const app = express();

app.use(express.json());
app.use(cors({ origin: `http://localhost:3000` }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// Now require routes/controllers (models & associations are already registered when database/init was required above)
const authRoutes = require("./routes/route");
app.use("/spliting/v1", authRoutes);

(async () => {
  try {
  // Ensure DB models & associations are synced before handling requests
  // Use { alter: true } only in development to apply safe schema changes
  const dev = process.env.NODE_ENV === 'development' || process.env.DEV === 'true';
  await syncDatabase({ alter: dev });
  } catch (err) {
    console.log("DB Error:", err);
  }
})();

cloudinaryConnect();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
