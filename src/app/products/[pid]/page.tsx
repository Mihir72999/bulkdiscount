'use client'
import { notFound, useParams} from 'next/navigation';
import Loading from '../../../../components/loading';
import { useGetProductSettings} from '../../../../lib/hooks';
import { MoveLeft } from 'lucide-react';
import ProductMenu from '@/app/section/productMenue';
import { ProductMenuProps } from '../../../../types';

const ProductInfo = () => {
   const {setting = [] , isLoading} = useGetProductSettings() as {setting:ProductMenuProps[] | never[] , isLoading:boolean}
   const {pid} = useParams() as {pid:string}
   
   if(isLoading){ 
    return <Loading/>
   }

   const findSetting = setting.find((item)=> item.id === Number(pid)) 

   if(!findSetting){
    notFound()
   }

   

    return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>
       <div> <MoveLeft /> Bundle deal</div>
       <ProductMenu products={findSetting.product} />
       
    </div>

  <div>
    Preview
  </div>
</div>
    );
};

export default ProductInfo;
