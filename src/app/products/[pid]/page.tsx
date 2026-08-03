'use client'
import { notFound, useParams, useRouter} from 'next/navigation';
import Loading from '../../../../components/loading';
import { useGetProductSettings} from '../../../../lib/hooks';
import { MoveLeft } from 'lucide-react';
import ProductMenu from '@/app/section/productMenue';
import { ProductMenuProps } from '../../../../types';

const ProductInfo = () => {
   const {setting = [] , isLoading} = useGetProductSettings() as {setting:ProductMenuProps[] | never[] , isLoading:boolean}
   const {pid} = useParams() as {pid:string}
   const router = useRouter();
   if(isLoading){ 
    return <Loading/>
   }

   const findSetting = setting.find((item)=> item.id === Number(pid)) 

   if(!findSetting){
    notFound()
   }

   

    return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
  <div className="flex gap-2" onClick={() => router.back()}>
    <MoveLeft /> Bundle deal
  </div>
  <div className="flex flex-col gap-4 border justify-center items-center border-amber-50 rounded-lg p-4 shadow-md">
       
       <ProductMenu products={findSetting.product} />
       
    </div>

  <div className="flex flex-col gap-4 justify-center items-center border border-amber-50 rounded-lg p-4 shadow-md">
    Preview
  </div>
</div>
    );
};

export default ProductInfo;
