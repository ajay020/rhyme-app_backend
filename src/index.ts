import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { itemsRouter } from './items/items.router';
import { errorHandler } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { requestLogger } from './middleware/requestLogger.middleware';
import { configureDB } from './config/db';
import { poemRouter } from './poem/poem.router';
import { authRouter } from './auth/auth.router';

const app = express();
dotenv.config();
configureDB();

if(!process.env.PORT){
    process.exit(1);
}

const PORT: number  = parseInt(process.env.PORT, 10) || 8000;

app.use(express.static('images'))  
app.use(express.static('htmls')) 
app.use(cors());
app.use(express.json());
app.use(requestLogger) 
app.use("/api/items", itemsRouter);
app.use("/api/poem", poemRouter);
app.use("/api/auth", authRouter);


app.use(errorHandler);
app.use(notFoundMiddleware);


/** Server Activation */
app.listen(PORT, () => console.log("Server started on PORT " + PORT ));
