import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GlamCart - Beauty & Wellness Shopping',
  description: 'Shop makeup, skincare, haircare, fragrance & wellness products from top brands on GlamCart.com.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: { background: '#333', color: '#fff' },
                success: { style: { background: '#fc2779' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
