"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageHero from "@/components/common/PageHero";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ProfilePhotoUpload from "@/components/common/ProfilePhotoUpload";

export default function UserSettingsPage() {
  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <PageHero
        crumbs={["PredictiX", "User", "Settings"]}
        title="Settings"
        subtitle="Manage your personal preferences and notifications."
      />

      <div className="max-w-3xl space-y-6">
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates on your tickets via email.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when assigned assets are scheduled for maintenance.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your viewing preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Compact View</Label>
                <p className="text-sm text-muted-foreground">Display tables and lists in a compact format.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset Defaults</Button>
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
