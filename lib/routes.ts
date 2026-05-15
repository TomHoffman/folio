/** Temporary route for comparing an alternative homepage on the same branch. */
export const HOME_ALT_PATH = "/home-alt";

export function isHomeHeroPath(pathname: string): boolean {
  return pathname === "/" || pathname === HOME_ALT_PATH;
}
