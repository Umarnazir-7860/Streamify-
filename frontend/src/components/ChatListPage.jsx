// src/pages/ChatListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { StreamChat } from "stream-chat";
import { getStreamToken } from "../mutations/useSignup";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs"; // 🕒 for time formatting

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatListPage = () => {
  const [chatClient, setChatClient] = useState(null);
  const [channels, setChannels] = useState([]);
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const fetchChannels = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Disconnect existing user to avoid "connectUser called multiple times" warning
        if (client.user) {
          await client.disconnectUser();
        }

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const userChannels = await client.queryChannels({
          members: { $in: [authUser._id] },
        });

        setChatClient(client);
        setChannels(userChannels);
      } catch (error) {
        console.error("❌ Failed to fetch channels:", error);
      }
    };

    fetchChannels();
  }, [tokenData, authUser]);

  const handleChannelClick = (channel) => {
    const members = Object.keys(channel.state.members);
    const targetUserId = members.find((id) => id !== authUser._id);
    navigate(`/chat/${targetUserId}`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📨 Recent Chats</h2>

      {channels.length === 0 ? (
        <p className="text-gray-500 text-center">No chats yet.</p>
      ) : (
        <ul className="space-y-4">
          {channels.map((channel) => {
            const members = Object.values(channel.state.members);
            const otherUser = members.find((m) => m.user?.id !== authUser._id);
            const lastMessage = channel.state.messages?.slice(-1)[0];

            // Get read status
            const isRead = lastMessage?.read_by?.some(
              (u) => u.id === authUser._id
            );

            return (
              <li
                key={channel.id}
                className="group flex items-center gap-4 p-4 border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100  transition cursor-pointer"
                onClick={() => handleChannelClick(channel)}
              >
                <img
                  src={otherUser?.user?.image}
                  alt={otherUser?.user?.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center ">
                    <p className="font-semibold text-white group-hover:text-black">
                      {otherUser?.user?.name}
                    </p>
                    {lastMessage?.created_at && (
                      <span className="text-xs text-white group-hover:text-black">
                        {dayjs(lastMessage.created_at).format("hh:mm A")}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm ${
                        isRead ? "text-gray-600" : "text-white group-hover:text-black font-medium"
                      } truncate max-w-[16rem]`}
                    >
                      {lastMessage?.text || "No messages yet"}
                    </p>
                    {!isRead && lastMessage?.user?.id !== authUser._id && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatListPage;
