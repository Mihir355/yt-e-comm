import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AiOutlineLogout } from "react-icons/ai";
import { useDispatch } from "react-redux";
import axios from "axios";
import { WEBSITE_LOGIN } from "../../../../routes/WebsiteRoute";
import { showToast } from "@/lib/showToast";
import { logout } from "@/store/reducer/authReducer";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const { data: logoutResponse } = await axios.post("/api/auth/logout");

      if (!logoutResponse.success) {
        throw new Error(logoutResponse.message);
      }

      showToast("success", logoutResponse.message);
      dispatch(logout()); // if you have a logout action
      router.push(WEBSITE_LOGIN);
    } catch (error) {
      showToast("error", error.message);
    }
  };
  return (
    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
      <AiOutlineLogout color="red" />
      Logout
    </DropdownMenuItem>
  );
};

export default LogoutButton;
