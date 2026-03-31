"use client";

import * as React from "react";
import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpDeskButton() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Check for user role (correct auth key)
    const userRole = localStorage.getItem("predictix.user.role");
    setIsLoggedIn(!!userRole);
  }, []);

  if (!mounted || !isLoggedIn) {
    return null;
  }

  return (
    <Link href="/help-desk">
      <Button
        className="fixed bottom-8 left-8 rounded-full shadow-lg hover:shadow-xl z-40 bg-primary hover:bg-primary/90"
        size="lg"
      >
        <CircleHelp className="size-5 mr-2" />
        Help Desk
      </Button>
    </Link>
  );
}
