import { CartItem } from "./CartItem.interface";
export interface Cart {
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
}