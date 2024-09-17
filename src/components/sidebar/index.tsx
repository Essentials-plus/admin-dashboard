import { Package2 } from 'lucide-react';
import Link from 'next/link';

import SidebarMenu from '@/components/sidebar-menu';
import { APP_NAME } from '@/config/app';
import routes from '@/config/routes';

const Sidebar = () => {
  return (
    <div className="hidden border-r bg-background md:block">
      <div className="sticky left-0 top-0 z-50 flex size-full max-h-screen flex-col gap-2">
        <div className="flex h-14 shrink-0 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href={routes.home}
            className="flex items-center gap-2 font-semibold"
          >
            <Package2 className="size-6" />
            <span className="">{APP_NAME}</span>
          </Link>
          {/* <Button variant="outline" size="icon" className="ml-auto size-8">
            <Bell className="size-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button> */}
        </div>
        <div className="flex-1">
          <SidebarMenu />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
