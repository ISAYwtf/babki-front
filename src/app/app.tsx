import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/shared/ui/theme-provider';
import { queryClient } from '@/shared/lib/query-client';
import { AppRouter } from './router';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="babki-ui-theme">
        <Suspense>
          <AppRouter />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
