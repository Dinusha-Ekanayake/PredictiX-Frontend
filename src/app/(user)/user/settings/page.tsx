"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageHero from "@/components/common/PageHero";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ProfilePhotoUpload from "@/components/common/ProfilePhotoUpload";
import { fetchMyProfile, updateMyProfile } from "@/lib/api/userProfileApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UserSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMyProfile()
      .then((data) => {
        if (data.settings) {
          setEmailNotifications(data.settings.emailNotifications ?? true);
          setMaintenanceAlerts(data.settings.maintenanceAlerts ?? true);
          setCompactView(data.settings.compactView ?? false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch settings:", err);
        toast.error("Failed to load settings.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMyProfile({
        settings: {
          emailNotifications,
          maintenanceAlerts,
          compactView,
        },
      });
      toast.success("Settings saved successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setEmailNotifications(true);
    setMaintenanceAlerts(true);
    setCompactView(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        crumbs={["PredictiX", "User", "Settings"]}
        title="Settings"
        subtitle="Manage your personal preferences and notifications."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your photo and personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive ticket updates and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 pr-2">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground leading-snug">Receive daily summary reports via email.</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 pr-2">
                <Label className="text-base">Maintenance Alerts</Label>
                <p className="text-sm text-muted-foreground leading-snug">Get notifications when assets require maintenance.</p>
              </div>
              <Switch
                checked={maintenanceAlerts}
                onCheckedChange={setMaintenanceAlerts}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your viewing preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 pr-2">
                <Label className="text-base">Compact View</Label>
                <p className="text-sm text-muted-foreground leading-snug">Display tables and lists in a compact format.</p>
              </div>
              <Switch
                checked={compactView}
                onCheckedChange={setCompactView}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleResetDefaults} disabled={isSaving}>
            Reset Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
