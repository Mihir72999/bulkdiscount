'use client'
import { notFound, useParams} from 'next/navigation';
import Loading from '../../../../components/loading';
import { useGetProductSettings} from '../../../../lib/hooks';
import { useEffect, useState } from 'react';

const ProductInfo = () => {
   const {setting = [] , isLoading} = useGetProductSettings() as {setting:[] | never[] , isLoading:boolean} 
   const {pid} = useParams() as {pid:string}
   const [findSetting , setSetting] = useState<{id:string , name:string}[]>([])
   if(isLoading){
    return <Loading/>
   }
   if(setting.length === 0){
    notFound()
   }
   useEffect(()=>{
    if(setting.length > 0){
        const find = setting.filter((data:{id:string , name:string})=> data.id === pid)
        setSetting(find ?? [])
    }
   },[setting])
    return (
        <div>Its a product Settings {findSetting[0]?.name} info page</div>
    );
};

export default ProductInfo;
