import { createFileRoute } from '@tanstack/react-router';
import { MainPage } from '@/pages/main';

export const Route = createFileRoute('/_authenticated/main')({
  component: MainPage,
});
