import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { StreamChat } from "stream-chat";
import { getStreamToken } from "../mutations/useSignup";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { MoreVertical, Pin, PinOff, Trash2 } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatListPage = () => {
  const [chatClient, setChatClient] = useState(null);
  const [channels, setChannels] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const fetchChannels = async (client) => {
    if (!client || !authUser) return;

    try {
      const result = await client.queryChannels(
        { members: { $in: [authUser._id] } },
        { last_message_at: -1 },
        {
          watch: true,
          presence: true,
          state: true,
          messages: { limit: 1 },
        }
      );

      setChannels(result);
    } catch (err) {
      console.error("❌ Channel fetch error:", err);
    }
  };

  useEffect(() => {
    const setupClient = async () => {
      if (!authUser || !tokenData?.token) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        if (client.userID && client.userID !== authUser._id) {
          await client.disconnectUser();
        }

        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        setChatClient(client);
        fetchChannels(client);
      } catch (err) {
        console.error("❌ Connection error:", err);
      }
    };

    setupClient();
  }, [authUser, tokenData?.token]);

  useEffect(() => {
    if (!chatClient) return;

    const handleEvent = async () => {
      await fetchChannels(chatClient);
    };

    chatClient.on("message.new", handleEvent);
    chatClient.on("message.read", handleEvent);
    chatClient.on("user.presence.changed", handleEvent);

    return () => {
      chatClient.off("message.new", handleEvent);
      chatClient.off("message.read", handleEvent);
      chatClient.off("user.presence.changed", handleEvent);
    };
  }, [chatClient]);

  const handleChannelClick = async (channel) => {
    try {
      await channel.markRead();
    } catch (err) {
      console.error("❌ Error marking as read:", err);
    }

    const members = Object.keys(channel.state.members);
    const otherUserId = members.find((id) => id !== authUser._id);
    navigate(`/chat/${otherUserId}`);
  };

  const handlePinToggle = (channelId) => {
    setPinnedIds((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleDelete = async (channel) => {
    const confirmed = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmed) return;

    try {
      await channel.delete();
      setChannels((prev) => prev.filter((ch) => ch.id !== channel.id));
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  const sortedChannels = [...channels].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📨 Recent Chats</h2>

      {sortedChannels.length === 0 ? (
        <p className="text-gray-500 text-center">No chats yet.</p>
      ) : (
        <ul className="space-y-4">
          {sortedChannels.map((channel) => {
            const members = Object.values(channel.state.members);
            const otherUser = members.find((m) => m.user?.id !== authUser._id);
            const lastMessage = [...channel.state.messages].slice(-1)[0];
            const isSentByMe = lastMessage?.user?.id === authUser._id;

            const isUnread =
              !isSentByMe &&
              !lastMessage?.read_by?.some((u) => u.id === authUser._id);

            const isOnline = otherUser?.user?.online;
            const isPinned = pinnedIds.includes(channel.id);

            return (
              <li
                key={channel.id}
                className="group flex items-start gap-4 p-4 border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition relative"
              >
                <img
                  src={otherUser?.user?.image}
                  alt={otherUser?.user?.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div className="flex-1" onClick={() => handleChannelClick(channel)}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-white group-hover:text-black flex items-center gap-1">
                      {otherUser?.user?.name}
                      {isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
                    </p>
                    <span className="text-xs text-gray-400">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate max-w-[14rem] ${
                          isSentByMe
                            ? "text-gray-500"
                            : isUnread
                            ? "text-white group-hover:text-black font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {lastMessage?.text || "No messages yet"}
                      </p>
                      {lastMessage && isSentByMe && (
                        <span className="text-xs">
                          {lastMessage.read_by?.some(
                            (u) => u.id === otherUser?.user?.id
                          ) ? (
                            <FaCheckDouble className="text-blue-500" />
                          ) : (
                            <FaCheck className="text-gray-400" />
                          )}
                        </span>
                      )}
                      {!isSentByMe && isUnread && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    {lastMessage?.created_at && (
                      <span className="text-xs text-white group-hover:text-black">
                        {dayjs(lastMessage.created_at).format("hh:mm A")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dot Menu */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setMenuOpenId((prev) => (prev === channel.id ? null : channel.id))
                    }
                    className="text-white hover:text-black"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpenId === channel.id && (
                    <div className="absolute right-0 top-6 bg-white shadow-md rounded border w-36 z-10">
                      <button
                        onClick={() => {
                          handlePinToggle(channel.id);
                          setMenuOpenId(null);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-black"
                      >
                        {isPinned ? (
                          <>
                            <PinOff className="w-4 h-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4" />
                            Pin
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(channel);
                          setMenuOpenId(null);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-black"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
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
