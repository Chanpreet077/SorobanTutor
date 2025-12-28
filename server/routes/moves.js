import express from "express";
import prisma from "../prismaClient.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * POST /attempts/:id/moves
 * body: { beforeState, afterState, rodIndex?, beadType?, direction? }
 */
router.post("/attempts/:id/moves", requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.id;
    const { beforeState, afterState, rodIndex, beadType, direction } = req.body;

    // validate required fields
    if (beforeState == null || afterState == null) {
      return res.status(400).json({ error: "beforeState and afterState are required" });
    }

    // ensure attempt belongs to logged-in user
    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ error: "attempt not found" });
    }

    // create move
    const move = await prisma.move.create({
      data: {
        attemptId,
        beforeState,
        afterState,
        rodIndex: rodIndex ?? null,
        beadType: beadType ?? null,
        direction: direction ?? null,
      },
    });

    res.status(201).json({ move });
  } catch (err) {
    console.error("POST move error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/**
 * GET /attempts/:id/moves
 * list moves for one attempt
 */
router.get("/attempts/:id/moves", requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.id;

    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ error: "attempt not found" });
    }

    const moves = await prisma.move.findMany({
      where: { attemptId },
      orderBy: { createdAt: "asc" },
    });

    res.json({ moves });
  } catch (err) {
    console.error("GET moves error:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
