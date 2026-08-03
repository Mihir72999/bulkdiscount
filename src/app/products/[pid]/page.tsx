'use client'
import { notFound, useParams} from 'next/navigation';
import Loading from '../../../../components/loading';
import { useGetProductSettings} from '../../../../lib/hooks';
import { useEffect, useState } from 'react';

const ProductInfo = () => {
   const {setting = [] , isLoading} = useGetProductSettings() as {setting:[{id:number , name:string}] | never[] , isLoading:boolean} 
   const {pid} = useParams() as {pid:string}
   if(isLoading){
    return <Loading/>
   }
   
   const findSetting = setting.find((item)=> item.id === Number(pid)) 

   if(!findSetting){
    notFound()
   }
    return (
        <div>Its a product Settings {findSetting?.name} info page</div>
    );
};

export default ProductInfo;
