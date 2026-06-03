"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import ViewAssignedAssetsDialog from "@/components/user/users/ViewAssignedAssetsDialog";

import {
  Boxes,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Edit2,
  Save,
  X,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchMyProfile,
  fetchMyAssets,
  fetchMyStats,
  fetchUserAssets,
  fetchAllUsers,
  updateMyProfile,
  getTeamMembers,
  generateAssetSummary,
  UserProfileData,
  UserAssetData,
  UserStatsData,
  TeamMemberData,
} from "@/lib/api/userProfileApi";

// ---------------------------------------------------------------------------
// Helper: Get initials from name
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Main Page: USER Profile
// ---------------------------------------------------------------------------

export default function UserProfilePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  
  // Profile data
  const [profile, setProfile] = React.useState<UserProfileData | null>(null);
  const [assets, setAssets] = React.useState<UserAssetData[]>([]);
  const [stats, setStats] = React.useState<UserStatsData | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<TeamMemberData[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = React.useState(false);
  
  // Edit mode
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    address: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);
  
  // Assets view modal
  const [showAssetsDialog, setShowAssetsDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [teamMembersSearchQuery, setTeamMembersSearchQuery] = React.useState("");

  // AI summaries per asset: { [asset_id]: { loading, text, expanded } }
  const [summaries, setSummaries] = React.useState<Record<string, { loading: boolean; text: string; expanded: boolean }>>({});

  // Load profile, assets, and stats on mount
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        // Profile first — its assignedAssetsCount already covers both direct
        // (assets.assigned_to) and AssetAssignment-table assignments via max().
        const profileData = await fetchMyProfile();
        setProfile(profileData);

        const [assetsDirect, assetsViaId, statsData] = await Promise.all([
          fetchMyAssets().catch(() => []),
          fetchUserAssets(profileData.id).catch(() => []),
          fetchMyStats().catch(() => ({ assignedAssets: 0, activeAssets: 0 })),
        ]);

        // Merge unique by asset_id (prefer the richer /me/assets entries).
        const byId = new Map<string, UserAssetData>();
        for (const a of assetsViaId) byId.set(a.asset_id, a);
        for (const a of assetsDirect) byId.set(a.asset_id, a);
        let mergedAssets = Array.from(byId.values());

        // Fallback: when there are no direct/assignment-table assignments,
        // show assets in the user's warehouse so the section isn't blank
        // (relevant for admins / managers who oversee a warehouse).
        if (mergedAssets.length === 0 && profileData.warehouse_id) {
          const API =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("token") ||
                localStorage.getItem("predictix.access_token")
              : null;
          try {
            const res = await fetch(
              `${API}/assets/?warehouse_id=${encodeURIComponent(
                profileData.warehouse_id,
              )}&limit=500`,
              {
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              },
            );
            if (res.ok) {
              const raw: any[] = await res.json();
              const loc = profileData.warehouse || "";
              mergedAssets = raw
                .filter((a) => (a.status || "").toLowerCase() !== "retired")
                .map((a) => ({
                  assignment_id: String(a.id),
                  asset_id: String(a.id),
                  asset_code: a.asset_code || "",
                  name: a.asset_name || "",
                  asset_type: a.vehicle_type || a.asset_type || "",
                  category: a.category || null,
                  make: a.make || "",
                  model: a.model || "",
                  location: loc,
                  status: a.status || "active",
                  healthPercent:
                    a.criticality_score != null
                      ? Number(a.criticality_score)
                      : 100,
                  nextServiceDate: a.next_service_date || null,
                  sensorHealth: null,
                }));
            }
          } catch {
            // ignore — keep mergedAssets empty
          }
        }

        setAssets(mergedAssets);
        setStats({
          assignedAssets: Math.max(
            profileData.assignedAssetsCount || 0,
            statsData.assignedAssets || 0,
            mergedAssets.length,
          ),
          activeAssets: Math.max(
            statsData.activeAssets || 0,
            mergedAssets.filter((a) =>
              ["active", "operational", "critical"].includes(
                (a.status || "").toLowerCase(),
              ),
            ).length,
          ),
        });
        
        // Initialize edit form
        setEditForm({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          contactNumber: profileData.contactNumber || "",
          address: profileData.address || "",
        });
        
        // Load team members. /me/colleagues matches by department_id, which
        // can return [] when the current user's department_id doesn't match
        // the seeded department row (e.g. test users). Fall back to listing
        // all users and filtering by department NAME, which matches what the
        // UI shows in the profile card.
        try {
          setTeamMembersLoading(true);
          let teamData = await getTeamMembers().catch(() => []);

          if (teamData.length === 0 && profileData.department) {
            const allUsers = await fetchAllUsers().catch(() => []);
            const myDept = profileData.department.trim().toLowerCase();
            teamData = allUsers
              .filter(
                (u) =>
                  u.id !== profileData.id &&
                  (u.department || "").trim().toLowerCase() === myDept,
              )
              .map<TeamMemberData>((u) => ({
                id: u.id,
                employee_id: null,
                firstName: u.firstName,
                lastName: u.lastName,
                name: u.name,
                email: u.email,
                contactNumber: u.contactNumber || null,
                department: u.department,
                role: u.role,
                status: u.status,
              }));
          }

          setTeamMembers(teamData);
        } catch (tmErr) {
          console.error("Failed to load team members:", tmErr);
          setTeamMembers([]);
        } finally {
          setTeamMembersLoading(false);
        }
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Handle save profile
  async function handleSaveProfile() {
    try {
      setIsSaving(true);
      await updateMyProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        contactNumber: editForm.contactNumber,
        address: editForm.address,
      });
      
      // Refresh profile data
      const updatedProfile = await fetchMyProfile();
      setProfile(updatedProfile);
      setIsEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  // Enrich an asset with the latest sensor reading + real criticality score
  // before sending it to the AI summary model. Needed for warehouse-fallback
  // assets, which arrive without sensor data and with a default 100% health.
  async function enrichAssetForSummary(
    asset: UserAssetData,
  ): Promise<UserAssetData> {
    const hasSensors =
      asset.sensorHealth &&
      Object.values(asset.sensorHealth).some((v) => v != null);
    if (hasSensors && asset.healthPercent !== 100) {
      return asset;
    }

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          localStorage.getItem("predictix.access_token")
        : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const [sensorRes, assetRes] = await Promise.all([
      fetch(`${API}/sensor-readings/asset/${asset.asset_id}`, { headers }).catch(
        () => null,
      ),
      fetch(`${API}/assets/${asset.asset_id}`, { headers }).catch(() => null),
    ]);

    let sensorHealth = asset.sensorHealth;
    if (sensorRes && sensorRes.ok) {
      const rows: any[] = await sensorRes.json().catch(() => []);
      const latest = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      if (latest) {
        const num = (v: any) =>
          v == null ? null : Number.parseFloat(String(v));
        sensorHealth = {
          tire: num(latest.tire_health_pct),
          brake: num(latest.brake_health_pct),
          battery: num(latest.battery_health_pct),
          oil: num(latest.oil_life_pct),
          hydraulic: num(latest.hydraulic_health_pct),
        };
      }
    }

    let healthPercent = asset.healthPercent;
    let make = asset.make;
    let model = asset.model;
    let assetType = asset.asset_type;
    if (assetRes && assetRes.ok) {
      const full: any = await assetRes.json().catch(() => null);
      if (full) {
        if (full.criticality_score != null) {
          healthPercent = Number.parseFloat(String(full.criticality_score));
        }
        if (!make && full.make) make = full.make;
        if (!model && full.model) model = full.model;
        if (!assetType && (full.vehicle_type || full.asset_type)) {
          assetType = full.vehicle_type || full.asset_type;
        }
      }
    }

    return {
      ...asset,
      asset_type: assetType,
      make,
      model,
      healthPercent,
      sensorHealth,
    };
  }

  // Fetch AI summary for a single asset (on demand)
  async function fetchSummary(asset: UserAssetData) {
    const id = asset.asset_id;
    if (summaries[id]?.text || summaries[id]?.loading) return;
    setSummaries((prev) => ({ ...prev, [id]: { loading: true, text: "", expanded: true } }));
    try {
      const enriched = await enrichAssetForSummary(asset);
      const text = await generateAssetSummary(enriched);
      setSummaries((prev) => ({ ...prev, [id]: { loading: false, text, expanded: true } }));
    } catch {
      setSummaries((prev) => ({ ...prev, [id]: { loading: false, text: "Summary unavailable.", expanded: true } }));
    }
  }

  function toggleSummary(asset: UserAssetData) {
    const id = asset.asset_id;
    if (!summaries[id]?.text && !summaries[id]?.loading) {
      fetchSummary(asset);
    } else {
      setSummaries((prev) => ({
        ...prev,
        [id]: { ...prev[id], expanded: !prev[id]?.expanded },
      }));
    }
  }

  // Filter assets by search
  const filteredAssets = React.useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const query = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.category?.toLowerCase().includes(query) ||
        a.location.toLowerCase().includes(query)
    );
  }, [assets, searchQuery]);

  // Filter team members by search
  const filteredTeamMembers = React.useMemo(() => {
    if (!teamMembersSearchQuery.trim()) return teamMembers;
    const query = teamMembersSearchQuery.toLowerCase();
    return teamMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.firstName.toLowerCase().includes(query) ||
        m.lastName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.department?.toLowerCase().includes(query)
    );
  }, [teamMembers, teamMembersSearchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading your profile…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No profile data found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // True when the asset list comes from the warehouse fallback rather than
  // direct user assignments (e.g. admins overseeing a warehouse).
  const isWarehouseFallback =
    assets.length > 0 &&
    (profile?.assignedAssetsCount ?? 0) === 0;

  return (
    <div className="w-full space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              {isWarehouseFallback ? "Warehouse Assets" : "My Assets"}
            </CardTitle>
            <Boxes className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.assignedAssets || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {isWarehouseFallback
                ? `In ${profile?.warehouse || "your warehouse"}`
                : "Assigned to you"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Status
            </CardTitle>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">
                {profile.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Your account status</p>
          </CardContent>
        </Card>
      </div>

      {/* My Profile Section */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">My Profile</CardTitle>
          {!isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit My Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4 pb-6 border-b">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-semibold text-white">
                {getInitials(profile.name)}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-2xl font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.employee_id}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-violet-600">{profile.role}</Badge>
                  <Badge className="bg-emerald-600">{profile.status}</Badge>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            {!isEditMode ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base">{profile.firstName} {profile.lastName}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{profile.email}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{profile.contactNumber || "Not set"}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{profile.address || "Not set"}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{profile.department || "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{profile.warehouse || "N/A"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={editForm.contactNumber}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          contactNumber: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving…" : "Save Changes"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Assigned Assets Section */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">
            {isWarehouseFallback
              ? `Assets in ${profile?.warehouse || "My Warehouse"}`
              : "My Assigned Assets"}{" "}
            ({assets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets by name, category, or location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Assets Table */}
            {filteredAssets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery ? "No assets match your search" : "No assets assigned yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto scrollbar-styled max-h-[32rem]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Health</TableHead>
                      <TableHead className="text-right">AI Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => {
                      const sum = summaries[asset.asset_id];
                      return (
                        <React.Fragment key={asset.asset_id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div>
                                <p>{asset.name}</p>
                                <p className="text-xs text-muted-foreground">{asset.asset_code}</p>
                              </div>
                            </TableCell>
                            <TableCell>{asset.category || "—"}</TableCell>
                            <TableCell>{asset.location}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                  <div
                                    className={`h-2 rounded-full ${
                                      asset.healthPercent >= 80
                                        ? "bg-emerald-500"
                                        : asset.healthPercent >= 60
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${Math.min(asset.healthPercent, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-10 text-right">
                                  {Math.round(asset.healthPercent)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                                onClick={() => toggleSummary(asset)}
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                {sum?.loading ? "Generating…" : sum?.text ? (sum.expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />) : "Summarize"}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {sum?.expanded && (sum.loading || sum.text) && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-violet-50/60 dark:bg-violet-950/20 py-3 px-4">
                                {sum.loading ? (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Sparkles className="h-4 w-4 animate-pulse text-violet-500" />
                                    Generating AI summary…
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-violet-500" />
                                    <p className="text-sm text-foreground leading-relaxed">{sum.text}</p>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Assets Dialog */}
      <ViewAssignedAssetsDialog
        userName={profile.name}
        assets={filteredAssets.map((a) => ({
          id: a.asset_id,
          name: a.name,
          category: a.category || "",
          location: a.location,
          healthPercent: a.healthPercent,
        }))}
        isLoading={false}
        open={showAssetsDialog}
        onOpenChange={setShowAssetsDialog}
      />

      {/* Team Members in Same Department Section */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">
            Team Members in {profile?.department || "Your Department"} ({filteredTeamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members by name, email, or role…"
                value={teamMembersSearchQuery}
                onChange={(e) => setTeamMembersSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Team Members Table */}
            {teamMembersLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading team members…</p>
              </div>
            ) : filteredTeamMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {teamMembersSearchQuery ? "No team members match your search" : "No other team members in your department"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto scrollbar-styled max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white">
                              {getInitials(member.name)}
                            </div>
                            <div className="flex flex-col">
                              <span>{member.name}</span>
                              <span className="text-xs text-muted-foreground">{member.employee_id}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={member.role === "admin" ? "bg-violet-600" : "bg-blue-600"}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{member.email}</TableCell>
                        <TableCell className="text-sm">{member.contactNumber || "—"}</TableCell>
                        <TableCell>
                          <Badge className={member.status === "active" ? "bg-emerald-600" : "bg-gray-600"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
