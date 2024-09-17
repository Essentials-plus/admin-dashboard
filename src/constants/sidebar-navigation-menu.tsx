import routes from '@/config/routes';
import {
  Box,
  CookingPot,
  LayoutDashboard,
  Package,
  ShoppingBasket,
  ShoppingCart,
  Tag,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

export type SidebarNavigationMenuItem = {
  icon?: JSX.Element;
  label: string;
  url: string;
  submenuItems?: SidebarNavigationMenuItem[];
};

export const sidebarNavigationMenuItems: SidebarNavigationMenuItem[] = [
  {
    icon: <LayoutDashboard />,
    label: 'Dashboard',
    url: routes.home,
  },
  {
    icon: <CookingPot />,
    label: 'Meals',
    url: routes.meals,
  },
  {
    icon: <Box />,
    label: 'Products',
    url: routes.products,
    submenuItems: [
      {
        label: 'Attributes',
        url: routes.productAttributes,
      },
      {
        label: 'Categories',
        url: routes.productCategories,
      },
    ],
  },

  {
    icon: <ShoppingCart />,
    label: 'Orders',
    url: routes.orders,
  },
  {
    icon: <UtensilsCrossed />,
    label: 'Meal orders',
    url: routes.mealOrders,
  },
  {
    icon: <ShoppingBasket />,
    label: 'Ingredients',
    url: routes.ingredients,
    submenuItems: [
      {
        label: 'Categories',
        url: routes.ingredientCategories,
      },
    ],
  },
  {
    icon: <UtensilsCrossed />,
    label: 'Weekly meals',
    url: routes.weeklyMeals,
  },
  {
    icon: <Users />,
    label: 'Users',
    url: routes.users,
  },
  {
    icon: <Package />,
    label: 'Zip codes',
    url: routes.zipCodes,
  },
  {
    icon: <Tag />,
    label: 'Coupon codes',
    url: routes.couponCodes,
  },
];
