"use client";

import { useEffect, useState, ChangeEvent, useCallback } from "react";
import SignIn from "./signin";
import { Button } from "../ui/button";
import Image from "next/image";
import Cropper from "react-easy-crop";
// import { supabase } from "@/lib/supabase"; // Real auth calls (not used in fake login)

interface AppUser {
  id: string;
  email: string;
  avatar?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

const NavBar = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  
  // Cropping state
  const [preview, setPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Update user from localStorage
  const updateUser = () => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  useEffect(() => {
    updateUser();
    window.addEventListener("userUpdate", updateUser);
    return () => window.removeEventListener("userUpdate", updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    // supabase.auth.signOut(); // Uncomment if using real auth
  };

  // Use full_name from metadata if available; otherwise, derive from email.
  const getUsername = (user: AppUser) =>
    user.user_metadata?.full_name || user.email.split("@")[0].replace(/[0-9]/g, "");

  // Determine avatar URL; if none exists, return empty string.
  const getAvatarUrl = (user: AppUser) =>
    user.user_metadata?.avatar_url || user.avatar || "";

  // Handle file selection to update profile image (opens cropper)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setShowCropper(true);
    }
  };

  // Cropper onCropComplete callback to store crop pixels
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create a cropped image using a canvas
  const createCroppedImage = async (): Promise<string | null> => {
    if (!preview || !croppedAreaPixels) return null;
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.src = preview;
      image.crossOrigin = "anonymous"; // Fix CORS if needed
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        canvas.width = 200; // Fixed output size
        canvas.height = 200;
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = (err) => reject(err);
    });
  };

  // Save the cropped image and update user avatar in localStorage
  const handleCropSave = async () => {
    const cropped = await createCroppedImage();
    if (cropped && user) {
      const updatedUser = { ...user, avatar: cropped };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("userUpdate"));
      setShowCropper(false);
      setPreview(null);
    }
  };

  return (
    <div className="fixed flex w-full items-center justify-end p-4">
      <div className="mr-5">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Wrap profile image/placeholder in a label to trigger file input */}
              <label htmlFor="profileImageInput" className="cursor-pointer">
                {getAvatarUrl(user) ? (
                  <Image
                    src={getAvatarUrl(user)}
                    alt="Profile Pic"
                    width={80}
                    height={60}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-500">
                    {getUsername(user)[0].toUpperCase()}
                  </div>
                )}
              </label>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="font-semibold">Welcome, {getUsername(user)}</span>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-white text-red-500 border border-red-500"
            >
              Logout
            </Button>
          </div>
        ) : (
          <SignIn />
        )}
      </div>
      {showCropper && preview && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative w-64 h-64">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <Button onClick={handleCropSave} variant="default" className="mt-4">
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
