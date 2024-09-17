import CreateOrUpdateProductForm from '@/components/create-or-update-product-form';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

const EditProductPage = () => {
  const router = useRouter();
  const productId = router.query.productId as string;
  return (
    <>
      <NextSeo title="Edit product" />
      <CreateOrUpdateProductForm productId={productId} />
    </>
  );
};

export default EditProductPage;
