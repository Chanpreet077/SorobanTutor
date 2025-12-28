import express from "express";
import prisma from "../prismaClient.js";
import requireAuth from "../middleware/requireAuth.js";
import { validateState, stateToNumber } from "../utils/soroban.js";
import { generateProblem } from "../utils/problems.js";
import { numberToState } from "../utils/numberToState.js";

const router = express.Router();

/**
 * POST /attempts
 * Start a new practice attempt (creates a problem + expected answer)
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { prompt, expectedAnswer } = generateProblem();

    const attempt = await prisma.attempt.create({
      data: {
        userId: req.user.id,
        prompt,
        expectedAnswer,
      },
    });

    res.status(201).json({ attempt });
  } catch (err) {
    console.error("POST /attempts error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/**
 * GET /attempts
 * List attempts for the logged-in user (newest first)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ attempts });
  } catch (err) {
    console.error("GET /attempts error:", err);
    res.status(500).json({ error: "server error" });
  }
});






/**
 -POST /attempts/:id/hint
 -body: { currentState }
 -returns: { rodIndex, beadType, direction, reason }
 */
router.post("/:id/hint", requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.id;
    const { currentState } = req.body;

    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ error: "attempt not found" });
    }
    if (typeof attempt.expectedAnswer !== "number") {
      return res.status(400).json({ error: "expectedAnswer missing on attempt" });
    }

    const err = validateState(currentState);
    if (err) return res.status(400).json({ error: err });

    const currentValue = stateToNumber(currentState);
    const targetState = numberToState(attempt.expectedAnswer);

    // find a rod where current digit differs from target digit
    for (let i = 0; i < 15; i++) {
      const curDigit = (currentState.heaven[i] ? 5 : 0) + currentState.earth[i];
      const tgtDigit = (targetState.heaven[i] ? 5 : 0) + targetState.earth[i];

      if (curDigit !== tgtDigit) {
        // decide how to move towards target
        const direction = curDigit < tgtDigit ? "up" : "down";

        // choose beadType to adjust simplest:
        // if need to cross 5 boundary, hint heaven toggle first
        const curHeaven = currentState.heaven[i];
        const tgtHeaven = targetState.heaven[i];

        if (curHeaven !== tgtHeaven) {
          return res.json({
            rodIndex: i + 1,
            beadType: "heaven",
            direction: direction,
            reason: `Adjust 5-bead on rod ${i + 1} to match target digit`,
          });
        }

        // otherwise adjust earth beads
        return res.json({
          rodIndex: i + 1,
          beadType: "earth",
          direction: direction,
          reason: `Adjust 1-beads on rod ${i + 1} to match target digit`,
        });
      }
    }

    // if no differences, you're already at the answer
    return res.json({
      done: true,
      reason: "Current state already matches expected answer",
      currentValue,
    });
  } catch (e) {
    console.error("HINT ERROR:", e);
    res.status(500).json({ error: "server error" });
  }
});



/**
 * POST /attempts/:id/finish
 * Finishes attempt: computes final soroban value from last move and marks correct/incorrect
 */
router.post("/:id/finish", requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.id;

    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ error: "attempt not found" });
    }

    const lastMove = await prisma.move.findFirst({
      where: { attemptId },
      orderBy: { createdAt: "desc" },
    });

    if (!lastMove) {
      return res.status(400).json({ error: "no moves logged for this attempt" });
    }

    const finalValue = stateToNumber(lastMove.afterState);

    if (typeof attempt.expectedAnswer !== "number") {
      return res.status(400).json({ error: "expectedAnswer missing on attempt" });
    }

    const EPS = 1e-7;
    const correct = Math.abs(finalValue - attempt.expectedAnswer) <= EPS;

    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        finishedAt: new Date(),
        correct,
        userAnswer: finalValue,
      },
    });

    res.json({ attempt: updated, finalValue });
  } catch (err) {
    console.error("FINISH ATTEMPT ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});



router.get("/:id", requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.id;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        moves: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ error: "attempt not found" });
    }

    res.json({ attempt });
  } catch (err) {
    console.error("GET /attempts/:id error:", err);
    res.status(500).json({ error: "server error" });
  }
});


export default router;
