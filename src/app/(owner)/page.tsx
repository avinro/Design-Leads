import { redirect } from "next/navigation";

/**
 * /owner — redirects to the owner dashboard.
 *
 * The route group root is transparent to URLs so this page handles
 * requests to /owner directly and forwards them to /owner/dashboard.
 */
export default function OwnerRootPage() {
  redirect("/owner/dashboard");
}
