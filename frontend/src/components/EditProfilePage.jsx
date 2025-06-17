import React, { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { StreamChat } from "stream-chat";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const EditProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(authUser?.profilePic || "");

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected)); // just for temporary preview
    }
  };

  const { mutate: updateProfile, isLoading } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("fullName", name);
      formData.append("bio", bio);
      if (file) formData.append("profilePic", file);

      const res = await axiosInstance.put("/users/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data; // includes updated profilePic URL
    },
    onSuccess: async (data) => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        const token = localStorage.getItem("stream_token");

        if (token) {
          await client.connectUser(
            {
              id: data._id,
              name: data.fullName,
              image: data.profilePic,
            },
            token
          );

          await client.partialUpdateUser({
            id: data._id,
            set: {
              name: data.fullName,
              image: data.profilePic,
            },
          });

          await client.disconnectUser();
        }
      } catch (err) {
        console.log("Failed to update Stream profile:", err);
      }

      // 👇 also update preview state so that user sees it instantly
      setPreview(data.profilePic);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile();
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="profilePic" className="cursor-pointer relative">
            <img
              src={preview}
              className="w-20 h-20 rounded-full object-cover border"
              alt="Profile Preview"
            />
            <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full">
              <Pencil size={16} className="text-gray-500" />
            </div>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Your bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <button className="btn btn-success w-full rounded" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
