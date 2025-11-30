import React, { useEffect } from "react";
import { logout } from "@/components/api";

const LogoutPage = () => {
  useEffect(() => {
    const doLogout = async () => {
      const result = await logout();
      console.log(result); // виж JSON от PHP
      // ако искаш, redirect:
      if (result.success) window.location.href = "/";
    };
    doLogout();
  }, []);

  return <div>Logging out...</div>;
};

export default LogoutPage;
