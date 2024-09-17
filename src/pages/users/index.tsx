import Users from '@/views/users';
import { NextSeo } from 'next-seo';

const UsersPage = () => {
  return (
    <>
      <NextSeo title="Users" />
      <Users />
    </>
  );
};

export default UsersPage;
