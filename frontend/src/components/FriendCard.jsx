import React from "react";
import { LANGUAGE_TO_FLAG } from "../constants";
import { Link } from "react-router";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4 border border-white-400 rounded-xl ">
        {/* User Info  */}
        <div className="flex items-center gap-3 mb-3 ">
         <div className="w-16 h-16 rounded-full overflow-hidden">
  <img
    src={friend.profilePic}
    alt={friend.fullName}
    className="object-cover w-full h-full"
  />
</div>

          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3 ">
          <span className="badge badge-success text-xs rounded">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs rounded">
            {getLanguageFlag(friend.learningLanguage)}
            Native: {friend.learningLanguage}
          </span>
        </div>
        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full rounded">
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;
export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}