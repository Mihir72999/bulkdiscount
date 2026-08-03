export interface DiscountRule {

    id:number;

    productId:number;

    qty:number;

    discount:number;

}


export interface ProductMenuProps {
    id: number;
    name: string;
    store_hash:string;
    description:string;
    product_ids:string;
    widget_title:string;
    borderColor:string;
    borderRadius:string;
    product:[{id:number , name:string}];
    rules:[
        {data:[{id:number, quantity_min:number, quantity_max:number, type:string, amount:string}]},
        {meta:{pagination:{total:number, per_page:number, current_page:number, total_pages:number , count:number,links:{current:string}}}}
    ]
}