"use client";

import React, { useState, useEffect } from "react";
import { UserProfileForm } from "@/components/user/UserProfileForm";
import { fetchMyProfile, UserProfileData } from "@/lib/api/userProfileApi";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profileData = await fetchMyProfile();
        setProfile(profileData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
        console.error("Profile load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 p-4 md:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted animate-spin mb-3">
                  <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-foreground animate-spin" />
                </div>
                <p className="text-muted-foreground">Loading your profile...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Profile</h2>
              <p className="text-muted-foreground">
                {error || "Unable to load your profile. Please try again later."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      <UserProfileForm
        initialProfile={profile}
        onProfileUpdated={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
      />
    </div>
  );
}
