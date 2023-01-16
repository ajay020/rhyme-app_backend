import express, { Request, Response } from "express";
import { protect } from "../middleware/protect.middleware";
import { Poem } from "../models/poem";
import { PoemType } from "./poem.interface";

export const getAllPoems = async (req: Request, res: Response) => {
    try {
      const poems: PoemType[] = await Poem.find();
      return res.status(200).json(poems);
    } catch (error) {
      res.status(500).send(error);
    }
  }

export const createPoem = async (req: Request, res: Response) => {
    try {
      const poem = new Poem({ author: req.user._id, ...req.body });
      const newPoem = await poem.save();
      return res.status(200).json(newPoem);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  export const updatePoem = async (req: Request, res: Response) => {
    try {
      const poemId = req.params.id;
      const newUpdate: Partial<PoemType> = req.body;
      const currUser = req.user;
      
      let poem = await Poem.findById(poemId);
      if (!poem) {
        return res.status(404).json("Resource not found");
      }
  
      if(currUser.id !== poem.author){
          return res.status(403).json("You can't delete others poem.");
      } 
  
      poem = Object.assign(poem, newUpdate);
  
      let savedPoem = await poem.save();
      return res.status(200).json(savedPoem);
    } catch (error: any) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  export const deletePoem = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
  
      const currUser = req.user;
      const poem = await Poem.findById(id);
  
      if(!poem){
          return res.status(404).json("No poem found with this id " + id);
      }
  
      if(currUser.id !== poem.author){
          return res.status(403).json("You can't delete others poem.");
      }    
  
      await Poem.findByIdAndDelete(id);
      res.status(200).json("Poem deleted");
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }