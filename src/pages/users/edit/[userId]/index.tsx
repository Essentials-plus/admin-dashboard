import EditUserForm from '@/components/edit-user-form';
import { NextSeo } from 'next-seo';

const EditUserPage = () => {
  return (
    <>
      <NextSeo title="Edit User" />
      <EditUserForm />
    </>
  );
};

export default EditUserPage;
