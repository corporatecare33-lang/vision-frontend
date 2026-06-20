import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { adminLogin, seedAdmin } from "../services/productsApi";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const navigate = useNavigate();

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedAdmin();
      alert("এডমিন সফলভাবে তৈরি হয়েছে! এখন লগইন করুন।");
    } catch (err) {
      console.error(err);
      alert("এডমিন আগে থেকেই আছে।");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // সার্ভার লগইন চেষ্টা
      await adminLogin(username, password);
      navigate("/admin");
    } catch (err) {
      // ডেমো লগইন (সার্ভার বন্ধ থাকলে)
      if (username === "superadmin" && password === "admin123") {
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("admin", JSON.stringify({
          name: "কামাল হোসেন",
          username: "superadmin",
          email: "superadmin@gmail.com",
          role: "superadmin"
        }));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/admin");
      } else {
        setError(err.message || "ব্যবহারকারীর নাম বা পাসওয়ার্ড ভুল!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        {/* লোগো ও হেডার */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-orange-700" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">এডমিন প্যানেল</h1>
          <p className="text-gray-500 text-xs mt-1">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {/* লগইন ফর্ম */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ইউজারনেম */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ব্যবহারকারীর নাম
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ইউজারনেম"
                required
              />
            </div>
          </div>

          {/* পাসওয়ার্ড */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="পাসওয়ার্ড"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* ত্রুটি বার্তা */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-xs font-semibold">
              {error}
            </div>
          )}

          {/* সাবমিট বাটন */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs font-bold text-white bg-[#1e3a8a] hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        {/* ডেমো ক্রেডেনশিয়াল */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-2">ডেমো তথ্য:</p>
          <p className="text-xs text-gray-500">ইউজারনেম: superadmin</p>
          <p className="text-xs text-gray-500 mb-2">পাসওয়ার্ড: admin123</p>
          <button
            type="button"
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
          >
            {isSeeding ? "তৈরি হচ্ছে..." : "এডমিন সীড করুন (যদি না থাকে)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;