import { AppRouter } from '@/app/browser-router';
import { ThemeProvider } from '@/shared/ui/theme-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/queryClient';
import { Suspense } from 'react';

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
