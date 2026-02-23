# Essentials Plus Admin Dashboard - AI Coding Instructions

## Project Overview

Next.js admin dashboard for managing an e-commerce platform with meals, products, orders, and ingredients. Uses Pages Router, TypeScript, TanStack Query, and shadcn/ui components.

## Tech Stack & Key Dependencies

- **Framework**: Next.js 15 (Pages Router) + TypeScript
- **State & Data**: TanStack Query v5, Jotai, nuqs for URL state
- **Forms**: Formik + Zod validation (`zod-formik-adapter`)
- **UI**: shadcn/ui, Radix UI, Tailwind CSS, next-themes
- **HTTP**: Axios with custom interceptors
- **Others**: date-fns, @dnd-kit for drag-drop, TinyMCE, react-dropzone

## Architecture Patterns

### Pages-Views Split

Pages in `/src/pages` are thin wrappers; actual logic lives in `/src/views`:

```tsx
// pages/meals/index.tsx
import Meals from '@/views/meals';
export default function MealsPage() {
  return (
    <>
      <NextSeo title="Meals" />
      <Meals />
    </>
  );
}
```

### API Client Organization

- **Location**: `/src/api-clients/admin-api-client/`
- **Pattern**: Separate `queries/` and `mutations/` directories exporting options functions
- **Query Options**: Return `{ queryKey, queryFn }` for use with `useQuery`

```typescript
export const getMealsQueryOptions = ({ axiosReqConfig } = {}) => ({
  queryKey: ['get-meals', axiosReqConfig],
  queryFn: () =>
    adminApiClient
      .get<ApiResponseSuccessBase<Meal[]>>(`/meal`, axiosReqConfig)
      .then((res) => res.data),
});
```

- **Mutation Options**: Return `{ mutationKey, mutationFn }` for use with `useMutation`
- **Authentication**: Axios interceptor auto-adds token from localStorage (`ACCESS_TOKEN_KEY`)
- **401 Handling**: Interceptor clears token and redirects to login on 401

### Form Component Pattern

Forms follow a consistent structure at `/src/components/create-or-update-*-form/`:

- `index.tsx` - Main form component (often 400+ lines)
- `schema.ts` - Zod schema + TypeScript types
- Use `toFormikValidationSchema(zodSchema)` for Formik validation
- Custom Formik-connected components: `FormikInput`, `FormikSelect`, `FormikTextarea`
- Include `BeforeUnloadComponent` to warn on unsaved changes
- Callback props: `onCreateOrUpdate`, `onApiError` for parent communication

### Custom Hooks

- **`usePaginatedQuery`**: Wraps `useQuery` with pagination state (`activePage`, `totalPage`, `fetchPage`)
- **`useSession`**: Manages authentication token in localStorage via `@mantine/hooks` `useLocalStorage`
- **`useAppearanceSettings`**: Persists theme preferences (color scheme, radius)

### Route Management

- **Location**: `/src/config/routes.ts`
- Centralized route definitions with functions for dynamic routes:

```typescript
editMeal: (mealId: string) => `/meals/edit/${mealId}`;
```

- Export `unAuthenticatedRoutes` array for auth logic

### Constants Organization

Domain constants in `/src/constants/` (e.g., `meal.ts`, `product.ts`) define:

- Dropdown options arrays (e.g., `mealTypeOptions`)
- Type enums matching backend API responses
- Domain-specific configuration

### Type Strategy

- API response types in `/src/types/api-responses/`
- Use enums matching backend: `MealTypeEnum`, `MealTaxPercentEnum`
- Generic wrapper: `ApiResponseSuccessBase<TData, TMeta = {}>`

## Development Workflow

### Running the Project

```bash
npm run dev    # Development server on :3000
npm run build  # Production build
npm run lint   # ESLint check
```

### Creating New Pages

1. Add route to `/src/config/routes.ts`
2. Create page in `/src/pages/[resource]/index.tsx` (thin wrapper)
3. Create view in `/src/views/[resource]/index.tsx` (main logic)
4. Add to sidebar: `/src/constants/sidebar-navigation-menu.tsx`

### Creating Forms

1. Create schema in `schema.ts` with Zod
2. Use `CreateOrUpdateMealForm` pattern as reference
3. Include query options for fetching existing data (edit mode)
4. Use `useMutation` for create/update operations
5. Call `extractQueryKey()` when invalidating queries

### Error Handling

- Use `getApiErrorMessage(error, fallbackMessage)` from `/src/lib/utils`
- Handles ZodError, backend validation errors, and generic errors
- Returns JSX with formatted error lists

### Styling Conventions

- Use `cn()` utility (tailwind-merge + clsx) for conditional classes
- shadcn/ui components with custom theme variables (via CSS variables in AuthWrapper)
- Path alias `@/` maps to `./src/`

## Key Files to Reference

- [/src/api-clients/admin-api-client/index.ts](/src/api-clients/admin-api-client/index.ts) - Base axios client with interceptors
- [/src/components/create-or-update-meal-form/index.tsx](/src/components/create-or-update-meal-form/index.tsx) - Reference form implementation (650+ lines)
- [/src/views/meals/index.tsx](/src/views/meals/index.tsx) - Reference list view with filters/pagination
- [/src/hooks/usePaginatedQuery.ts](/src/hooks/usePaginatedQuery.ts) - Pagination abstraction
- [/src/lib/utils/index.tsx](/src/lib/utils/index.tsx) - Essential utilities (cn, error handling, formatters)
- [/src/pages/\_app.tsx](/src/pages/_app.tsx) - Global providers (QueryClient, theme, auth)

## Common Gotchas

- Always use query options functions (e.g., `getMealsQueryOptions()`) for consistency and cache invalidation
- Pages Router: use `useRouter()` from `next/router`, not `next/navigation`
- Authentication state managed globally via localStorage, not context/state
- Forms are large (500+ lines) - avoid premature splitting unless clearly beneficial
- Path imports use `@/` prefix, configured in `tsconfig.json` paths
