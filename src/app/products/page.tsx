'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactElement } from 'react';
import ErrorMessage from '../../../components/error';
import Loading from '../../../components/loading';
import { useProductList } from '../../../lib/hooks';
import { TableItem } from '../../../types';

const Products = () => {
    // const [itemsPerPage, setItemsPerPage] = useState(10);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [columnHash, setColumnHash] = useState('');
    // const [direction, setDirection] = useState('ASC');
    const router = useRouter();
    const { error, isLoading, list = []} = useProductList(
    //   {
    //   page: String(currentPage),
    //   limit: String(itemsPerPage),
    //   ...(columnHash && { sort: columnHash }),
    //   ...(columnHash && { direction: direction.toLowerCase() }),
    // }
  );
    // const itemsPerPageOptions = [10, 20, 50, 100];
    const tableItems: TableItem[] = list.map(({ id, inventory_level: stock, name, price }:{id:any,inventory_level:any,name:any,price:any}) => ({
        id,
        name,
        price,
        inventory_level: stock,
    }));

    // const onItemsPerPageChange = (newRange:any) => {
    //     setCurrentPage(1);
    //     setItemsPerPage(newRange);
    // };

    // const onSort = (newColumnHash: string, newDirection: TableSortDirection) => {
    //     setColumnHash(newColumnHash === 'stock' ? 'inventory_level' : newColumnHash);
    //     setDirection(newDirection);
    // };

    const renderName = (id: number, name: string): ReactElement => (
        <Link href={`/products/${id}`}>
            <p>{name}</p>
        </Link>
    );

    const renderPrice = (price: number): string => (
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
    );

    const renderInventoryLevel = (inventory_level: number): ReactElement => (
        inventory_level > 0
        ? <small>{inventory_level}</small>
        : <small className="font-bold text-red-600">0</small>
    );

    const renderAction = (id: number): ReactElement => (
        // <Dropdown
        //     items={[ { content: 'Edit product', onItemClick: () => router.push(`/products/${id}`), hash: 'edit' } ]}
        //     toggle={<Button iconOnly={<MoreHorizIcon color="secondary60" />} variant="subtle" />}
        // />
          <select
      defaultValue=""
      onChange={() => router.push(`/products/${id}`)}
      className="border rounded px-2 py-1"
    >
      <option value="" disabled>
        Actions
      </option>

      <option value="edit">
        Edit product
      </option>
    </select>
    );

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Product name
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stock
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Price
          </th>

          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Action
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {tableItems.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              {renderName(item.id, item.name)}
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
              {renderInventoryLevel(item.inventory_level)}
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
              {renderPrice(item.price)}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-right">
              {renderAction(item.id)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
    );
};

export default Products;
