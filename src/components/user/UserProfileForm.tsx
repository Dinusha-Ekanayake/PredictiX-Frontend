"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Briefcase, Building2, User, AlertCircle } from "lucide-react";
import { UserProfileData, updateMyProfile } from "@/lib/api/userProfileApi";
import { toast } from "@/lib/customToast";
import ProfilePhotoUpload from "@/components/common/ProfilePhotoUpload";

interface UserProfileFormProps {
  initialProfile: UserProfileData;
  onProfileUpdated?: (updatedProfile: UserProfileData) => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  address?: string;
}

export function UserProfileForm({
  initialProfile,
  onProfileUpdated,
}: UserProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: initialProfile.firstName || "",
    lastName: initialProfile.lastName || "",
    contactNumber: initialProfile.contactNumber || "",
    address: initialProfile.address || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Update form when initial profile changes
  useEffect(() => {
    setFormData({
      firstName: initialProfile.firstName || "",
      lastName: initialProfile.lastName || "",
      contactNumber: initialProfile.contactNumber || "",
      address: initialProfile.address || "",
    });
  }, [initialProfile]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name must be less than 50 characters";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name must be less than 50 characters";
    }

    if (formData.contactNumber?.trim()) {
      // Basic phone validation - allow various formats
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.contactNumber.replace(/\s/g, ""))) {
        newErrors.contactNumber = "Please enter a valid phone number";
      }
    }

    if (formData.address?.trim() && formData.address.length > 200) {
      newErrors.address = "Address must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile = await updateMyProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber || undefined,
        address: formData.address || undefined,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      onProfileUpdated?.(updatedProfile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: initialProfile.firstName || "",
      lastName: initialProfile.lastName || "",
      contactNumber: initialProfile.contactNumber || "",
      address: initialProfile.address || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const initials = `${initialProfile.firstName?.charAt(0)}${initialProfile.lastName?.charAt(0)}`.toUpperCase();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold overflow-hidden">
                {initialProfile.avatar_url ? (
                  <Image src={initialProfile.avatar_url} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{initialProfile.name}</h1>
                <p className="text-sm text-muted-foreground">{initialProfile.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="default">{initialProfile.role}</Badge>
                  <Badge variant="outline">{initialProfile.status}</Badge>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Read-Only Information Section */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Two Column Grid for Main Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee ID */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mt-0.5">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Employee ID</p>
                  <p className="text-sm font-medium truncate">
                    {initialProfile.employee_id || "N/A"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mt-0.5">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Email</p>
                  <p className="text-sm font-medium truncate">{initialProfile.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mt-0.5">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Phone</p>
                  <p className="text-sm font-medium">
                    {initialProfile.contactNumber || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mt-0.5">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Department</p>
                  <p className="text-sm font-medium">
                    {initialProfile.department || "Not assigned"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 md:col-span-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mt-0.5">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Address</p>
                  <p className="text-sm font-medium break-words">
                    {initialProfile.address || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Warehouse */}
              <div className="flex items-start gap-3 md:col-span-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mt-0.5">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Warehouse</p>
                  <p className="text-sm font-medium">
                    {initialProfile.warehouse || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Edit Profile</CardTitle>
            <CardDescription>Update your personal information and profile photo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo Upload */}
            <div className="mb-6">
              <ProfilePhotoUpload />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <Input
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-destructive" : ""}
                disabled={isLoading}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <Input
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-destructive" : ""}
                disabled={isLoading}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                </div>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <Input
                placeholder="+1 (555) 123-4567"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                className={errors.contactNumber ? "border-destructive" : ""}
                disabled={isLoading}
                aria-invalid={!!errors.contactNumber}
              />
              {errors.contactNumber && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{errors.contactNumber}</p>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-destructive" : ""}
                disabled={isLoading}
                aria-invalid={!!errors.address}
              />
              {errors.address && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{errors.address}</p>
                </div>
              )}
              {formData.address && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.address.length}/200 characters
                </p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets Section */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Assets</CardTitle>
            <CardDescription>
              You have {initialProfile.assignedAssetsCount} assigned assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {initialProfile.assignedAssetsCount > 0 ? (
              <p className="text-sm text-muted-foreground">
                You have {initialProfile.assignedAssetsCount} active assets assigned to you.
                View your dashboard for more details.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No assets currently assigned to you.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
