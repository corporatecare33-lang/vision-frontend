import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import SubcategoryPage from "./pages/SubcategoryPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Support from "./pages/Support";
import StaticPage from "./pages/StaticPage";
import ScrollToTop from "./components/ScrollToTop";
import ThankYou from "./pages/ThankYou";
import Language from "./pages/Language";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const hasToken = localStorage.getItem("token");
  const hasAdmin = localStorage.getItem("admin");
  return isLoggedIn || hasToken || hasAdmin ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin routes without header/footer */}
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Regular routes with header/footer */}
        <Route path="*" element={
          <div className="flex min-h-screen flex-col bg-white text-slate-950">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart mode="cart" />} />
                <Route path="/order" element={<Cart mode="order" />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/category/:categoryId/:subcategoryId" element={<SubcategoryPage />} />
                <Route path="/support" element={<Support />} />
                <Route path="/news" element={<StaticPage title="News & Events" subtitle="Latest launches, retail announcements, and Vision stories." />} />
                <Route path="/media" element={<StaticPage title="Media Center" subtitle="Brand resources, product visuals, and press updates." />} />
                <Route path="/language" element={<Language />} />
                <Route 
                  path="/dashboard" 
                  element={<Navigate to="/admin" replace />} 
                />
                <Route path="*" element={<StaticPage title="Page Not Found" subtitle="The page you are looking for is not available." />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;
