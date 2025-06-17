import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../mutations/useSignup";
import { BellIcon, LogOutIcon, ShipWheelIcon, Pencil } from "lucide-react";
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
      toast.success("Logout successful!");
    },
  });

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-success" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-700 tracking-wider">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 mr-3 sm:gap-4 ml-auto">
            <Link to={"/notification"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          <ThemeSelector />

          {/* Profile Image with Pencil Icon */}
          <Link to="/edit-profile" className="relative avatar hover:opacity-90 group">
            <div className="w-10 h-10 rounded-full overflow-hidden ring ring-success ring-offset-base-100 ring-offset-2 transition">
              <img
                src={authUser?.profilePic}
                alt="Edit Profile"
                className="object-cover w-full h-full"
              />
            </div>
            <Pencil className="absolute -bottom-1 -right-1 bg-base-100 text-success p-0.5 rounded-full size-4 shadow-md hidden group-hover:block" />
          </Link>

          <button className="btn btn-ghost btn-circle ml-3" onClick={() => logoutMutation()}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
