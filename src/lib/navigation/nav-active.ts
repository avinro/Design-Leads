/**
 * Returns true when `pathname` is exactly `href` or a nested path under it
 * (e.g. /work/slug matches href /work). Used for primary nav active states.
 */
export function isNavSectionActive(pathname: string | null | undefined, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}
