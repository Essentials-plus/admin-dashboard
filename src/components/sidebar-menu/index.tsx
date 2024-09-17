import { Button } from '@/components/ui/button';
import {
  SidebarNavigationMenuItem,
  sidebarNavigationMenuItems,
} from '@/constants/sidebar-navigation-menu';
import { cn, isPathEqual } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const SidebarMenu = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  return (
    <>
      <nav className="grid items-start gap-1.5 text-base font-medium max-md:gap-2 md:px-2 md:text-sm lg:px-4">
        {sidebarNavigationMenuItems.map((item) => {
          return (
            <MenuItem
              menuItem={item}
              key={item.url}
              onLinkClick={onLinkClick}
            />
          );
        })}
      </nav>
    </>
  );
};

export default SidebarMenu;

const MenuItem = ({
  menuItem,
  onLinkClick,
}: {
  menuItem: SidebarNavigationMenuItem;
  onLinkClick?: () => void;
}) => {
  const router = useRouter();

  const isActiveMenu =
    (menuItem.url === '/' && isPathEqual(router.asPath, menuItem.url)) ||
    (menuItem.url !== '/' && router.asPath.startsWith(menuItem.url));
  const hasSubMenu = menuItem.submenuItems && menuItem.submenuItems?.length > 0;

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(isActiveMenu);

  useEffect(() => {
    setIsSubmenuOpen(isActiveMenu);
  }, [isActiveMenu]);

  return (
    <div className="overflow-auto">
      <Link
        onClick={onLinkClick}
        href={menuItem.url}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary relative [&>svg]:shrink-0 [&>svg]:size-5 md:[&>svg]:size-4 overflow-hidden w-full',
          isActiveMenu && 'bg-muted text-primary',
          hasSubMenu && 'pr-12'
        )}
      >
        {menuItem.icon}
        <span className="inline-block truncate">{menuItem.label}</span>

        {hasSubMenu && (
          <div className="absolute right-0 top-0 z-10 aspect-square h-full p-0.5">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSubmenuOpen((prev) => !prev);
              }}
              variant={'ghost'}
              size={'icon'}
              className={cn(
                'size-full duration-200 max-lg:bg-foreground/5',
                isSubmenuOpen && 'rotate-180'
              )}
            >
              <ChevronDown className="size-5" />
            </Button>
          </div>
        )}
      </Link>

      {hasSubMenu && isSubmenuOpen && (
        <div className="my-2 ml-[18px] space-y-1 border-l-2 border-muted-foreground/35 pl-5">
          {menuItem.submenuItems?.map((submenuItem) => {
            const isActiveSubMenu =
              (submenuItem.url === '/' &&
                isPathEqual(router.asPath, submenuItem.url)) ||
              (submenuItem.url !== '/' &&
                router.asPath.startsWith(submenuItem.url));

            return (
              <Link
                onClick={onLinkClick}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-muted-foreground transition-all hover:text-primary [&>svg]:size-[18px] [&>svg]:shrink-0 md:[&>svg]:size-3.5 relative',
                  isActiveSubMenu && 'bg-muted text-primary'
                )}
                key={submenuItem.url}
                href={submenuItem.url}
              >
                <span className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 block h-0.5 w-3 -translate-y-1/2 bg-muted-foreground/35" />
                {submenuItem.icon}
                <span className="inline-block truncate">
                  {submenuItem.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
