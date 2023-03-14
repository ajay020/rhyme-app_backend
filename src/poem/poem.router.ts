import express from "express";
import { protect } from "../middleware/protect.middleware";
import * as poemController from "./poem.controller";

export const poemRouter = express.Router();

poemRouter
  .route("/")
  .get(poemController.getAllPoems)
  .post(protect, poemController.createPoem);

poemRouter
  .route("/:id")
  .get(poemController.getPoemById)
  .put(protect, poemController.updatePoem)
  .delete(protect, poemController.deletePoem);

// // GET all poems
// poemRouter.get("/", poemController.getAllPoems);

// // POST create new poem
// poemRouter.post("/", protect, poemController.createPoem);

// // PUT update poem

// poemRouter.put("/:id", protect, poemController.updatePoem);

// //DELETE poem

// poemRouter.delete("/:id", protect, poemController.deletePoem);
