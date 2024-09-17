import { CircleUser, LogOut, Menu, Palette, Settings } from 'lucide-react';

import AppearanceSettings from '@/components/appearance-settings';
import SidebarMenu from '@/components/sidebar-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { APP_NAME } from '@/config/app';
import useSession from '@/hooks/useSession';
import { useHotkeys, useOs } from '@mantine/hooks';
import { useState } from 'react';

const Header = () => {
  const { logout } = useSession();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const [openAppearanceSheet, setOpenAppearanceSheet] = useState(false);
  const os = useOs();

  useHotkeys([['alt+A', () => setOpenAppearanceSheet(!openAppearanceSheet)]]);

  return (
    <header className="sticky left-0 top-0 z-50 flex h-14 w-full items-center gap-3 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <Sheet open={openMobileSidebar} onOpenChange={setOpenMobileSidebar}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col pt-5">
          <p className="mb-2 text-xl font-medium">{APP_NAME}</p>
          <SidebarMenu onLinkClick={() => setOpenMobileSidebar(false)} />
        </SheetContent>
      </Sheet>
      {/* <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="ml-auto rounded-full"
          >
            <CircleUser className="size-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[170px]">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings className="size-4" />
              Settings
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="min-w-[150px]">
                <DropdownMenuItem onClick={() => setOpenAppearanceSheet(true)}>
                  <Palette className="size-4" /> Appearance{' '}
                  <DropdownMenuShortcut className="ml-3">
                    {os === 'macos' ? '⌥' : 'Alt'} A
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={openAppearanceSheet} onOpenChange={setOpenAppearanceSheet}>
        <SheetContent disableOverlay>
          <SheetHeader>
            <SheetTitle>Appearance settings</SheetTitle>
            <SheetDescription>
              Pick a style and color for your components.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5">
            <AppearanceSettings />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
