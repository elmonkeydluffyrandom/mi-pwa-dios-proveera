import { AppProvider } from '@/contexts/app-context';
import { PageClient } from './page-client';
import { FirebaseProvider } from '@/firebase/provider';

export default function Home() {
  return (
    <FirebaseProvider>
      <AppProvider>
        <PageClient />
      </AppProvider>
    </FirebaseProvider>
  );
}
