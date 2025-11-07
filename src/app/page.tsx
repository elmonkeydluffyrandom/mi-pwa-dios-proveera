import { AppProvider } from '@/contexts/app-context';
import { PageClient } from './page-client';

export default function Home() {
  return (
    <AppProvider>
      <PageClient />
    </AppProvider>
  );
}
