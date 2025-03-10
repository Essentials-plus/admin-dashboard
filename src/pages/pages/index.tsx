import routes from '@/config/routes';
import { GetServerSideProps } from 'next';

const Pages = () => {
  return null;
  // return (
  //   <section>
  //     <div className="grid grid-cols-5 gap-5">
  //       <Link href={routes.homePage} className="block">
  //         <Card className="px-5 py-12 text-center duration-200 hover:scale-105">
  //           <CardTitle>Edit Home Page</CardTitle>
  //         </Card>
  //       </Link>
  //       <Link href={routes.productsPage} className="block">
  //         <Card className="px-5 py-12 text-center duration-200 hover:scale-105">
  //           <CardTitle>Edit Products/Lifestyle Page</CardTitle>
  //         </Card>
  //       </Link>
  //     </div>
  //   </section>
  // );
};

export default Pages;
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: routes.homePage, // Replace with your target page
      permanent: false, // Set to true for a 308 redirect, false for a 307 redirect
    },
  };
};
