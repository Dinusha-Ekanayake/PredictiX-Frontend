"use client";

import * as React from "react";
import { Search, Users as UsersIcon, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import PageHero from "@/components/common/PageHero";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  fetchMyProfile, getTeamMembers,
  type UserProfileData, type TeamMemberData,
} from "@/lib/api/userProfileApi";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UserTeamPage() {
  const [profile, setProfile] = React.useState<UserProfileData | null>(null);
  const [team, setTeam] = React.useState<TeamMemberData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const [p, t] = await Promise.all([
          fetchMyProfile(),
          getTeamMembers().catch(() => [] as TeamMemberData[]),
        ]);
        if (cancelled) return;
        setProfile(p);
        setTeam(t);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return team;
    return team.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.department ?? "").toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }, [team, search]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading users…" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="pt-6"><p className="text-red-700 dark:text-red-400">{error}</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHero
        crumbs={["PredictiX", "User", "Users"]}
        title="Users"
        subtitle={`Team members in ${profile?.department ? `the ${profile.department} department` : "your department"}.`}
      />

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersIcon className="h-5 w-5 text-muted-foreground" /> Team Members ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, email, or role…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {search ? "No team members match your search." : "No other team members in your department."}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white">
                            {getInitials(m.name)}
                          </div>
                          <div className="flex flex-col">
                            <span>{m.name}</span>
                            {m.employee_id && <span className="text-xs text-muted-foreground">{m.employee_id}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={m.role === "admin" ? "bg-violet-600" : "bg-blue-600"}>{m.role}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{m.email}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {m.contactNumber
                          ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{m.contactNumber}</span>
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={m.status === "active" ? "bg-emerald-600" : "bg-gray-500"}>{m.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
