'use client'
import { notFound, useParams} from 'next/navigation';
import Loading from '../../../../components/loading';
import { useGetProductSettings} from '../../../../lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoveLeft } from 'lucide-react';

const ProductInfo = () => {
   const {setting = [] , isLoading} = useGetProductSettings() as {setting:[{id:number , name:string}] | never[] , isLoading:boolean}
   const {pid} = useParams() as {pid:string}
   
   
   const findSetting = setting.find((item)=> item.id === Number(pid)) 

   if(!findSetting){
    notFound()
   }

   if(isLoading){ 
    return <Loading/>
   }
   
    return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>
    <CardHeader>
      <CardTitle><MoveLeft /> Bundle deal</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Left content */}
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Preview</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Right content */}
    </CardContent>
  </Card>
</div>
    );
};

export default ProductInfo;
