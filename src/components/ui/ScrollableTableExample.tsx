"use client";

import React from "react";
import {
  ScrollableTable,
  TableRow,
  TableCell,
  UserAvatar,
  RoleBadge,
  StatusBadge,
} from "@/components/ui/ScrollableTable";

// Example data type
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  contact: string;
  status: string;
}

// Example data matching your screenshot
const exampleData: TeamMember[] = [
  {
    id: "1",
    name: "Chathura Gunawardena",
    role: "user",
    email: "chathura.gunawardena.tra2@lankalogix.lk",
    contact: "0755341928",
    status: "active",
  },
  {
    id: "2",
    name: "Chamara Abeysekera",
    role: "user",
    email: "chamara.abeysekera.tra3@lankalogix.lk",
    contact: "0764835030",
    status: "active",
  },
  {
    id: "3",
    name: "Asanka Rajapaksha",
    role: "user",
    email: "asanka.rajapaksha.tra4@lankalogix.lk",
    contact: "0713953767",
    status: "active",
  },
  {
    id: "4",
    name: "Sampath Samarasinghe",
    role: "user",
    email: "sampath.samarasinghe.tra5@lankalogix.lk",
    contact: "0788496965",
    status: "active",
  },
  {
    id: "5",
    name: "Sampath Dissanayake",
    role: "user",
    email: "sampath.dissanayake.tra6@lankalogix.lk",
    contact: "0771012269",
    status: "active",
  },
  {
    id: "6",
    name: "Sachini Kumara",
    role: "user",
    email: "sachini.kumara.tra7@lankalogix.lk",
    contact: "0778480184",
    status: "active",
  },
  {
    id: "7",
    name: "Nimal Jayasinghe",
    role: "user",
    email: "nimal.jayasinghe.tra8@lankalogix.lk",
    contact: "0746270482",
    status: "active",
  },
  {
    id: "8",
    name: "Tharindu Mallawarachchi",
    role: "user",
    email: "tharindu.mallawarachchi.tra9@lankalogix.lk",
    contact: "0748932528",
    status: "active",
  },
  {
    id: "9",
    name: "Arosha Dissanayake",
    role: "user",
    email: "arosha.dissanayake.tra10@lankalogix.lk",
    contact: "0709570154",
    status: "active",
  },
  {
    id: "10",
    name: "Pradeep Madushanka",
    role: "user",
    email: "pradeep.madushanka.tra11@lankalogix.lk",
    contact: "0711718227",
    status: "active",
  },
];

export function ScrollableTeamTableExample() {
  const columns = [
    { key: "name", label: "Name", width: "25%" },
    { key: "role", label: "Role", width: "12%" },
    { key: "email", label: "Email", width: "40%" },
    { key: "contact", label: "Contact", width: "15%" },
    { key: "status", label: "Status", width: "8%" },
  ];

  return (
    <div className="w-full">
      <ScrollableTable
        columns={columns}
        maxHeight="600px"
        title="Team Members"
      >
        {exampleData.map((member) => (
          <TableRow key={member.id}>
            <TableCell width="25%">
              <div className="flex items-center gap-3">
                <UserAvatar name={member.name} color="bg-purple-500" />
                <span className="font-medium">{member.name}</span>
              </div>
            </TableCell>
            <TableCell width="12%">
              <RoleBadge role={member.role} />
            </TableCell>
            <TableCell width="40%">
              <span className="text-muted-foreground text-sm">{member.email}</span>
            </TableCell>
            <TableCell width="15%">
              <span className="text-muted-foreground text-sm">{member.contact}</span>
            </TableCell>
            <TableCell width="8%">
              <StatusBadge status={member.status} />
            </TableCell>
          </TableRow>
        ))}
      </ScrollableTable>
    </div>
  );
}
