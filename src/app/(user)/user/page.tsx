import { redirect } from "next/navigation";

// Plain `/user` has no UI of its own — send users to their dashboard.
export default function UserRootRedirect() {
  redirect("/user/dashboard");
}
