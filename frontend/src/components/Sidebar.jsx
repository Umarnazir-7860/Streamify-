import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  console.log("Current Path:", currentPath);
const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);


useEffect(() => {
  const seen = localStorage.getItem("notificationsSeen");
  setHasUnseenNotifications(!seen);

  // Optional: Listen to localStorage changes from other tabs
  const handleStorageChange = () => {
    const seenNow = localStorage.getItem("notificationsSeen");
    setHasUnseenNotifications(!seenNow);
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);
  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col  h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
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
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

   <Link
  to="/notification"
  className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
    currentPath === "/notifications" ? "btn-active" : ""
  }`}
>
  <div className="relative">
    <BellIcon className="size-5 text-base-content opacity-70" />
    
    {hasUnseenNotifications && (
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
    )}
  </div>
  <span>Notifications</span>
</Link>

      </nav>
      {/* User Profile Section */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
