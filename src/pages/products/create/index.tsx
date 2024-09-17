import CreateOrUpdateProductForm from '@/components/create-or-update-product-form';
import { NextSeo } from 'next-seo';

const CreateProductPage = () => {
  return (
    <>
      <NextSeo title="Create product" />
      <div className="container">
        <CreateOrUpdateProductForm />
      </div>
    </>
  );
};

export default CreateProductPage;
