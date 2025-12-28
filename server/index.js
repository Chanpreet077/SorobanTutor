import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import requireAuth from "./middleware/requireAuth.js";
import attemptsRoutes from "./routes/attempts.js";
import movesRoutes from "./routes/moves.js";
import { stateToNumber } from "./utils/soroban.js";



const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


// auth routes
app.use("/auth", authRoutes);
//attempt routes
app.use("/attempts", attemptsRoutes);
//move routes
app.use(movesRoutes);



// test protected route
app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Soroban Tutor API running" });
});


//test

app.post("/debug/stateToNumber", (req, res) => {
  try {
    const value = stateToNumber(req.body);
    res.json({ value });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
