import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../mutations/useSignup";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import toast from "react-hot-toast";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  const queryClient = useQueryClient();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
        toast.success("Logout successful!"); // ✅ show toast here
    },
  });

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO Only in the chat page */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-success" />
                <span
                  className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r 
       from-green-400 to-green-700 tracking-wider"
                >
                  Streamify
                </span>
              </Link>
            </div>
          )}
          <div className="flex items-center gap-3 mr-3 sm:gap-4">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6  text-base-content opacity-70" />
              </button>
            </Link>
          </div>
          {/* Todo */}
          <ThemeSelector />

          <div className="avatar ">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          {/* Logout Button */}
          <button className="btn btn-ghost btn-circle ml-3" onClick={() => logoutMutation()}>
          <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
