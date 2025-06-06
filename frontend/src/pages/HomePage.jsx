import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import {
  getoutgoingFriendsReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../mutations/useSignup";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserIcon,
  UserPlusIcon,
} from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import toast from "react-hot-toast";
import { capitialize } from "../lib/utils";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequest, setOutgoingRequest] = useState(new Set());
  const [pendingUserId, setPendingUserId] = useState(null);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedData, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const recommendedUsers = Array.isArray(recommendedData)
    ? recommendedData
    : recommendedData?.recommendedUsers || [];

  const { data: outgoingFriendsReqs = [], isLoading: loadingoutgoingReqs } =
    useQuery({
      queryKey: ["outgoingFriendsReqs"],
      queryFn: getoutgoingFriendsReqs,
    });

  // ✅ Optimistic Mutation
  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onMutate: (userId) => {
      setPendingUserId(userId);

      // Optimistically add to outgoing set
      setOutgoingRequest((prev) => new Set(prev).add(userId));
    },
    onSuccess: (_, userId) => {
      // Make sure it's added to state again
      setOutgoingRequest((prev) => new Set(prev).add(userId));
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendsReqs"] });
      toast.success("Friend request sent successfully!");
    },

    onError: (error, variables, context) => {
      const userId = variables;

      const isAlreadySent =
        error?.response?.data?.message === "Friend request already exists.";

      if (isAlreadySent) {
        // Agar request already exist karti hai, to disable hi rehne do
        setOutgoingRequest((prev) => new Set(prev).add(userId));
      } else {
        // Sirf asli error pe rollback karo
        setOutgoingRequest((prev) => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      }

      console.error(
        "Error sending friend request:",
        error.response?.data || error.message
      );
    },

    onSettled: () => {
      setPendingUserId(null);
    },
  });

useEffect(() => {
  const outgoingIds = new Set();
  if (outgoingFriendsReqs && outgoingFriendsReqs.length > 0) {
    outgoingFriendsReqs.forEach((req) => {
      if (req.receiver) {
        outgoingIds.add(req.receiver);
      }
    });
    console.log("Fetched outgoing request IDs from API:", outgoingIds);
    setOutgoingRequest(outgoingIds);
  }
}, [outgoingFriendsReqs]);


  return (
    <div className="p-4 sm:p-6 lg:-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
          <Link to={"/notification"} className="btn btn-outline btn-sm">
            <UserIcon className="mr-2 size-4" />
            Friends Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your
                  profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequest.has(user._id);
                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-success">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm opacity-70">{user.bio}</p>
                      )}

                      {/* Action button */}

                      {loadingoutgoingReqs ? (
                        <button
                          className="btn w-full mt-2 btn-disabled"
                          disabled
                        >
                          Loading...
                        </button>
                      ) : (
                        <button
                          className={`btn w-full mt-2 ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-success"
                          }`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={
                            hasRequestBeenSent || pendingUserId === user._id
                          }
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircleIcon className="size-4 mr-2" />
                              Request Sent
                            </>
                          ) : pendingUserId === user._id ? (
                            <>Sending...</>
                          ) : (
                            <>
                              <UserPlusIcon className="size-4 mr-2" />
                              Send Friend Request
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;


