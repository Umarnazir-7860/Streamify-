import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../mutations/useSignup";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when we get the authUser result
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat....");
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
        const channelD = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId,yourId]
        // if you start the chat => channelId: [yourId,myId]
        //  => as human we can understand that this is the same channel
        //  but computer dont so thats why we use sort function so after sort => [myId,yourId] it will remain same

        const currChannel=client.channel("messaging",channelD,{
          members:[authUser._id,targetUserId],
        });
        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
        
      } catch (error) {
        console.log("Error initializing chat:" ,error);
        toast.error("Could not connect to chat.Please try again ")
        
      } finally{
        setLoading(false);
      }
    };
    initChat();
  }, [tokenData,authUser,targetUserId]);

  const handleVideoCall=()=>{
  if(channel){
    const calLUrl =`${window.location.origin}/call/${channel.id}`
    channel.sendMessage({
      text:`I've startded a video call.Join me here: ${calLUrl} `
    })
    toast.success("Video call link sent successfully!"); 
  }
  

  };
  if(loading || !chatClient || !channel) return <ChatLoader/>


  // UI
  return <div className="h-[93vh]">
    <Chat client={chatClient}>
      <Channel channel={channel}>
        <div className="w-full relative">
          <CallButton handleVideoCall={handleVideoCall}/>
          <Window>
            <ChannelHeader/>
            <MessageList />
            <MessageInput focus />

          </Window>
        </div>
       <Thread/>
      </Channel>

    </Chat>

  </div>;
};

export default ChatPage;
