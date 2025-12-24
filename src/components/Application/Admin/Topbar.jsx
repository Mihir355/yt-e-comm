"use client";
import React from "react";
import UserDropdown from "./UserDropdown";
import ThemeSwitch from "./ThemeSwitch";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { RiMenu4Fill } from "react-icons/ri";
const Topbar = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <div className="fixed border h-14 w-full top-0 left-0 z-30 md:ps-72 md:pe-8 px-5 flex justify-between items-center">
      <div>search component</div>
      <div className="flex items-center gap-2">
        <ThemeSwitch />
        <UserDropdown />
        <Button
          onClick={toggleSidebar}
          type="button"
          size="item"
          className="ms-2 md:hidden"
        >
          <RiMenu4Fill />
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
