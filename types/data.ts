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
    type:string;
    description:string; 
    is_visible:boolean;
}

export interface StringKeyValue {
    [key: string]: string;
}


 // lib/api/widget-settings.ts
export interface WidgetSettingsPayload {
 borderColor: string;
 borderRadius: number;
 product_ids :string,
 name: string,
 description: string,
 widget_title: string
}
