import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AppProvider } from '@/contexts/app-context';
import { ThemeProvider } from '@/components/theme-provider';
import { PwaManager } from '@/components/pwa-manager';


export const metadata: Metadata = {
  title: 'Tienda "Dios Proveerá"',
  description: 'Aplicación de punto de venta offline para pequeñas tiendas.',
  viewport: 'width=device-width, initial-scale=1',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#A7D1AB" />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </FirebaseClientProvider>
          <Toaster />
          <PwaManager />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registrado con éxito');
                    },
                    function(err) {
                      console.log('Error al registrar SW:', err);
                    }
                  );
                });
              }
            `,
          }}
        /></body>
    </html>
  );
}
