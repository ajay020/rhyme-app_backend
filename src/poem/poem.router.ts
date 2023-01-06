import express,{Request,Response} from 'express';
import { Poem } from '../models/poem';
import { PoemType } from './poem.interface';

export const poemRouter = express.Router();

// GET all poems
poemRouter.get('/', async(req : Request, res:Response) =>{
    try {
       const poems: PoemType[] =  await Poem.find();
       return res.status(200).json(poems);
    } catch (error) {
        res.status(500).send(error);
    }
})

// POST create new poem
poemRouter.post('/', async(req : Request, res:Response) =>{
    try {
        const newPoem:PoemType = req.body;
        const poem = new Poem(newPoem);
        const savedPoem  = await poem.save();
        return res.status(200).json(savedPoem);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PUT update poem

poemRouter.put('/:id', async (req:Request, res:Response) =>{
    try {
        const poemId = req.params.id;
        const newUpdate : Partial<PoemType> = req.body;
        let poem  = await Poem.findById(poemId);
        if(!poem){
            return res.status(404).json("Resource not found");
        }

        poem = Object.assign(poem, newUpdate);

        let savedPoem = await poem.save()
        return res.status(200).json(savedPoem)

    } catch (error:any) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

//DELETE poem

poemRouter.delete("/:id", async (req:Request, res:Response) =>{
    try {
        const id = req.params.id;
        await Poem.findByIdAndDelete(id);
        res.status(200).json("Poem deleted");
    } catch (error:any) {
        res.status(500).send(error.message);
    }
})