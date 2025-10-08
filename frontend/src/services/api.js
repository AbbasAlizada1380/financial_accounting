import axios from "axios";
import { store } from "../state/store";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// این رهگیر توکن احراز هویت را به درستی به هر درخواست اضافه می‌کند
api.interceptors.request.use(
  (config) => {
    const token = store.getState().user.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- جدید: رهگیر پاسخ برای مدیریت خطاهای سراسری ---
// این به شما امکان می‌دهد تا خطاهای رایج (مانند 401 Unauthorized) را در یک مکان مدیریت کنید.
api.interceptors.response.use(
  (response) => response, // در صورت موفقیت، فقط پاسخ را برگردانید
  (error) => {
    // اگر یک پاسخ خطا از سرور وجود دارد
    if (error.response) {
      const { status } = error.response;

      // اگر توکن منقضی شده یا نامعتبر است (خطای 401)
      if (status === 401) {
        // در اینجا می‌توانید منطق خروج از سیستم را پیاده‌سازی کنید.
        // برای مثال، یک action در Redux را dispatch کنید تا کاربر را از سیستم خارج کند.
        // store.dispatch(logoutUser());
        console.error("خطای احراز هویت: کاربر از سیستم خارج شد.");
      }

      // می‌توانید برای کدهای خطای دیگر نیز مدیریت اضافه کنید
      // if (status === 500) {
      //   console.error("خطای داخلی سرور.");
      // }
    }

    // خطا را برای مدیریت بیشتر در کامپوننت‌ها (مثلاً useQuery) رد کنید
    return Promise.reject(error);
  }
);

// --- توابع API ---

// محصولات را با پارامترهای صفحه‌بندی واکشی می‌کند
export const fetchProducts = async (params) => {
  // مسیر اصلاح شده: /api/v1/inventory/products/
  const response = await api.get("/api/v1/inventory/products/", { params });
  return response.data;
};

// یک محصول واحد را با شناسه آن واکشی می‌کند
export const fetchProductById = async (productId) => {
  const { data } = await api.get(`/api/v1/inventory/products/${productId}/`);
  return data;
};

// تمام دسته‌بندی‌ها را واکشی می‌کند
export const fetchCategories = async () => {
  const { data } = await api.get("/api/v1/categories/categories/", {
    params: { page_size: 100 }, // دریافت تا 100 دسته‌بندی
  });
  return data;
};

// آمارهای داشبورد را واکشی می‌کند
export const fetchDashboardStats = async (filters = {}) => {
  const { data } = await api.get("/api/v1/reporting/dashboard-stats/", {
    params: filters,
  });
  return data;
};

// داده‌های فروش و سود را که بر اساس ماه گروه‌بندی شده‌اند برای چارت‌ها واکشی می‌کند
export const fetchSalesOverTime = async (filters = {}) => {
  const { data } = await api.get("/api/v1/reporting/sales-over-time/", {
    params: filters,
  });
  return data;
};

// محصولات با بهترین عملکرد را بر اساس درآمد و واحدهای فروخته شده واکشی می‌کند
export const fetchProductPerformance = async (filters = {}) => {
  const { data } = await api.get("/api/v1/reporting/product-performance/", {
    params: filters,
  });
  return data;
};

// سودآوری هر دسته‌بندی را واکشی می‌کند
export const fetchCategoryProfitability = async (filters = {}) => {
  const { data } = await api.get("/api/v1/reporting/category-profitability/", {
    params: filters,
  });
  return data;
};
