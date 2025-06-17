import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const useFriendRequestPolling = () => {
  const previousRequestIds = useRef(new Set());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5001/api/users/friend-requests/mark-seen", {
          method: "PUT",
          credentials: "include",
        });

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Expected array, got:", data);
          return;
        }

        // Filter unseen requests
        const updated = data
          .filter((n) => !n.seen)
          .map((n) => ({
            ...n,
            type: n.status === "accepted" ? "friend_accept" : "friend_request",
            seen: false,
          }));

        // 🆕 Show toast for new unseen friend requests
        updated.forEach((req) => {
          if (!previousRequestIds.current.has(req._id)) {
    toast.success(
  `${req.sender?.fullName || "New"}  sent friend request`,
  {
    position: "bottom-right",
  }
);


            console.log("Request Sender:", req.sender);


            previousRequestIds.current.add(req._id);
          }
        });

        // Store to localStorage
        localStorage.setItem("friendRequestNotifications", JSON.stringify(updated));

        // 🔁 Notify Sidebar to re-check
        window.dispatchEvent(new Event("friend-request-updated"));
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);
};

export default useFriendRequestPolling;
