import { useState, useEffect } from "react";

const useUnseenFriendRequestCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const stored = JSON.parse(localStorage.getItem("friendRequestNotifications")) || [];
      setCount(stored.length);
    };

    updateCount();

    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  return count;
};

export default useUnseenFriendRequestCount;
