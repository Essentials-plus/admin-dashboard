const routes = {
  home: '/',

  meals: '/meals',
  createMeal: '/meals/create',
  editMeal: (mealId: string) => `/meals/edit/${mealId}`,

  ingredients: '/ingredients',
  ingredientCategories: '/ingredients/categories',

  weeklyMeals: '/weekly-meals',
  createWeeklyMeal: '/weekly-meals/create',
  editWeeklyMeal: (weekId: string) => `/weekly-meals/edit/${weekId}`,

  products: '/products',
  createProduct: '/products/create',
  editProduct: (productId: string) => `/products/edit/${productId}`,
  productAttributes: '/products/attributes',
  productCategories: '/products/categories',

  productAttributeTerms: (attributeId: string) =>
    `/products/attributes/${attributeId}/terms`,

  zipCodes: '/zip-codes',

  couponCodes: '/coupon-codes',

  users: '/users',
  editUser: (userId: string) => `/users/edit/${userId}`,

  orders: '/orders',
  orderDetails: (id: string) => `/orders/${id}`,

  mealOrders: '/meal-orders',
  mealOrderDetails: (id: string) => `/meal-orders/${id}`,

  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
};

export const unAuthenticatedRoutes = [
  routes.login,
  routes.forgotPassword,
  routes.resetPassword,
];

export default routes;
