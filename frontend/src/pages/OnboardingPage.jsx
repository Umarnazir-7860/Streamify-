import React, { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"
import { completeOnboarding } from "../mutations/useSignup";
import {
  CameraIcon,
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
} from "lucide-react";
import { LANGUAGES } from "../constants/index";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

const navigate = useNavigate(); // ✅ initialize navigator
const { mutate: onboardingMutation, isPending } = useMutation({
  mutationFn: completeOnboarding,
  onSuccess: async () => {
    toast.success("Profile Onboarding successfully!");

    // Invalidate the query and wait for it to refetch
    await queryClient.invalidateQueries({ queryKey: ["authUser"] });

    // Wait for a small delay (ensure update)
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 300); // slight delay to ensure new authUser is set
  },
  onError: (error) => {
    toast.error(error?.response?.data?.message || "Onboarding failed");
  },
});


  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("fullName", formState.fullName);
    data.append("bio", formState.bio);
    data.append("nativeLanguage", formState.nativeLanguage);
    data.append("learningLanguage", formState.learningLanguage);
    data.append("location", formState.location);

    // ✅ Only send file if it's actually a File
    if (formState.profilePic instanceof File) {
      data.append("profilePic", formState.profilePic);
    }

    onboardingMutation(data);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-3xl shadow-xl bg-base-200">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={
                      typeof formState.profilePic === "string"
                        ? formState.profilePic
                        : URL.createObjectURL(formState.profilePic)
                    }
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormState({ ...formState, profilePic: file });
                  }
                }}
              />
            </div>

            {/* Full Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text ml-1">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Enter your full name"
              />
            </div>

            {/* Bio */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text ml-1">Bio</span>
              </label>
              <input
                type="text"
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
                placeholder="Tell us about yourself"
              />
            </div>

            {/* Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      nativeLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select Your Native Language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      learningLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="btn btn-success w-full"
              type="submit"
              disabled={isPending}
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
