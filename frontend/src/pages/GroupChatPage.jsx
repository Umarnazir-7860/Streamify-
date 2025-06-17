import React, { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../mutations/useSignup";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatPage = () => {
  const { authUser } = useAuthUser();
  const [friends, setFriends] = useState([]);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // ✅ Fetch friends with enhanced error log
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch("/api/users/friends", {
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        setFriends(data);
      } catch (error) {
        console.error("❌ Error fetching friends:", error);
        toast.error("Failed to fetch friends");
      }
    };

    if (authUser) fetchFriends();
  }, [authUser]);

  // ✅ Connect to Stream
  useEffect(() => {
    if (tokenData?.token && authUser) {
      const client = StreamChat.getInstance(STREAM_API_KEY);
      client
        .connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        )
        .then(() => setChatClient(client))
        .catch((err) => {
          console.error("❌ Stream connection error:", err);
          toast.error("Stream connection failed");
        });
    }
  }, [tokenData, authUser]);

  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      setGroupDetails(data);
    } catch (err) {
      console.error("❌ Error fetching group details:", err);
      toast.error("Failed to fetch group details");
    }
  };

  const handleCreateGroup = async () => {
    try {
      const groupName = `${authUser.fullName}'s Group`;
      const members = [...new Set([...selectedUsers, authUser._id])];

      const newChannel = chatClient.channel(
        "messaging",
        groupName.toLowerCase().replace(/\s+/g, "-"),
        {
          name: groupName,
          members,
        }
      );

      await newChannel.watch();
      setChannel(newChannel);
      await fetchGroupDetails(newChannel.id);
      toast.success("Group created!");
    } catch (err) {
      console.error("❌ Error creating group:", err);
      toast.error("Group creation failed");
    }
  };

  const handleRemoveMember = async (groupId, userId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/remove/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      toast.success("Member removed");
      await fetchGroupDetails(groupId);
    } catch (err) {
      console.error("❌ Error removing member:", err);
      toast.error("Failed to remove member");
    }
  };

  const filteredFriends = friends.filter((user) =>
    user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (!chatClient) return <div className="p-4">Connecting...</div>;

  return (
    <div className="h-screen bg-gray-50 p-4">
      {!channel ? (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Create Group Chat
          </h2>

          <div>
            <p className="text-gray-600 text-sm mb-1">Search Friends</p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleToggleUser(user._id)}
                  className={`flex items-center gap-3 p-2 border rounded-md cursor-pointer transition ${
                    selectedUsers.includes(user._id)
                      ? "bg-blue-100 border-blue-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={user.profilePic}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm col-span-2">No friends found.</p>
            )}
          </div>

          <button
            disabled={selectedUsers.length === 0}
            onClick={handleCreateGroup}
            className={`w-full py-2 rounded-md font-medium text-white ${
              selectedUsers.length > 0
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Create Group
          </button>
        </div>
      ) : (
        <Chat client={chatClient} theme="str-chat__theme-light">
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />

              {groupDetails && (
                <div className="p-4 border-t mt-4">
                  <h3 className="font-semibold mb-2 text-lg">Group Members</h3>
                  <ul className="space-y-2">
                    {groupDetails.members.map((member) => (
                      <li
                        key={member._id}
                        className="flex justify-between items-center"
                      >
                        <span>
                          {member.fullName}
                          {groupDetails.admins.includes(member._id) && (
                            <span className="ml-2 text-xs text-blue-600 font-semibold">
                              (Admin)
                            </span>
                          )}
                        </span>

                        {groupDetails.admins.includes(authUser._id) &&
                          member._id !== authUser._id && (
                            <button
                              className="text-red-500 hover:underline text-sm"
                              onClick={() =>
                                handleRemoveMember(groupDetails._id, member._id)
                              }
                            >
                              Remove
                            </button>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Window>
          </Channel>
        </Chat>
      )}
    </div>
  );
};

export default GroupChatPage;
