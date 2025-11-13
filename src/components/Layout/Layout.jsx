import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const Layout = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update document direction based on language
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navbar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
