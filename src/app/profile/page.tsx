"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Cropper from "react-easy-crop";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; avatar?: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null); // Stores actual pixel crop area

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Load user from localStorage
    } else {
      router.push("/"); // Redirect if not logged in
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  // Extract username from email and remove numbers
  const getUsername = (email: string) => {
    return email.split("@")[0].replace(/[0-9]/g, "");
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Generate preview URL
      setShowCropper(true); // Show cropping UI
    }
  };

  // Handle crop complete
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels); // Store cropped pixel area
  }, []);

  // Convert Cropped Image to Data URL
  const createCroppedImage = async () => {
    if (!preview || !croppedAreaPixels) return;

    return new Promise<string>((resolve, reject) => {
      const image = new window.Image();
      image.src = preview;
      image.crossOrigin = "anonymous"; // Fix CORS issue

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        canvas.width = 200; // Fixed output size
        canvas.height = 200;

        // Crop the selected portion
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

        resolve(canvas.toDataURL("image/png")); // Convert to Data URL
      };

      image.onerror = (error) => reject(error);
    });
  };

  // Save Cropped Image
  const handleCropComplete = async () => {
    try {
      const cropped = await createCroppedImage();
      if (!cropped) return;

      setCroppedImage(cropped); // Show the cropped image
      setShowCropper(false); // Hide cropper

      if (user) {
        const updatedUser = { ...user, avatar: cropped };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Store in localStorage
      }
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          {/* Clickable Profile Image */}
          <label
            className="cursor-pointer relative flex items-center justify-center w-40 h-40 rounded-full border-2 border-gray-300 shadow-lg bg-gray-100 overflow-hidden"
            htmlFor="fileInput"
            onClick={() => setShowCropper(true)}
          >
            {croppedImage || user.avatar ? (
              <Image
                src={croppedImage || user.avatar}
                alt="User Profile"
                width={160}
                height={160}
                className="rounded-full object-cover w-full h-full"
              />
            ) : (
              <span className="text-sm text-gray-500 text-center">Click to add profile pic</span>
            )}
            <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Cropping UI */}
          {showCropper && preview && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
              <div className="relative w-64 h-64">
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete} // Get cropped area pixels
                />
              </div>
              <Button onClick={handleCropComplete} variant="default" className="mt-4">
                Save
              </Button>
            </div>
          )}

          {/* Display only the first part of the email */}
          <p className="text-lg font-semibold">Welcome, {getUsername(user.email)}</p>

          <Button variant="destructive" onClick={handleLogout} className="mt-4">
            Logout
          </Button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
