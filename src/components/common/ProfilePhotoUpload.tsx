"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { fetchMyProfile } from "@/lib/api/userProfileApi";
import { Camera, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePhotoUpload() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("U");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load current profile to get avatar_url and initials
    fetchMyProfile()
      .then((data) => {
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
        if (data.name) {
          const parts = data.name.trim().split(/\s+/).filter(Boolean);
          if (parts.length > 0) {
            if (parts.length === 1) {
              setInitials(parts[0].slice(0, 1).toUpperCase());
            } else {
              setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load profile for avatar:", err);
      });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("predictix.access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/profiles/me/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setAvatarUrl(data.avatar_url);
      
      // Force page reload so the Navbar picks up the new avatar
      // A more robust app might use React Context, but a reload is safe and easy here.
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError("Failed to upload profile photo. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <div 
        className={cn(
          "relative group grid place-items-center rounded-full font-bold text-white text-3xl overflow-hidden",
          "bg-gradient-to-br from-violet-600 to-indigo-600",
          "ring-4 ring-slate-100 dark:ring-slate-800",
          "h-24 w-24 flex-shrink-0 cursor-pointer"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-8 w-8 text-white" />
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-base">Profile Photo</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Upload a new avatar. Recommended size is 256x256px.
        </p>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
