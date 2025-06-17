import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  HomeIcon,
  MessageSquare,
  ShipWheelIcon,
  Users2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);

  useEffect(() => {
    const checkUnseen = () => {
      try {
        const data = localStorage.getItem("friendRequestNotifications");
        const notifications = data ? JSON.parse(data) : [];
        const hasUnseen = notifications.some(
          (n) => n.type === "friend_request" && !n.seen
        );
        setHasUnseenNotifications(hasUnseen);
      } catch (err) {
        console.error("Error parsing notifications:", err);
      }
    };

    checkUnseen();

    // ✅ Listen for custom event
    const handleRefresh = () => checkUnseen();
    window.addEventListener("friend-request-updated", handleRefresh);
    return () =>
      window.removeEventListener("friend-request-updated", handleRefresh);
  }, []);

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-success" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-700 tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      {/* Navigation */}
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
          to="/chats"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <MessageSquare className="size-5 text-base-content opacity-70" />
          <span>Messages</span>
        </Link>

        <Link
          to="/group-chat"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/group-chat" ? "btn-active" : ""
          }`}
        >
          <Users2Icon className="size-5 text-base-content opacity-70" />
          <span>Groups</span>
        </Link>

        <Link
          to="/notification"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notification" ? "btn-active" : ""
          }`}
        >
          <div className="relative">
            <BellIcon className="size-5 text-base-content opacity-70" />
            {hasUnseenNotifications && (
              <>
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full" />
              </>
            )}
          </div>
          <span>Notifications</span>
        </Link>
      </nav>

      {/* User Info */}
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
    </aside>
  );
};

export default Sidebar;
