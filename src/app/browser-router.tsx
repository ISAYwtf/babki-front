import { mainPageRoute } from '@/pages/main/route';
import {
  RouterProvider,
  createBrowserRouter,
  useRouteError,
} from 'react-router-dom';

const BubbleError = (): null => {
  const error = useRouteError();

  if (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
    }
  }
  return null;
};

export function AppRouter() {
  const browserRouter = createBrowserRouter([
    {
      errorElement: <BubbleError />,
      children: [
        {
          // lazy: lazyLayout,
          children: [
            mainPageRoute,
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={browserRouter} />;
}
