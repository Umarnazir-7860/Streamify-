import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../mutations/useSignup";
import {
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [unseenCount, setUnseenCount] = useState(0);

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend Request Accepted");
    },
  });

  const incomingRequests = friendRequests?.incommingReqs || [];

  const acceptedRequests = (friendRequests?.acceptedReqs || []).filter(
    (notification) => notification.recipient && notification.recipient.fullName
  );

  const totalNotifications = incomingRequests.length + acceptedRequests.length;

  // Fetch and mark notifications as seen on mount
useEffect(() => {
  const markSeenAndShowToast = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/friend-requests/mark-seen", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Mark seen error:", res.status, text);
        return;
      }

      const data = await res.json();
      const unseen = data.filter((n) => !n.seen);
      setUnseenCount(unseen.length);

      // ✅ Check for new unseen friend requests and toast the sender's name
      const prevData = JSON.parse(localStorage.getItem("friendRequestNotifications")) || [];
      const newOnes = data.filter(
        (n) => !prevData.some((old) => old._id === n._id) && n.sender?.fullName
      );

      newOnes.forEach((n) => {
        toast.success(`New friend request from ${n.sender.fullName}`, {
          id: `friend-${n._id}`,
        });
      });

      // ✅ Update localStorage and trigger refresh
      localStorage.setItem("friendRequestNotifications", JSON.stringify(data));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("friend-request-updated"));
    } catch (error) {
      console.error("Error marking notifications as seen:", error);
    }
  };

  markSeenAndShowToast();
}, []);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 flex items-center gap-2">
          Notifications
          {totalNotifications > 0 && (
            <span className="badge badge-success text-black text-xs rounded">
              {totalNotifications}
            </span>
          )}
          {unseenCount > 0 && (
            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          )}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-success" />
                  Friend Requests
                  <span className="badge badge-success ml-2 rounded">
                    {incomingRequests.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14  rounded-full bg-base-300">
                              <img
                                src={request.sender.profilePic}
                                alt={request.sender.fullName}
                                className="  w-14 h-14 avatar rounded-full "
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {request.sender.fullName}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-success p-3 badge-sm rounded">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline p-3 badge-sm rounded">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-success rounded btn-sm"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div
                      key={notification._id}
                      className="card bg-base-200 shadow-sm"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={
                                notification.recipient?.profilePic ||
                                "/default-profile-pic.jpg"
                              }
                              alt={notification.recipient?.fullName}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {notification.recipient.fullName}
                            </h3>
                            <p className="text-sm my-1">
                              {notification.recipient.fullName} accepted your
                              friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 &&
              acceptedRequests.length === 0 && <NoNotificationsFound />}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
