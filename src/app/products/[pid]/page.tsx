'use client'
import { notFound, useParams, useRouter } from 'next/navigation';
import ErrorMessage from '../../../../components/error';
import Form from '../../../../components/forms';
import Loading from '../../../../components/loading';
import { useSession } from '../../../../context/session';
import { useProductInfo, useProductList } from '../../../../lib/hooks';
import { FormData } from '../../../../types';

const ProductInfo = () => {
    const router = useParams();
    const postRouter = useRouter() 
    const encodedContext = useSession()?.context;
    const pid = Number(router?.pid);
    const { error, isLoading, list = [], mutateList } = useProductList();
    const { isLoading: isInfoLoading, product } = useProductInfo(pid, list);
    const { description, is_visible, name, price, inventory_level, type } = product ?? {};
    const formData = { description, is_visible, name, price, inventory_level, type };

    const handleCancel = () => postRouter.push('/products');

    const handleSubmitData = async (data: FormData) => {
        try {
            const filteredList = list.filter((item:any) => item.id !== pid);
            const { description, is_visible, name, price, inventory_level, type } = data;
            const apiFormattedData = { description,is_visible, name, price, inventory_level, type };

            // Update local data immediately (reduce latency to user)
            mutateList([...filteredList, { ...product, ...data }], false);

            // Update product details
            await fetch(`/api/products/${pid}?context=${encodedContext}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiFormattedData),
            });

            // Refetch to validate local data
            mutateList();
            postRouter.push('/products');
        } catch (error) {
            console.error('Error updating the product: ', error);
        }
    };
    if (isLoading || isInfoLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;
    if(!list) return notFound()
    return (
        <Form formData={formData} onCancel={handleCancel} onSubmit={handleSubmitData} />
    );
};

export default ProductInfo;
