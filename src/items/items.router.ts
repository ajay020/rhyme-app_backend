import express, {Request, Response, NextFunction} from 'express';
import { Item, BaseItem } from './item.interface';
import * as ItemService from './items.service';
export const itemsRouter = express.Router();


itemsRouter.get('/', async (req:Request, res: Response, next:NextFunction) =>{
    try {
        const items = await ItemService.findAll()
        res.json(items);    
    } catch (error) {
        // res.status(500).send(error);
        next(error);
    }
});

// get items/:id

itemsRouter.get("/:id", async(req : Request, res : Response, next:NextFunction) =>{
    const id : number = parseInt(req.params.id, 10);
    console.log(id);
    try {
        const item : Item = await ItemService.find(id);
        if(item){
           return res.status(200).json(item);
        }
        res.status(404).send("Item not found");
    } catch (error: any) {
        // res.status(500).send(error.message);
        next(error);
    }
})

// POST items

itemsRouter.post("/", async (req:Request, res:Response) =>{
    try {
        const item: BaseItem  = req.body;
        const newItem = await ItemService.create(item);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

// PUT items/:id

itemsRouter.put("/:id", async(req:Request, res:Response) =>{
    const id = parseInt(req.params.id, 10);
    console.log(id);
    try {
        const itemUpdate = req.body;
        const existingItem: Item = await ItemService.find(id);
        if(existingItem){
            const updatedItem = await ItemService.update(id,itemUpdate);
            res.status(200).json(updatedItem);
        }
        const newItem = await ItemService.create(itemUpdate);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

// DELETE items/:id

itemsRouter.delete("/:id", async (req: Request, res:Response) =>{
    try {
        const id = parseInt(req.params.id, 10);
        console.log(id);

        await ItemService.remove(id);
        return res.status(204).send("Deleted item");
    } catch (error:any) {
        res.status(500).send(error.message);
    }
})
