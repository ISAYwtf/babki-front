import { AppRouter } from '@/app/browser-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/queryClient';
import { Suspense } from 'react';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <AppRouter />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
