import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  List,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  User,
  Bell,
  ShoppingCart,
  Tags,
  Truck,
  Shield,
  Home,
  PackagePlus,
  RefreshCcw,
  ChevronDown,
  UserCircle,
  FileText,
  ShieldCheck,
  TruckIcon,
  Globe,
  Smartphone,
  Headphones,
  MessageCircle,
  FileCheck,
  BellRing,
  ShoppingBag,
  Tag,
  Users,
  Gift,
  MapPin,
  Mail,
  RotateCcw,
  Cog,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  Menu,
  X,
  Search,
  Eye,
  Download,
  Printer,
  Filter,
  Clock,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCheck,
  UserPlus,
  Flag,
  ScanEye,
  Fingerprint,
  Gavel,
  Warehouse,
  IndianRupee,
  Layers,
  Megaphone,
  TicketPercent,
  Image,
  Zap,
  Banknote,
  LineChart,
  Mail as MailIcon,
  Palette,
  Receipt,
  Cable,
  Smartphone as SmartphoneIcon,
  Radio,
  Contact,
  Store
} from "lucide-react";
import { adminLogout, getApiProducts, createApiProduct, deleteApiProduct } from "../services/productsApi";
import {
  getDashboardStats,
  getSalesReport,
  getOrders,
  updateOrderStatus,
  getUsers,
  updateUserStatus,
  updateUser,
  getFraudCheckData,
  resolveFraudOrder,
  getPages,
  createPage,
  updatePage,
  updatePageStatus,
  deletePage,
  getFallbackStats,
  getFallbackSalesReport
} from "../services/dashboardApi";
import {
  getStockProducts,
  updateProductStock,
  getStockTransactions,
  getStockAlerts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategorySubcategories
} from "../services/stockApi";

// ============================================================
// Helper Components
// ============================================================
const StatusBadge = ({ status }) => {
  const colors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-sky-100 text-sky-700 border-sky-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    returned: "bg-purple-100 text-purple-700 border-purple-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    failed: "bg-rose-100 text-rose-700 border-rose-200",
    refunded: "bg-orange-100 text-orange-700 border-orange-200",
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-gray-100 text-gray-500 border-gray-200",
    superadmin: "bg-purple-100 text-purple-700 border-purple-200",
    admin: "bg-blue-100 text-blue-700 border-blue-200",
    instock: "bg-emerald-100 text-emerald-700 border-emerald-200",
    lowstock: "bg-amber-100 text-amber-700 border-amber-200",
    outofstock: "bg-red-100 text-red-700 border-red-200",
  };
  const labels = {
    pending: "বাকি", processing: "প্রক্রিয়াধীন", shipped: "কুরিয়ারে",
    delivered: "ডেলিভারি সম্পন্ন", cancelled: "বাতিল", returned: "রিটার্ন",
    paid: "পরিশোধিত", failed: "ব্যর্থ", refunded: "রিফান্ড",
    active: "সক্রিয়", inactive: "নিষ্ক্রিয়", superadmin: "সুপার এডমিন", admin: "এডমিন",
    instock: "স্টকে আছে", lowstock: "স্টক শেষের পথে", outofstock: "স্টক নেই",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${colors[status] || colors.pending} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" || status === "delivered" || status === "paid" || status === "instock" ? "bg-green-500" : status === "inactive" || status === "cancelled" || status === "failed" || status === "outofstock" ? "bg-red-500" : "bg-amber-500"}`} />
      {labels[status] || status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </>
  );
};

const StockBadge = ({ stock, threshold }) => {
  if (stock === 0) return <StatusBadge status="outofstock" />;
  if (stock <= threshold) return <StatusBadge status="lowstock" />;
  return <StatusBadge status="instock" />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [users, setUsers] = useState([]);
  const [fraudData, setFraudData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI states
  const [orderFilter, setOrderFilter] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("monthly");

  // Page management states
  const [pages, setPages] = useState([]);
  const [editPage, setEditPage] = useState(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [pageSearch, setPageSearch] = useState("");

  // ============ PRODUCT MANAGEMENT STATES ============
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [editProduct, setEditProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productCategories, setProductCategories] = useState([]);

  // ============ STOCK MANAGEMENT STATES ============
  const [stockProducts, setStockProducts] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [stockAlerts, setStockAlerts] = useState({ lowStock: [], outOfStock: [], total: 0 });
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [adjustStockProduct, setAdjustStockProduct] = useState(null);
  const [showStockAdjust, setShowStockAdjust] = useState(false);
  const [stockTxPage, setStockTxPage] = useState(1);
  const [activeStockTab, setActiveStockTab] = useState("overview");

  // ============ CATEGORY MANAGEMENT STATES ============
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Data Loading
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    const [statsData, salesData] = await Promise.all([getDashboardStats(), getSalesReport()]);
    setStats(statsData || getFallbackStats());
    setSalesReport(salesData || getFallbackSalesReport());
    setIsLoading(false);
  }, []);

  const loadOrders = useCallback(async () => {
    const params = { page: orderPage, limit: 15 };
    if (orderFilter) params.status = orderFilter;
    if (orderSearch) params.search = orderSearch;
    const data = await getOrders(params);
    if (data) {
      if (Array.isArray(data)) {
        setOrders(data);
        setOrdersPagination({ total: data.length, page: 1, pages: 1 });
      } else {
        setOrders(data.orders || []);
        setOrdersPagination({ total: data.total || 0, page: data.page || 1, pages: data.pages || 1 });
      }
    }
  }, [orderPage, orderFilter, orderSearch]);

  const loadUsers = useCallback(async () => {
    const data = await getUsers();
    if (data) setUsers(data);
  }, []);

  const loadFraudData = useCallback(async () => {
    const data = await getFraudCheckData();
    if (data) setFraudData(data);
  }, []);

  const loadPages = useCallback(async () => {
    const data = await getPages();
    if (data) setPages(data);
  }, []);

  // Load Products
  const loadProducts = useCallback(async () => {
    const data = await getApiProducts();
    if (data) setProducts(data);
  }, []);

  // Load Stock Products
  const loadStockProducts = useCallback(async () => {
    const params = {};
    if (stockSearch) params.search = stockSearch;
    if (stockCategoryFilter !== "all") params.category = stockCategoryFilter;
    if (stockStatusFilter !== "all") params.stockStatus = stockStatusFilter;
    const data = await getStockProducts(params);
    if (Array.isArray(data)) setStockProducts(data);
  }, [stockSearch, stockCategoryFilter, stockStatusFilter]);

  const loadStockTransactions = useCallback(async () => {
    const data = await getStockTransactions({ page: stockTxPage, limit: 50 });
    if (data) setStockTransactions(data);
  }, [stockTxPage]);

  const loadStockAlerts = useCallback(async () => {
    const data = await getStockAlerts();
    if (data) setStockAlerts(data);
  }, []);

  // Load Categories
  const loadCategories = useCallback(async () => {
    const data = await getCategories();
    if (Array.isArray(data)) {
      setCategories(data);
      setProductCategories(data);
    }
  }, []);

  useEffect(() => {
    if (activeNav === "dashboard") loadDashboardData();
    if (activeNav === "orders") loadOrders();
    if (activeNav === "users") loadUsers();
    if (activeNav === "fraud-check") loadFraudData();
    if (activeNav === "page-management") loadPages();
    if (activeNav === "products") { loadProducts(); loadCategories(); }
    if (activeNav === "stock-management") { loadStockProducts(); loadStockTransactions(); loadStockAlerts(); loadCategories(); }
    if (activeNav === "category-management") { loadCategories(); }
  }, [activeNav, loadDashboardData, loadOrders, loadUsers, loadFraudData, loadPages, loadProducts, loadStockProducts, loadStockTransactions, loadStockAlerts, loadCategories]);

  // Actions
  const handleOrderStatusUpdate = async (id, status) => {
    await updateOrderStatus(id, { orderStatus: status });
    loadOrders();
  };

  const handleUserToggleStatus = async (id, currentStatus) => {
    await updateUserStatus(id, !currentStatus);
    loadUsers();
  };

  const handleUpdateUser = async () => {
    if (editUser) {
      await updateUser(editUser._id, { name: editUser.name, email: editUser.email, phone: editUser.phone, role: editUser.role });
      setEditUser(null);
      loadUsers();
    }
  };

  const handleResolveFraud = async (id) => {
    await resolveFraudOrder(id);
    loadFraudData();
  };

  const handleTogglePageStatus = async (id, isActive) => {
    await updatePageStatus(id, !isActive);
    loadPages();
  };

  const handleSavePage = async () => {
    if (editPage?._id) {
      await updatePage(editPage._id, { name: editPage.name, title: editPage.title, content: editPage.content, isActive: editPage.isActive });
    } else if (editPage) {
      await createPage({ name: editPage.name, title: editPage.title, content: editPage.content });
    }
    setEditPage(null);
    setShowAddPage(false);
    loadPages();
  };

  const handleDeletePage = async (id) => {
    if (window.confirm("পেজটি মুছবেন?")) {
      await deletePage(id);
      loadPages();
    }
  };

  // Product Actions
  const handleDeleteProduct = async (id) => {
    if (window.confirm("পণ্যটি মুছবেন?")) {
      await deleteApiProduct(id);
      loadProducts();
    }
  };

  const handleSaveProduct = async () => {
    setShowAddProduct(false);
    setEditProduct(null);
    loadProducts();
  };

  // Stock Actions
  const handleStockAdjust = async () => {
    if (!adjustStockProduct) return;
    const { type, quantity, reason } = adjustStockProduct;
    await updateProductStock(adjustStockProduct.id, { type, quantity: Number(quantity), reason, performedBy: "admin" });
    setShowStockAdjust(false);
    setAdjustStockProduct(null);
    loadStockProducts();
    loadStockTransactions();
    loadStockAlerts();
  };

  // Category Actions
  const handleSaveCategory = async () => {
    if (editCategory?._id) {
      await updateCategory(editCategory._id, editCategory);
    } else if (editCategory) {
      await createCategory(editCategory);
    }
    setEditCategory(null);
    setShowAddCategory(false);
    loadCategories();
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("ক্যাটাগরিটি মুছবেন? এতে করে পণ্যগুলো শুধু ক্যাটাগরি ছাড়া হবে, ডিলিট হবে না।")) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  const handleLogout = () => { adminLogout(); navigate("/login"); };

  const sidebarGroups = [
    {
      label: "প্রোডাক্ট",
      items: [
        { id: "products", icon: ShoppingBag, label: "সকল প্রোডাক্ট" },
        { id: "price-edit", icon: IndianRupee, label: "প্রাইস এডিট" },
        { id: "category-management", icon: Layers, label: "ক্যাটাগরি" },
      ]
    },
    {
      label: "মার্কেটিং",
      items: [
        { id: "marketing", icon: Megaphone, label: "মার্কেটিং" },
        { id: "coupons", icon: TicketPercent, label: "কুপন" },
        { id: "banners", icon: Image, label: "ব্যানার" },
        { id: "flash-sale", icon: Zap, label: "ফ্ল্যাশ সেল" },
      ]
    },
    {
      label: "অর্ডার ও ডেলিভারি",
      items: [
        { id: "orders", icon: ShoppingCart, label: "অর্ডার" },
        { id: "shipping-charge", icon: Truck, label: "শিপিং চার্জ" },
        { id: "courier-api", icon: Cable, label: "কুরিয়ার API" },
      ]
    },
    {
      label: "পেমেন্ট",
      items: [
        { id: "bkash", icon: SmartphoneIcon, label: "বিকাশ পেমেন্ট" },
        { id: "payment-settings", icon: Wallet, label: "পেমেন্ট সেটিংস" },
      ]
    },
    {
      label: "কন্টেন্ট",
      items: [
        { id: "page-management", icon: FileText, label: "পেজ ম্যানেজ" },
        { id: "banners", icon: Image, label: "ব্যানার" },
      ]
    },
    {
      label: "এনালিটিক্স ও ইন্টিগ্রেশন",
      items: [
        { id: "facebook-pixel", icon: Radio, label: "Facebook Pixel" },
        { id: "analytics", icon: LineChart, label: "পিক্সেল ও অ্যানালিটিক্স" },
        { id: "smtp-email", icon: MailIcon, label: "SMTP ইমেইল" },
      ]
    },
    {
      label: "সেটিংস",
      items: [
        { id: "site-settings", icon: Store, label: "সাইট সেটিংস" },
        { id: "fraud-check", icon: ScanEye, label: "ফ্রড চেকার" },
        { id: "users", icon: Users, label: "ইউজার ম্যানেজমেন্ট" },
        { id: "stock-management", icon: Warehouse, label: "স্টক ম্যানেজমেন্ট" },
      ]
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-vision-blue to-vision-cyan rounded-xl flex items-center justify-center shadow-lg shadow-vision-blue/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">এডমিন প্যানেল</h1>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Vision E-commerce</p>
            </div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="absolute top-5 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden transition-colors"><X className="w-5 h-5" /></button>
        <nav className="flex-1 px-3 pb-3 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button key={item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group ${isActive ? "bg-gradient-to-r from-vision-blue to-vision-cyan text-white shadow-lg shadow-vision-blue/25" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full opacity-80" />}
                      <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"} transition-colors`} />
                      {item.label}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-100 space-y-1.5 bg-gray-50/50">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-white hover:text-vision-blue hover:shadow-sm transition-all duration-200"><Home className="w-4.5 h-4.5" /> হোমপেজ</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"><LogOut className="w-4.5 h-4.5" /> লগআউট</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden transition-colors"><Menu className="w-5 h-5" /></button>
            <button onClick={() => navigate("/")} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-vision-blue transition-all"><Home className="w-3.5 h-3.5" /> হোমপেজ</button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-vision-blue transition-all"><BellRing className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
              <div className="text-right hidden sm:block"><p className="text-xs font-semibold text-gray-900">superadmin</p><p className="text-[10px] text-gray-400">এডমিন</p></div>
              <div className="w-9 h-9 bg-gradient-to-br from-vision-blue to-vision-cyan rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">ক</div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* ============ DASHBOARD ============ */}
          {activeNav === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">ড্যাশবোর্ড</h2>
                  <p className="text-sm text-gray-500 mt-1">আপনার স্টোরের সার্বিক অবস্থা</p>
                </div>
                <button onClick={loadDashboardData} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all"><RefreshCcw className="w-3.5 h-3.5" /> রিফ্রেশ</button>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-vision-blue/20 border-t-vision-blue rounded-full animate-spin" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: ShoppingCart, bg: "from-blue-500 to-blue-600", value: stats?.totalOrders || 0, label: "মোট অর্ডার", growth: stats?.ordersGrowth, progress: 75 },
                      { icon: DollarSign, bg: "from-emerald-500 to-green-600", value: `৳${(stats?.totalSales || 0).toLocaleString()}`, label: "মোট বিক্রয়", growth: stats?.salesGrowth, progress: 85 },
                      { icon: Users, bg: "from-purple-500 to-purple-600", value: stats?.totalCustomers || 0, label: "মোট গ্রাহক", growth: stats?.customersGrowth, progress: 60 },
                      { icon: Package, bg: "from-orange-500 to-amber-600", value: stats?.totalProducts || 0, label: "মোট পণ্য", growth: stats?.productsGrowth, negative: true, progress: 45 },
                    ].map((card, i) => (
                      <div key={i} className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:border-vision-blue/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <card.icon className="w-6 h-6 text-white" />
                          </div>
                          {card.growth !== undefined && (
                            <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${card.negative ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
                              {card.negative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {card.growth}%
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-3xl font-extrabold text-gray-900">{card.value}</h3>
                          <p className="text-sm font-medium text-gray-400">{card.label}</p>
                        </div>
                        {card.progress !== undefined && (
                          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r ${card.bg} rounded-full" style={{ width: `${card.progress}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { bg: "from-amber-50 to-amber-100/50 border-amber-200/60", icon: Clock, color: "text-amber-600", value: stats?.pendingOrders || 0, label: "বাকি", color2: "text-amber-900 text-amber-700" },
                      { bg: "from-green-50 to-emerald-100/50 border-green-200/60", icon: CheckCircle2, color: "text-green-600", value: stats?.completedOrders || 0, label: "সম্পন্ন", color2: "text-green-900 text-green-700" },
                      { bg: "from-sky-50 to-blue-100/50 border-sky-200/60", icon: Truck, color: "text-sky-600", value: stats?.inCourier || 0, label: "কুরিয়ারে", color2: "text-sky-900 text-sky-700" },
                      { bg: "from-red-50 to-rose-100/50 border-red-200/60", icon: XCircle, color: "text-red-600", value: stats?.cancelledOrders || 0, label: "বাতিল", color2: "text-red-900 text-red-700" },
                    ].map((s, i) => (
                      <div key={i} className={`bg-gradient-to-br ${s.bg} border rounded-2xl p-4 flex items-center gap-3`}>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                        <div><div className="flex items-baseline gap-1"><span className={`text-xl font-extrabold ${s.color2.split(" ")[0]}`}>{s.value}</span><span className={`text-xs font-medium ${s.color2.split(" ")[1]}`}>{s.label}</span></div></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============ USER MANAGEMENT ============ */}
          {activeNav === "users" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">ইউজার ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">এডমিন ও স্টাফদের তথ্য পরিচালনা করুন</p>
                </div>
                <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all"><UserPlus className="w-4 h-4" /> নতুন ইউজার</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "মোট ইউজার", value: users.length, color: "text-gray-900" },
                  { label: "সক্রিয়", value: users.filter(u => u.isActive).length, color: "text-green-600" },
                  { label: "নিষ্ক্রিয়", value: users.filter(u => !u.isActive).length, color: "text-red-500" },
                  { label: "সুপার এডমিন", value: users.filter(u => u.role === "superadmin").length, color: "text-purple-600" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className={`text-2xl font-extrabold ${s.color} mt-1`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="নাম, ইমেইল বা ইউজারনেম দিয়ে সার্চ করুন..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["ইউজার", "ইমেইল", "ফোন", "রোল", "স্ট্যাটাস", "শেষ লগইন", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.filter(u => !userSearch || u.name?.includes(userSearch) || u.email?.includes(userSearch)).map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${user.role === "superadmin" ? "bg-gradient-to-br from-purple-500 to-purple-600" : "bg-gradient-to-br from-vision-blue to-vision-cyan"}`}>{user.name?.charAt(0) || "U"}</div>
                            <div><p className="text-sm font-bold text-gray-900">{user.name}</p><p className="text-[10px] text-gray-400">@{user.username}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">{user.email}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{user.phone || "—"}</td>
                        <td className="px-5 py-4"><StatusBadge status={user.role} /></td>
                        <td className="px-5 py-4"><StatusBadge status={user.isActive ? "active" : "inactive"} /></td>
                        <td className="px-5 py-4 text-xs text-gray-400">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("bn-BD") : "—"}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => setEditUser(user)} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleUserToggleStatus(user._id, user.isActive)} className={`p-2 rounded-lg transition-all ${user.isActive ? "text-red-400 hover:text-red-500 hover:bg-red-50" : "text-green-400 hover:text-green-500 hover:bg-green-50"}`}>
                              {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">কোনো ইউজার নেই</td></tr>}
                  </tbody>
                </table>
              </div>
              <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="ইউজার সম্পাদনা">
                {editUser && (
                  <div className="space-y-4">
                    {["name", "email", "phone"].map((field) => (
                      <label key={field} className="space-y-1.5">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{field === "name" ? "নাম" : field === "email" ? "ইমেইল" : "ফোন"}</span>
                        <input value={editUser[field]} onChange={(e) => setEditUser({ ...editUser, [field]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
                      </label>
                    ))}
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">রোল</span>
                      <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 bg-white">
                        <option value="admin">এডমিন</option><option value="superadmin">সুপার এডমিন</option>
                      </select>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditUser(null)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
                      <button onClick={handleUpdateUser} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">আপডেট করুন</button>
                    </div>
                  </div>
                )}
              </Modal>
              <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="নতুন ইউজার">
                <AddUserForm onSuccess={() => { setShowAddUser(false); loadUsers(); }} />
              </Modal>
            </div>
          )}

          {/* ============ PRODUCT MANAGEMENT ============ */}
          {activeNav === "products" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">পণ্য ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">পণ্য যোগ, সম্পাদনা, মূল্য পরিবর্তন ও পরিচালনা</p>
                </div>
                <button onClick={() => { setEditProduct({ name: "", model: "", price: "", originalPrice: "", category: "", subcategory: "", description: "", specs: "", stock: 10, lowStockThreshold: 5, isActive: true }); setShowAddProduct(true); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                  <Plus className="w-4 h-4" /> নতুন পণ্য যোগ করুন
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="নাম, মডেল বা আইডি দিয়ে সার্চ করুন..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
                    <option value="all">সব ক্যাটাগরি</option>
                    {productCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["পণ্য", "মডেল", "মূল্য", "মূল মূল্য", "ক্যাটাগরি", "স্টক", "স্ট্যাটাস", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 7 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.filter(p => {
                      const matchesSearch = !productSearch || p.name?.includes(productSearch) || p.model?.includes(productSearch) || p.id?.includes(productSearch);
                      const matchesCat = productCategoryFilter === "all" || p.category === productCategoryFilter;
                      return matchesSearch && matchesCat;
                    }).map((product) => {
                      const stockVal = product.stock !== undefined ? product.stock : 10;
                      const threshold = product.lowStockThreshold || 5;
                      return (
                        <tr key={product.id || product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" />}
                              </div>
                              <div><p className="text-sm font-bold text-gray-900">{product.name}</p><p className="text-[10px] text-gray-400">{product.id}</p></div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600">{product.model}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-extrabold text-emerald-600">৳{Number(product.price).toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-4">
                            {product.originalPrice > 0 ? (
                              <span className="text-xs text-gray-400 line-through">৳{Number(product.originalPrice).toLocaleString()}</span>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] font-semibold text-vision-blue bg-vision-blue/5 px-2.5 py-1 rounded-lg">{product.category}</span>
                            <span className="text-[10px] text-gray-400 ml-1">/ {product.subcategory}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <StockBadge stock={stockVal} threshold={threshold} />
                              <span className="text-xs font-bold text-gray-600">{stockVal}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={product.isActive !== false ? "active" : "inactive"} /></td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => { setEditProduct({ ...product }); setShowAddProduct(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="সম্পাদনা"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="মুছুন"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && <tr><td colSpan="8" className="text-center py-12 text-gray-400 text-xs">কোনো পণ্য নেই</td></tr>}
                  </tbody>
                </table>
              </div>
              {/* Add/Edit Product Modal */}
              <Modal isOpen={showAddProduct} onClose={() => { setShowAddProduct(false); setEditProduct(null); }} title={editProduct?.id ? "পণ্য সম্পাদনা" : "নতুন পণ্য"}>
                {editProduct && (
                  <ProductForm product={editProduct} categories={productCategories} onSave={handleSaveProduct} onCancel={() => { setShowAddProduct(false); setEditProduct(null); }} isEdit={!!editProduct?.id} />
                )}
              </Modal>
            </div>
          )}

          {/* ============ STOCK MANAGEMENT ============ */}
          {activeNav === "stock-management" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">স্টক ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">পণ্যের স্টক পর্যবেক্ষণ ও নিয়ন্ত্রণ</p>
                </div>
                {(stockAlerts.total > 0) && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">{stockAlerts.total}টি এলার্ট আছে</span>
                  </div>
                )}
              </div>

              {/* Stock Tabs */}
              <div className="flex gap-2 border-b border-gray-100 pb-2 overflow-x-auto">
                {[
                  { id: "overview", label: "ওভারভিউ", icon: BarChart3 },
                  { id: "products", label: "প্রোডাক্ট স্টক", icon: Package },
                  { id: "adjust", label: "স্টক এডজাস্ট", icon: RefreshCcw },
                  { id: "history", label: "হিস্ট্রি", icon: Clock },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveStockTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeStockTab === tab.id ? "bg-vision-blue text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Overview Tab */}
              {activeStockTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { bg: "from-blue-50 to-blue-100/50 border-blue-200/60", icon: Package, color: "text-blue-600", value: stockProducts.length, label: "মোট প্রোডাক্ট", textColor: "text-blue-700" },
                      { bg: "from-emerald-50 to-emerald-100/50 border-emerald-200/60", icon: CheckCircle2, color: "text-emerald-600", value: stockProducts.filter(p => (p.stock || 10) > (p.lowStockThreshold || 5)).length, label: "স্টক ok", textColor: "text-emerald-700" },
                      { bg: "from-amber-50 to-amber-100/50 border-amber-200/60", icon: AlertTriangle, color: "text-amber-600", value: stockAlerts.total, label: "স্টক এলার্ট", textColor: "text-amber-700" },
                      { bg: "from-red-50 to-red-100/50 border-red-200/60", icon: XCircle, color: "text-red-600", value: stockAlerts.outOfStock.length, label: "স্টকআউট", textColor: "text-red-700" },
                    ].map((s, i) => (
                      <div key={i} className={`bg-gradient-to-br ${s.bg} border rounded-2xl p-5`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                          <p className="text-xs font-medium text-gray-500">{s.label}</p>
                        </div>
                        <p className={`text-3xl font-extrabold ${s.textColor}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {stockAlerts.total > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100">
                        <h4 className="text-sm font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> স্টক এলার্ট সমূহ</h4>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {[...stockAlerts.outOfStock, ...stockAlerts.lowStock].map((p) => (
                          <div key={p._id || p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-gray-500" /></div>
                              <div><p className="text-xs font-bold text-gray-900">{p.name}</p><p className="text-[10px] text-gray-400">{p.model}</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">থ্রেশহোল্ড: {p.lowStockThreshold || 5}</span>
                              <span className={`text-xs font-extrabold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stock === 0 ? "স্টকআউট" : `বাকি ${p.stock}`}</span>
                              <button onClick={() => { setAdjustStockProduct({ id: p.id, name: p.name, model: p.model, stock: p.stock, type: "add", quantity: 0, reason: "" }); setShowStockAdjust(true); }}
                                className="px-3 py-1.5 bg-vision-blue/10 text-vision-blue rounded-lg text-[10px] font-bold hover:bg-vision-blue/20 transition-all">স্টক যোগ</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Products Stock Tab */}
              {activeStockTab === "products" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="নাম বা মডেল সার্চ..." value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select value={stockCategoryFilter} onChange={(e) => setStockCategoryFilter(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
                        <option value="all">সব ক্যাটাগরি</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select value={stockStatusFilter} onChange={(e) => setStockStatusFilter(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
                        <option value="all">সব স্ট্যাটাস</option>
                        <option value="low">লো স্টক</option>
                        <option value="out">স্টকআউট</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["পণ্য", "মডেল", "ক্যাটাগরি", "স্টক", "থ্রেশহোল্ড", "স্ট্যাটাস", ""].map((h, i) => (
                            <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {stockProducts.map((p) => {
                          const stockVal = p.stock !== undefined ? p.stock : 10;
                          const threshold = p.lowStockThreshold || 5;
                          return (
                            <tr key={p._id || p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"><Package className="w-4 h-4 text-gray-500" /></div>
                                  <div><p className="text-xs font-bold text-gray-900">{p.name}</p><p className="text-[10px] text-gray-400">{p.id}</p></div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-600">{p.model}</td>
                              <td className="px-5 py-4"><span className="text-[10px] text-vision-blue bg-vision-blue/5 px-2 py-1 rounded-lg">{p.category}</span></td>
                              <td className="px-5 py-4"><span className={`text-sm font-extrabold ${stockVal === 0 ? "text-red-600" : stockVal <= threshold ? "text-amber-600" : "text-emerald-600"}`}>{stockVal}</span></td>
                              <td className="px-5 py-4 text-xs text-gray-400">{threshold}</td>
                              <td className="px-5 py-4"><StockBadge stock={stockVal} threshold={threshold} /></td>
                              <td className="px-5 py-4 text-right">
                                <button onClick={() => { setAdjustStockProduct({ id: p.id, name: p.name, model: p.model, stock: stockVal, type: "add", quantity: 0, reason: "" }); setShowStockAdjust(true); }}
                                  className="px-3 py-1.5 bg-vision-blue/10 text-vision-blue rounded-lg text-[10px] font-bold hover:bg-vision-blue/20 transition-all">এডজাস্ট</button>
                              </td>
                            </tr>
                          );
                        })}
                        {stockProducts.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">কোনো প্রোডাক্ট নেই</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stock Adjust Tab */}
              {activeStockTab === "adjust" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="প্রোডাক্ট খুঁজুন..." value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stockProducts.filter(p => !stockSearch || p.name?.includes(stockSearch)).map((p) => {
                      const stockVal = p.stock !== undefined ? p.stock : 10;
                      const threshold = p.lowStockThreshold || 5;
                      return (
                        <div key={p._id || p.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-gray-500" /></div>
                              <div><p className="text-sm font-bold text-gray-900">{p.name}</p><p className="text-[10px] text-gray-400">{p.model}</p></div>
                            </div>
                            <StockBadge stock={stockVal} threshold={threshold} />
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500">বর্তমান স্টক: <strong className={stockVal === 0 ? "text-red-600" : "text-gray-900"}>{stockVal}</strong></span>
                          </div>
                          <button onClick={() => { setAdjustStockProduct({ id: p.id, name: p.name, model: p.model, stock: stockVal, type: "add", quantity: 0, reason: "" }); setShowStockAdjust(true); }}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">স্টক এডজাস্ট</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock History Tab */}
              {activeStockTab === "history" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-vision-blue" /> স্টক ট্রানজেকশন ইতিহাস</h4>
                      <button onClick={loadStockTransactions} className="flex items-center gap-1 text-xs text-gray-500 hover:text-vision-blue"><RefreshCcw className="w-3.5 h-3.5" /> রিফ্রেশ</button>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["তারিখ", "পণ্য", "টাইপ", "পরিমাণ", "পূর্বের", "বর্তমান", "কারণ"].map((h, i) => (
                            <th key={i} className="px-5 py-4 text-[10px] font-bold uppercase text-gray-400 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(stockTransactions?.transactions || []).map((tx, i) => (
                          <tr key={tx._id || i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString("bn-BD")}</td>
                            <td className="px-5 py-4">
                              <p className="text-xs font-bold text-gray-900">{tx.productName}</p>
                              <p className="text-[10px] text-gray-400">{tx.productId}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${tx.type === "add" ? "bg-green-100 text-green-700" : tx.type === "subtract" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                                {tx.type === "add" ? "যোগ" : tx.type === "subtract" ? "বাদ" : "সেট"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs font-extrabold text-gray-900">{tx.quantity}</td>
                            <td className="px-5 py-4 text-xs text-gray-500">{tx.previousStock}</td>
                            <td className="px-5 py-4 text-xs font-extrabold text-gray-900">{tx.newStock}</td>
                            <td className="px-5 py-4 text-xs text-gray-500 max-w-[150px] truncate">{tx.reason || "—"}</td>
                          </tr>
                        ))}
                        {(!stockTransactions?.transactions || stockTransactions.transactions.length === 0) && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">কোনো ট্রানজেকশন নেই</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stock Adjust Modal */}
              <Modal isOpen={showStockAdjust} onClose={() => { setShowStockAdjust(false); setAdjustStockProduct(null); }} title="স্টক এডজাস্ট">
                {adjustStockProduct && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-gray-900">{adjustStockProduct.name}</p>
                      <p className="text-xs text-gray-400">{adjustStockProduct.model}</p>
                      <p className="text-xs text-gray-600 mt-1">বর্তমান স্টক: <span className="text-sm font-extrabold text-gray-900">{adjustStockProduct.stock}</span></p>
                    </div>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">অপারেশন টাইপ</span>
                      <select value={adjustStockProduct.type} onChange={(e) => setAdjustStockProduct({ ...adjustStockProduct, type: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 bg-white">
                        <option value="add">স্টক যোগ করুন</option>
                        <option value="subtract">স্টক কমান</option>
                        <option value="set">সঠিক সংখ্যা সেট করুন</option>
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{adjustStockProduct.type === "set" ? "নতুন পরিমাণ" : "পরিমাণ"}</span>
                      <input type="number" min="0" value={adjustStockProduct.quantity} onChange={(e) => setAdjustStockProduct({ ...adjustStockProduct, quantity: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">কারণ</span>
                      <input value={adjustStockProduct.reason} onChange={(e) => setAdjustStockProduct({ ...adjustStockProduct, reason: e.target.value })}
                        placeholder="যেমন: নতুন স্টক এসেছে, ড্যামেজ, রিটার্ন ইত্যাদি"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
                    </label>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => { setShowStockAdjust(false); setAdjustStockProduct(null); }} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
                      <button onClick={handleStockAdjust} disabled={!adjustStockProduct.quantity} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">আপডেট করুন</button>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          )}

          {/* ============ CATEGORY MANAGEMENT ============ */}
          {activeNav === "category-management" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">ক্যাটাগরি ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">ক্যাটাগরি ও সাবক্যাটাগরি যোগ, সম্পাদনা ও পরিচালনা</p>
                </div>
                <button onClick={() => { setEditCategory({ id: "", name: "", shortName: "", description: "", tagline: "", accent: "#0b3474", subcategories: [], sortOrder: categories.length + 1, isActive: true }); setShowAddCategory(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                  <Plus className="w-4 h-4" /> নতুন ক্যাটাগরি
                </button>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="ক্যাটাগরির নাম সার্চ করুন..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {categories.filter(c => !categorySearch || c.name?.includes(categorySearch)).map((cat) => (
                  <div key={cat._id || cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: cat.accent || "#0b3474" }}>
                          {cat.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                          <p className="text-[10px] text-gray-400">{cat.shortName} • সর্ট: {cat.sortOrder}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={cat.isActive !== false ? "active" : "inactive"} />
                        <button onClick={() => { setEditCategory({ ...cat }); setShowAddCategory(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">সাবক্যাটাগরি ({cat.subcategories?.length || 0})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(cat.subcategories || []).map(sc => (
                          <span key={sc.id} className="text-[10px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">{sc.name}</span>
                        ))}
                        {(!cat.subcategories || cat.subcategories.length === 0) && <span className="text-xs text-gray-400">কোনো সাবক্যাটাগরি নেই</span>}
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
                      <p className="text-[10px] text-gray-400">{cat.description || "কোনো বর্ণনা নেই"}</p>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-400">কোনো ক্যাটাগরি নেই</p>
                  </div>
                )}
              </div>

              {/* Add/Edit Category Modal */}
              <Modal isOpen={showAddCategory} onClose={() => { setShowAddCategory(false); setEditCategory(null); }} title={editCategory?._id ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}>
                {editCategory && (
                  <CategoryForm category={editCategory} onSave={handleSaveCategory} onCancel={() => { setShowAddCategory(false); setEditCategory(null); }} isEdit={!!editCategory?._id} />
                )}
              </Modal>
            </div>
          )}

          {/* ============ FRAUD CHECKER ============ */}
          {activeNav === "fraud-check" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">ফ্রড চেকার</h3>
                  <p className="text-sm text-gray-500 mt-1">সন্দেহজনক অর্ডার ও প্রতারণা প্রতিরোধ</p>
                </div>
                <button onClick={loadFraudData} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all"><RefreshCcw className="w-3.5 h-3.5" /> রিফ্রেশ</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { bg: "from-red-50 to-rose-100/50 border-red-200/60", icon: Flag, color: "text-red-600", value: fraudData?.totalFlagged || 0, label: "ফ্ল্যাগড অর্ডার", textColor: "text-red-700" },
                  { bg: "from-orange-50 to-amber-100/50 border-amber-200/60", icon: TrendingUp, color: "text-amber-600", value: `${fraudData?.fraudRate || 0}%`, label: "ফ্রড রেট", textColor: "text-amber-700" },
                  { bg: "from-rose-50 to-pink-100/50 border-pink-200/60", icon: DollarSign, color: "text-pink-600", value: `৳${(fraudData?.highRiskAmount || 0).toLocaleString()}`, label: "হাই-রিস্ক অ্যামাউন্ট", textColor: "text-pink-700" },
                  { bg: "from-violet-50 to-purple-100/50 border-purple-200/60", icon: Fingerprint, color: "text-purple-600", value: fraudData?.commonPatterns?.length || 0, label: "প্যাটার্নস", textColor: "text-purple-700" },
                ].map((s, i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.bg} border rounded-2xl p-5`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                      <p className="text-xs font-medium text-gray-500">{s.label}</p>
                    </div>
                    <p className={`text-3xl font-extrabold ${s.textColor}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2"><ScanEye className="w-4 h-4 text-red-500" /> ফ্ল্যাগড অর্ডার</h4>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["অর্ডার ID", "ক্রেতা", "পরিমাণ", "কারণ", "আইপি", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-3 text-[10px] font-bold uppercase text-gray-400 ${i === 5 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(fraudData?.flaggedOrders || []).map((order, i) => (
                      <tr key={order._id || i} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-5 py-4 text-xs font-bold text-gray-900">{order.orderId}</td>
                        <td className="px-5 py-4"><p className="text-xs font-semibold text-gray-900">{order.customer?.name}</p><p className="text-[10px] text-gray-400">{order.customer?.phone}</p></td>
                        <td className="px-5 py-4 text-xs font-extrabold text-red-600">৳{order.totalAmount?.toLocaleString()}</td>
                        <td className="px-5 py-4"><span className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded-lg">{order.fraudReason}</span></td>
                        <td className="px-5 py-4"><code className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{order.ipAddress || "—"}</code></td>
                        <td className="px-5 py-4 text-right"><button onClick={() => handleResolveFraud(order._id)} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold hover:bg-green-100 transition-all">রিজল্ভ</button></td>
                      </tr>
                    ))}
                    {(!fraudData?.flaggedOrders || fraudData.flaggedOrders.length === 0) && <tr><td colSpan="6" className="text-center py-12 text-gray-400 text-xs">কোনো ফ্ল্যাগড অর্ডার নেই ✓</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ ORDER MANAGEMENT ============ */}
          {activeNav === "orders" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">অর্ডার ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">সকল অর্ডার ট্র্যাক ও ম্যানেজ করুন</p>
                </div>
                <button onClick={loadOrders} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 hover:border-vision-blue/30 hover:text-vision-blue transition-all"><RefreshCcw className="w-3.5 h-3.5" /> রিফ্রেশ</button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="অর্ডার ID বা ফোন সার্চ করুন..." value={orderSearch} onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }} className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1" />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={orderFilter} onChange={(e) => { setOrderFilter(e.target.value); setOrderPage(1); }} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-600">
                    <option value="">সব স্ট্যাটাস</option>
                    {["pending", "processing", "shipped", "delivered", "cancelled", "returned"].map(s => <option key={s} value={s}>{s === "pending" ? "বাকি" : s === "processing" ? "প্রক্রিয়াধীন" : s === "shipped" ? "কুরিয়ারে" : s === "delivered" ? "ডেলিভারি সম্পন্ন" : s === "cancelled" ? "বাতিল" : "রিটার্ন"}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["অর্ডার", "ক্রেতা", "পণ্য", "পরিমাণ", "পেমেন্ট", "স্ট্যাটাস", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4"><span className="text-xs font-bold text-gray-900">{order.orderId}</span><p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString("bn-BD")}</p></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
                            <div><p className="text-xs font-semibold text-gray-900">{order.customer?.name || "অজানা"}</p><p className="text-[10px] text-gray-400">{order.customer?.phone}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><p className="text-xs text-gray-600">{(order.items || []).map(i => i.name).join(", ") || "—"}</p><p className="text-[10px] text-gray-400">{(order.items || []).length}টি আইটেম</p></td>
                        <td className="px-5 py-4 text-sm font-extrabold text-gray-900">৳{order.totalAmount?.toLocaleString()}</td>
                        <td className="px-5 py-4"><StatusBadge status={order.paymentStatus} /></td>
                        <td className="px-5 py-4">
                          <div className="relative group">
                            <button className="flex items-center gap-1 cursor-pointer"><StatusBadge status={order.orderStatus} /><ChevronDown className="w-3 h-3 text-gray-400" /></button>
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                <button key={s} onClick={() => handleOrderStatusUpdate(order._id, s)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${order.orderStatus === s ? "bg-vision-blue/10 text-vision-blue" : "text-gray-600 hover:bg-gray-50"}`}><StatusBadge status={s} /></button>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right"><button className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all"><Eye className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">কোনো অর্ডার নেই</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ PRICE EDIT ============ */}
          {activeNav === "price-edit" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">প্রাইস এডিট</h3>
                  <p className="text-sm text-gray-500 mt-1">পণ্যের মূল্য পরিবর্তন ও বাল্ক প্রাইস এডিট করুন</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><RefreshCcw className="w-4 h-4" /> রিফ্রেশ</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <IndianRupee className="w-16 h-16 text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">প্রাইস এডিট টুল</h4>
                <p className="text-sm text-gray-500 max-w-md">এখানে আপনি প্রতিটি পণ্যের মূল্য আলাদাভাবে অথবা বাল্ক আপডেট করতে পারবেন।</p>
              </div>
            </div>
          )}

          {/* ============ MARKETING ============ */}
          {activeNav === "marketing" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">মার্কেটিং</h3>
                  <p className="text-sm text-gray-500 mt-1">মার্কেটিং ক্যাম্পেইন ও প্রমোশন ম্যানেজ করুন</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><Megaphone className="w-4 h-4" /> নতুন ক্যাম্পেইন</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <Megaphone className="w-16 h-16 text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">মার্কেটিং সেন্টার</h4>
                <p className="text-sm text-gray-500 max-w-md">ইমেইল মার্কেটিং, SMS ক্যাম্পেইন, পুশ নোটিফিকেশন এবং আরও অনেক কিছু।</p>
              </div>
            </div>
          )}

          {/* ============ COUPONS ============ */}
          {activeNav === "coupons" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">কুপন ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">ডিসকাউন্ট কুপন ও প্রমো কোড তৈরি ও পরিচালনা</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><Plus className="w-4 h-4" /> নতুন কুপন</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { value: "০", label: "মোট কুপন", color: "text-gray-900" },
                  { value: "০", label: "সক্রিয়", color: "text-green-600" },
                  { value: "০", label: "ব্যবহৃত", color: "text-blue-600" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <TicketPercent className="w-16 h-16 text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">কুপনের তালিকা</h4>
                <p className="text-sm text-gray-500">কোনো কুপন নেই। নতুন কুপন তৈরি করুন।</p>
              </div>
            </div>
          )}

          {/* ============ BANNERS ============ */}
          {activeNav === "banners" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">ব্যানার ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">হোমপেজ ও ক্যাটাগরি পেজের ব্যানার পরিচালনা</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><Plus className="w-4 h-4" /> নতুন ব্যানার</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {["হিরো ব্যানার", "প্রমোশনাল ব্যানার", "সাইড ব্যানার"].map((b, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                    <Image className="w-12 h-12 text-gray-200 mb-3" />
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{b}</h4>
                    <p className="text-xs text-gray-400 mb-3">৯৬০ x ৪০০ px</p>
                    <button className="px-4 py-2 bg-vision-blue/10 text-vision-blue rounded-xl text-xs font-bold hover:bg-vision-blue/20 transition-all">ব্যানার আপলোড</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ FLASH SALE ============ */}
          {activeNav === "flash-sale" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">ফ্ল্যাশ সেল</h3>
                  <p className="text-sm text-gray-500 mt-1">সীমিত সময়ের অফার ও ফ্ল্যাশ ডিল সেটআপ</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><Zap className="w-4 h-4" /> নতুন ফ্ল্যাশ সেল</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <Zap className="w-16 h-16 text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">কোনো সক্রিয় ফ্ল্যাশ সেল নেই</h4>
                <p className="text-sm text-gray-500 max-w-md">নতুন ফ্ল্যাশ সেল তৈরি করে পণ্যে ডিসকাউন্ট অফার করুন।</p>
              </div>
            </div>
          )}

          {/* ============ SHIPPING CHARGE ============ */}
          {activeNav === "shipping-charge" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">শিপিং চার্জ</h3>
                  <p className="text-sm text-gray-500 mt-1">ডেলিভারি চার্জ ও শিপিং জোন সেটআপ</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><Settings className="w-4 h-4" /> কনফিগার</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { label: "ঢাকা সিটির মধ্যে", value: "৬০ টাকা" },
                  { label: "ঢাকা সিটির বাইরে", value: "১৩০ টাকা" },
                  { label: "ফ্রি শিপিং থ্রেশহোল্ড", value: "৳২০০০+" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">{s.value}</p>
                    <button className="mt-3 text-xs text-vision-blue font-bold hover:underline">এডিট করুন</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ COURIER API ============ */}
          {activeNav === "courier-api" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">কুরিয়ার API</h3>
                  <p className="text-sm text-gray-500 mt-1">কুরিয়ার সার্ভিস ইন্টিগ্রেশন ও API সেটিংস</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><Cable className="w-4 h-4" /> কানেক্ট</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <Cable className="w-16 h-16 text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">কোনো কুরিয়ার সংযুক্ত নেই</h4>
                <p className="text-sm text-gray-500 max-w-md">SteadFast, Pathao, Redx, Paperfly, Sundarban সহ বিভিন্ন কুরিয়ারের API সংযুক্ত করুন।</p>
              </div>
            </div>
          )}

          {/* ============ BKASH ============ */}
          {activeNav === "bkash" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">বিকাশ পেমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">বিকাশ মার্চেন্ট API ইন্টিগ্রেশন ও সেটিংস</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all"><SmartphoneIcon className="w-4 h-4" /> কনফিগার</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">মার্চেন্ট তথ্য</h4>
                  <div className="space-y-3">
                    {[
                      { label: "মার্চেন্ট নম্বর", value: "০১৭XXXXXXXX" },
                      { label: "স্ট্যাটাস", value: "নিষ্ক্রিয়" },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-xs text-gray-500">{f.label}</span>
                        <span className="text-xs font-bold text-gray-900">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">API সেটিংস</h4>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-500">API স্ট্যাটাস</span>
                    <StatusBadge status="inactive" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ PAYMENT SETTINGS ============ */}
          {activeNav === "payment-settings" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">পেমেন্ট সেটিংস</h3>
                  <p className="text-sm text-gray-500 mt-1">অন্যান্য পেমেন্ট গেটওয়ে সেটিংস</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { name: "Nagad", icon: SmartphoneIcon },
                  { name: "Rocket", icon: SmartphoneIcon },
                  { name: "Credit/Debit Card", icon: Wallet },
                  { name: "Cash on Delivery", icon: Banknote },
                ].map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><p.icon className="w-5 h-5 text-gray-500" /></div>
                      <div><p className="text-sm font-bold text-gray-900">{p.name}</p><p className="text-[10px] text-gray-400">{i === 3 ? "সক্রিয়" : "নিষ্ক্রিয়"}</p></div>
                    </div>
                    <button className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${i === 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{i === 3 ? "সক্রিয়" : "নিষ্ক্রিয়"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ FACEBOOK PIXEL ============ */}
          {activeNav === "facebook-pixel" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Facebook Pixel</h3>
                  <p className="text-sm text-gray-500 mt-1">Facebook Pixel ও CAPI সেটআপ</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pixel ID</label>
                  <input placeholder="আপনার Facebook Pixel ID দিন" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Access Token (CAPI)</label>
                  <input placeholder="Conversions API Token" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">সেভ করুন</button>
              </div>
            </div>
          )}

          {/* ============ ANALYTICS ============ */}
          {activeNav === "analytics" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">পিক্সেল ও অ্যানালিটিক্স</h3>
                  <p className="text-sm text-gray-500 mt-1">Google Analytics, Facebook Pixel ও অন্যান্য ট্র্যাকিং</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { name: "Google Analytics 4", icon: LineChart },
                  { name: "Google Tag Manager", icon: LineChart },
                  { name: "Facebook Pixel", icon: Radio },
                  { name: "Google Search Console", icon: LineChart },
                ].map((a, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><a.icon className="w-5 h-5 text-gray-500" /></div>
                      <div><p className="text-sm font-bold text-gray-900">{a.name}</p><p className="text-[10px] text-gray-400">কনফিগার করুন</p></div>
                    </div>
                    <button className="px-3 py-1.5 bg-vision-blue/10 text-vision-blue rounded-lg text-[10px] font-bold hover:bg-vision-blue/20 transition-all">সেটআপ</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ SMTP EMAIL ============ */}
          {activeNav === "smtp-email" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">SMTP ইমেইল</h3>
                  <p className="text-sm text-gray-500 mt-1">ইমেইল সার্ভার কনফিগারেশন ও SMTP সেটিংস</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "SMTP Host", placeholder: "smtp.gmail.com" },
                    { label: "SMTP Port", placeholder: "587" },
                    { label: "SMTP Username", placeholder: "your@email.com" },
                    { label: "SMTP Password", placeholder: "********" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                      <input placeholder={f.placeholder} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">From Email</label>
                  <input placeholder="noreply@yourstore.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">সেভ করুন</button>
                  <button className="px-6 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">টেস্ট ইমেইল</button>
                </div>
              </div>
            </div>
          )}

          {/* ============ SITE SETTINGS ============ */}
          {activeNav === "site-settings" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">সাইট সেটিংস</h3>
                  <p className="text-sm text-gray-500 mt-1">ওয়েবসাইটের গ্লোবাল সেটিংস ও কনফিগারেশন</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "সাইটের নাম", placeholder: "Vision E-commerce" },
                    { label: "সাইটের URL", placeholder: "https://visionecommerce.com" },
                    { label: "ইমেইল", placeholder: "info@visionecommerce.com" },
                    { label: "ফোন", placeholder: "০১৭XXXXXXXX" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                      <input placeholder={f.placeholder} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">ঠিকানা</label>
                  <textarea rows={2} placeholder="আপনার স্টোরের ঠিকানা" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">সাইট লোগো</label>
                  <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-vision-blue/10 file:text-vision-blue" />
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">সেটিংস সেভ করুন</button>
              </div>
            </div>
          )}

          {/* ============ PAGE MANAGEMENT ============ */}
          {activeNav === "page-management" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">পেজ ম্যানেজমেন্ট</h3>
                  <p className="text-sm text-gray-500 mt-1">ওয়েবসাইটের পেজসমূহ পরিচালনা করুন</p>
                </div>
                <button onClick={() => { setEditPage({ name: "", title: "", content: "", isActive: true }); setShowAddPage(true); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-vision-blue/25 transition-all">
                  <Plus className="w-4 h-4" /> নতুন পেজ যোগ করুন
                </button>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <Search className="w-4 h-4 text-gray-400 ml-1" />
                <input type="text" placeholder="পেজের নাম বা টাইটেল সার্চ করুন..." value={pageSearch} onChange={(e) => setPageSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["ক্রম", "নাম", "টাইটেল", "স্লাগ", "স্ট্যাটাস", "তৈরির তারিখ", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pages.filter(p => !pageSearch || p.name?.includes(pageSearch) || p.title?.includes(pageSearch)).map((page, index) => (
                      <tr key={page._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4"><span className="text-xs font-semibold text-gray-400">{String(index + 1).padStart(2, '0')}</span></td>
                        <td className="px-5 py-4"><span className="text-xs font-bold text-gray-900">{page.name}</span></td>
                        <td className="px-5 py-4"><span className="text-xs text-gray-500">{page.title}</span></td>
                        <td className="px-5 py-4"><code className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">{page.slug}</code></td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleTogglePageStatus(page._id, page.isActive)} className="cursor-pointer">
                            <StatusBadge status={page.isActive ? "active" : "inactive"} />
                          </button>
                        </td>
                        <td className="px-5 py-4"><span className="text-xs text-gray-400">{page.createdAt ? new Date(page.createdAt).toLocaleDateString("bn-BD") : "—"}</span></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => { setEditPage(page); setShowAddPage(true); }} className="p-2 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="সম্পাদনা"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeletePage(page._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="মুছুন"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pages.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-xs">কোনো পেজ নেই</td></tr>}
                  </tbody>
                </table>
              </div>
              <Modal isOpen={showAddPage} onClose={() => { setShowAddPage(false); setEditPage(null); }} title={editPage?._id ? "পেজ সম্পাদনা" : "নতুন পেজ"}>
                {editPage && (
                  <div className="space-y-4">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">নাম</span>
                      <input value={editPage.name} onChange={(e) => setEditPage({ ...editPage, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="পেজের নাম" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">টাইটেল</span>
                      <input value={editPage.title} onChange={(e) => setEditPage({ ...editPage, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="পেজ টাইটেল" />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">কন্টেন্ট</span>
                      <textarea value={editPage.content} onChange={(e) => setEditPage({ ...editPage, content: e.target.value })} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder="পেজ কন্টেন্ট" />
                    </label>
                    {editPage._id && (
                      <label className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</span>
                        <button onClick={() => setEditPage({ ...editPage, isActive: !editPage.isActive })} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${editPage.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {editPage.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </button>
                      </label>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => { setShowAddPage(false); setEditPage(null); }} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
                      <button onClick={handleSavePage} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">{editPage._id ? "আপডেট করুন" : "তৈরি করুন"}</button>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ============================================================
// Product Form Component
// ============================================================
const ProductForm = ({ product, categories, onSave, onCancel, isEdit }) => {
  const [form, setForm] = useState(product);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("id", form.id || "");
      fd.append("name", form.name);
      fd.append("model", form.model);
      fd.append("price", form.price);
      fd.append("originalPrice", form.originalPrice || 0);
      fd.append("category", form.category);
      fd.append("subcategory", form.subcategory);
      fd.append("description", form.description || "");
      fd.append("specs", form.specs || "");
      fd.append("visual", form.visual || "");
      fd.append("color", form.color || "#0b3474");
      fd.append("stock", form.stock !== undefined ? form.stock : 10);
      fd.append("lowStockThreshold", form.lowStockThreshold !== undefined ? form.lowStockThreshold : 5);
      fd.append("isActive", form.isActive !== false ? "true" : "false");
      if (form.imageFile) fd.append("image", form.imageFile);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const url = isEdit ? `${API_URL}/products/${form.id}` : `${API_URL}/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, headers, body: fd });
      if (!res.ok) throw new Error("Failed to save product");
      onSave();
    } catch (error) {
      console.error(error);
      alert("পণ্য সেভ করতে সমস্যা হয়েছে: " + error.message);
    }
    setSaving(false);
  };

  const selectedCategory = categories.find(c => c.id === form.category);
  const subcategories = selectedCategory?.subcategories || [];

  const fields = [
    { key: "name", label: "পণ্যের নাম", type: "text", required: true },
    { key: "model", label: "মডেল", type: "text", required: true },
    { key: "price", label: "বিক্রয় মূল্য", type: "number", required: true },
    { key: "originalPrice", label: "মূল মূল্য (যদি ডিসকাউন্ট থাকে)", type: "number", required: false },
    { key: "description", label: "বিবরণ", type: "textarea", required: false },
    { key: "specs", label: "স্পেসিফিকেশন (কমা দিয়ে আলাদা করুন)", type: "text", required: false },
    { key: "visual", label: "ভিজুয়াল টাইপ", type: "text", required: false },
    { key: "stock", label: "স্টক পরিমাণ", type: "number", required: false },
    { key: "lowStockThreshold", label: "লো স্টক থ্রেশহোল্ড", type: "number", required: false },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">পণ্যের ছবি</span>
        <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-vision-blue/10 file:text-vision-blue hover:file:bg-vision-blue/20" />
      </label>
      {fields.map(f => (
        <label key={f.key} className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{f.label}</span>
          {f.type === "textarea" ? (
            <textarea value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
          ) : (
            <input type={f.type || "text"} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" required={f.required} />
          )}
        </label>
      ))}
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ক্যাটাগরি</span>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 bg-white">
          <option value="">ক্যাটাগরি নির্বাচন করুন</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      {form.category && (
        <label className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সাবক্যাটাগরি</span>
          <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5 bg-white">
            <option value="">সাবক্যাটাগরি নির্বাচন করুন</option>
            {subcategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
          </select>
        </label>
      )}
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">কালার/হেক্স</span>
        <div className="flex items-center gap-3">
          <input type="color" value={form.color || "#0b3474"} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
          <input value={form.color || "#0b3474"} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
        </div>
      </label>
      <label className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সক্রিয়</span>
        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${form.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {form.isActive !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
        </button>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
        <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? "সেভ হচ্ছে..." : isEdit ? "আপডেট করুন" : "তৈরি করুন"}
        </button>
      </div>
    </form>
  );
};

// ============================================================
// Category Form Component
// ============================================================
const CategoryForm = ({ category, onSave, onCancel, isEdit }) => {
  const [form, setForm] = useState(category);
  const [saving, setSaving] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubId, setNewSubId] = useState("");
  const [newSubTagline, setNewSubTagline] = useState("");
  const [newSubBanner, setNewSubBanner] = useState("");

  const addSubcategory = () => {
    if (!newSubName || !newSubId) return;
    const subs = [...(form.subcategories || [])];
    subs.push({ id: newSubId, name: newSubName, tagline: newSubTagline, banner: newSubBanner || "" });
    setForm({ ...form, subcategories: subs });
    setNewSubName("");
    setNewSubId("");
    setNewSubTagline("");
    setNewSubBanner("");
  };

  const removeSubcategory = (id) => {
    setForm({ ...form, subcategories: (form.subcategories || []).filter(s => s.id !== id) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      if (isEdit) {
        await fetch(`${API_URL}/categories/${form._id}`, { method: "PUT", headers, body: JSON.stringify(form) });
      } else {
        await fetch(`${API_URL}/categories`, { method: "POST", headers, body: JSON.stringify(form) });
      }
      onSave();
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ক্যাটাগরি ID</span>
        <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" required />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">নাম</span>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" required />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">শর্ট নেম</span>
        <input value={form.shortName || ""} onChange={(e) => setForm({ ...form, shortName: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ট্যাগলাইন</span>
        <input value={form.tagline || ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
      </label>
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">বিবরণ</span>
        <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">একসেন্ট কালার</span>
          <div className="flex items-center gap-2">
            <input type="color" value={form.accent || "#0b3474"} onChange={(e) => setForm({ ...form, accent: e.target.value })}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <input value={form.accent || "#0b3474"} onChange={(e) => setForm({ ...form, accent: e.target.value })}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-vision-blue/50" />
          </div>
        </label>
        <label className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সর্ট অর্ডার</span>
          <input type="number" value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" />
        </label>
      </div>
      <label className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সক্রিয়</span>
        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${form.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {form.isActive !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
        </button>
      </label>

      {/* Subcategories */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">সাবক্যাটাগরি</p>
        <div className="space-y-2 mb-3">
          {(form.subcategories || []).map(sc => (
            <div key={sc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-xs font-bold text-gray-900">{sc.name}</p>
                <p className="text-[10px] text-gray-400">{sc.id}</p>
              </div>
              <button type="button" onClick={() => removeSubcategory(sc.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <input value={newSubId} onChange={(e) => setNewSubId(e.target.value)} placeholder="ID"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
          <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="নাম"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
          <input value={newSubTagline} onChange={(e) => setNewSubTagline(e.target.value)} placeholder="ট্যাগলাইন"
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
          <div className="flex gap-1">
            <input value={newSubBanner} onChange={(e) => setNewSubBanner(e.target.value)} placeholder="ব্যানার (URL)"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-vision-blue/50" />
            <button type="button" onClick={addSubcategory} disabled={!newSubName || !newSubId}
              className="px-3 py-2 bg-vision-blue text-white rounded-xl text-[10px] font-bold hover:bg-vision-cyan disabled:opacity-50 transition-all">+</button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">বাতিল</button>
        <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? "সেভ হচ্ছে..." : isEdit ? "আপডেট করুন" : "তৈরি করুন"}
        </button>
      </div>
    </form>
  );
};

// ============================================================
// Add User Form Component
// ============================================================
const AddUserForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", phone: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) onSuccess();
    } catch (error) { console.error(error); }
    setSaving(false);
  };
  const fields = [
    { key: "name", label: "নাম", placeholder: "পূর্ণ নাম" },
    { key: "username", label: "ইউজারনেম", placeholder: "ইউজারনেম" },
    { key: "email", label: "ইমেইল", placeholder: "ইমেইল", type: "email" },
    { key: "password", label: "পাসওয়ার্ড", placeholder: "পাসওয়ার্ড", type: "password" },
    { key: "phone", label: "ফোন", placeholder: "ফোন নম্বর" },
  ];
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(f => (
        <label key={f.key} className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{f.label}</span>
          <input type={f.type || "text"} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5" placeholder={f.placeholder} required />
        </label>
      ))}
      <label className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">রোল</span>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-vision-blue/50 focus:ring-4 focus:ring-vision-blue/5">
          <option value="admin">এডমিন</option><option value="superadmin">সুপার এডমিন</option>
        </select>
      </label>
      <button type="submit" disabled={saving} className="w-full px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">{saving ? "সেভ হচ্ছে..." : "ইউজার তৈরি করুন"}</button>
    </form>
  );
};

export default Dashboard;