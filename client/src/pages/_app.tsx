import ScrollTop from '@/components/ScrollTop'
import { AuthProvider } from '@/store/authContext'
import { CartProvider } from '@/store/cartContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
  <AuthProvider>
    <CartProvider>
    <ScrollTop/>
    <Toaster />
  <Component {...pageProps} />
  </CartProvider>
  </AuthProvider>
  )

}
