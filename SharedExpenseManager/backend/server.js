const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const messRoutes = require("./routes/messRoutes");
const fixedExpensesRoutes = require("./routes/fixedExpensesRoutes");
const mealRoutes = require("./routes/mealRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Server is running!");
});
// API Routes
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/mess", messRoutes);
app.use("/api/fixed-expenses", fixedExpensesRoutes);
app.use("/api/meals", mealRoutes);

app.use(errorHandler);


app.listen(config.port, () => console.log(`🚀 Server running on port ${config.port}`));
