export interface FormData {
    description: string;
    is_visible: boolean ;
    name: string;
    price: number;
    inventory_level: number;  
    type: string;

}

export interface TableItem {
    id: number;
    name: string;
    price: number;
    inventory_level: number;
}

export interface ListItem extends FormData {
    id: number;
}

export interface StringKeyValue {
    [key: string]: string;
}
