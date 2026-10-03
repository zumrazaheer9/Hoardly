import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
const lazyPage = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));
const HomePage = lazyPage(() => import('./pages/HomePage.jsx'), 'HomePage');
const ProductsPage = lazyPage(() => import('./pages/ProductsPage.jsx'), 'ProductsPage');
const CategoriesPage = lazyPage(() => import('./pages/CategoriesPage.jsx'), 'CategoriesPage');
const ProductPage = lazyPage(() => import('./pages/ProductPage.jsx'), 'ProductPage');
const CartPage = lazyPage(() => import('./pages/CartPage.jsx'), 'CartPage');
const WishlistPage = lazyPage(() => import('./pages/WishlistPage.jsx'), 'WishlistPage');
const CheckoutPage = lazyPage(() => import('./pages/CheckoutPage.jsx'), 'CheckoutPage');
const OrderConfirmationPage = lazyPage(() => import('./pages/OrderConfirmationPage.jsx'), 'OrderConfirmationPage');
const OrdersPage = lazyPage(() => import('./pages/OrdersPage.jsx'), 'OrdersPage');
const OrderDetailPage = lazyPage(() => import('./pages/OrderDetailPage.jsx'), 'OrderDetailPage');
const ProfilePage = lazyPage(() => import('./pages/ProfilePage.jsx'), 'ProfilePage');
const LoginPage = lazyPage(() => import('./pages/LoginPage.jsx'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./pages/RegisterPage.jsx'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(() => import('./pages/ForgotPasswordPage.jsx'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyPage(() => import('./pages/ResetPasswordPage.jsx'), 'ResetPasswordPage');
const NotFoundPage = lazyPage(() => import('./pages/NotFoundPage.jsx'), 'NotFoundPage');
const AdminLayout = lazyPage(() => import('./components/admin/AdminLayout.jsx'), 'AdminLayout');
const AdminDashboardPage = lazyPage(() => import('./pages/admin/AdminDashboardPage.jsx'), 'AdminDashboardPage');
const AdminProductsPage = lazyPage(() => import('./pages/admin/AdminProductsPage.jsx'), 'AdminProductsPage');
const AdminCategoriesPage = lazyPage(() => import('./pages/admin/AdminCategoriesPage.jsx'), 'AdminCategoriesPage');
const AdminOrdersPage = lazyPage(() => import('./pages/admin/AdminOrdersPage.jsx'), 'AdminOrdersPage');
const AdminDiscountsPage = lazyPage(() => import('./pages/admin/AdminDiscountsPage.jsx'), 'AdminDiscountsPage');

const metadata = [
  [/^\/$/, 'Hoardly | Curated Everyday Goods', 'Explore products and categories selected for everyday life.'],
  [/^\/products\//, 'Product Details | Hoardly', 'Explore product details, availability, and customer reviews.'],
  [/^\/products$/, 'Shop Products | Hoardly', 'Browse, search, and filter the Hoardly catalog.'],
  [/^\/categories/, 'Categories | Hoardly', 'Browse products by category.'],
  [/^\/admin/, 'Store Administration | Hoardly', 'Manage the Hoardly catalog, orders, and discounts.'],
  [/^\/account/, 'Your Account | Hoardly', 'Manage your profile and saved addresses.'],
  [/^\/orders/, 'Your Orders | Hoardly', 'View your Hoardly order history and details.'],
  [/^\/cart/, 'Shopping Cart | Hoardly', 'Review items in your shopping cart.'],
  [/^\/checkout$/, 'Checkout | Hoardly', 'Confirm your delivery address and place your order.'],
  [/^\/forgot-password$/, 'Reset Password | Hoardly', 'Request a link to reset your account password.'],
  [/^\/reset-password$/, 'Set New Password | Hoardly', 'Choose a new password for your Hoardly account.'],
  [/^\/wishlist/, 'Saved Items | Hoardly', 'View your saved Hoardly products.'],
  [/^\/login/, 'Sign In | Hoardly', 'Sign in to your Hoardly account.'],
  [/^\/register/, 'Create Account | Hoardly', 'Create a Hoardly account.'],
];

function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const [, title, description] = metadata.find(([pattern]) => pattern.test(pathname)) || ['', 'Page Not Found | Hoardly', 'The requested page could not be found.'];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [pathname]);
  return null;
}

function RouteLoading() {
  return <div className="flex min-h-96 items-center justify-center" role="status" aria-live="polite"><span className="text-sm text-content-secondary">Loading page...</span></div>;
}

class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Page rendering failed:', error);
  }

  render() {
    if (this.state.hasError) {
      return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6"><h1 className="text-2xl font-bold text-content-primary">This page could not load.</h1><p className="mt-3 text-sm leading-6 text-content-secondary">The page hit an unexpected problem. Reload to try again.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 min-h-10 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-content-on-action hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus">Reload page</button></main>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
        <div className="min-h-screen flex flex-col bg-surface-page text-content-primary">
          <Navbar />
          <RouteMetadata />
          <main className="flex-1">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/orders/:id/confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="discounts" element={<AdminDiscountsPage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
