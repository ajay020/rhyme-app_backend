import { BaseItem, Item } from "./item.interface";
import { Items } from "./items.interface";

 const items: Items = {
    1 :{
        id: 1,
        title:"Now",
        author:"You",
        description:"Where are you now?"
    },
    2 :{
        id: 2,
        title:"Thoughts",
        author:"subconscious",
        description:"You are your thoughts."
    },
};

export const findAll = async () : Promise<Items> => Object.values(items);

export const find = async (id:number) : Promise<Item> => items[id];

export const create = async (newItem : BaseItem) : Promise<Item> => {
    const id = new Date().valueOf();
    items[id] = {id, ...newItem};
    return items[id];
}

export const update  = async (id: number, itemUpdate: BaseItem) : Promise<  Item| null> =>{
    const item = find(id);
    if(!item) return null;

    items[id] = {id, ...itemUpdate};

    return items[id];
}

export const remove = async (id:number) : Promise<null | void> =>{
    const item = find(id);
    if(!item) return null;

    delete items[id];
}