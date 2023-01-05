export interface BaseItem {
    title: string;
    description: string;
    author:string;
  }
  
export interface Item extends BaseItem {
    id: number;
  }