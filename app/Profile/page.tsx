"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from "firebase/auth";
import { FiUser, FiMail, FiLock, FiCamera, FiSave } from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!auth) {
      router.push("/Login");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/Login");
        return;
      }
      setUser(currentUser);
      setDisplayName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) return;

    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      if (email !== user.email) {
        await updateEmail(user, email);
      }

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError("New passwords don't match");
          return;
        }

        if (newPassword.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }

        const credential = EmailAuthProvider.credential(
          user.email!,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please log in again to make these changes");
      } else {
        setError(err.message || "Failed to update profile");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Header */}
          <div className="bg-linear-to-r from-[#C67F90] to-pink-400 px-4 sm:px-8 py-8 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 border-4 border-white/30 overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="text-4xl sm:text-6xl" />
                    </div>
                  )}
                </div>

                <button className="absolute bottom-1 right-1 bg-white text-[#C67F90] p-2 rounded-full">
                  <FiCamera />
                </button>
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {user?.displayName || "User"}
                </h1>
                <p className="text-sm sm:text-base text-white/80 mt-2">
                  {user?.email}
                </p>
                <p className="text-xs sm:text-sm mt-2">
                  Member since: {user?.metadata.creationTime}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Profile Settings</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full sm:w-auto px-6 py-2 rounded-full bg-[#C67F90] text-white"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded">{success}</div>}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <Input label="Display Name" icon={<FiUser />} disabled={!isEditing}
                value={displayName} onChange={setDisplayName} />

              <Input label="Email Address" icon={<FiMail />} disabled={!isEditing}
                value={email} onChange={setEmail} type="email" />

              {isEditing && (
                <>
                  <Input label="Current Password" icon={<FiLock />} type="password"
                    value={currentPassword} onChange={setCurrentPassword} />
                  <Input label="New Password" icon={<FiLock />} type="password"
                    value={newPassword} onChange={setNewPassword} />
                  <Input label="Confirm Password" icon={<FiLock />} type="password"
                    value={confirmPassword} onChange={setConfirmPassword} />
                </>
              )}

              {isEditing && (
                <button className="w-full py-3 bg-black text-white rounded-full flex justify-center gap-2">
                  <FiSave /> Save Changes
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Input */
function Input({ label, icon, value, onChange, disabled = false, type = "text" }: any) {
  return (
    <div>
      <label className="flex gap-2 text-sm font-medium mb-1">{icon} {label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#C67F90] disabled:bg-gray-100"
      />
    </div>
  );
}
