import type { AdminRole } from "@/types/admin";

export type Permission =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "publish"
  | "export"
  | "import"
  | "manage";

export type Resource =
  | "colleges"
  | "courses"
  | "exams"
  | "news"
  | "study-abroad"
  | "enquiries"
  | "leads"
  | "newsletter"
  | "users"
  | "admins"
  | "settings"
  | "analytics"
  | "logs";

const PERMISSION_MAP: Record<AdminRole, Record<Resource, Permission[]>> = {
  SUPER_ADMIN: {
    colleges: ["view", "create", "edit", "delete", "export", "import", "manage"],
    courses: ["view", "create", "edit", "delete", "export", "import", "manage"],
    exams: ["view", "create", "edit", "delete", "export", "import", "manage"],
    news: ["view", "create", "edit", "delete", "publish", "export", "manage"],
    "study-abroad": ["view", "create", "edit", "delete", "import", "manage"],
    enquiries: ["view", "create", "edit", "delete", "export", "manage"],
    leads: ["view", "create", "edit", "delete", "export", "manage"],
    newsletter: ["view", "manage", "export", "delete"],
    users: ["view", "manage", "export", "delete"],
    admins: ["view", "create", "edit", "delete", "manage"],
    settings: ["view", "edit", "manage"],
    analytics: ["view"],
    logs: ["view"],
  },
  ADMIN: {
    colleges: ["view", "create", "edit", "delete", "export", "import"],
    courses: ["view", "create", "edit", "delete", "export"],
    exams: ["view", "create", "edit", "delete", "export"],
    news: ["view", "create", "edit", "delete", "publish", "export", "import"],
    "study-abroad": ["view", "create", "edit", "delete", "import"],
    enquiries: ["view", "edit", "export", "delete"],
    leads: ["view", "edit", "export", "delete"],
    newsletter: ["view", "manage", "export"],
    users: ["view", "manage", "export"],
    admins: [],
    settings: ["view"],
    analytics: ["view"],
    logs: ["view"],
  },
  EDITOR: {
    colleges: ["view", "create", "edit"],
    courses: ["view", "create", "edit"],
    exams: ["view", "create", "edit"],
    news: ["view", "create", "edit", "publish"],
    "study-abroad": ["view", "create", "edit"],
    enquiries: ["view", "edit"],
    leads: ["view", "edit"],
    newsletter: ["view"],
    users: ["view"],
    admins: [],
    settings: [],
    analytics: ["view"],
    logs: [],
  },
  VIEWER: {
    colleges: ["view", "export"],
    courses: ["view", "export"],
    exams: ["view", "export"],
    news: ["view"],
    "study-abroad": ["view"],
    enquiries: ["view"],
    leads: ["view"],
    newsletter: ["view", "export"],
    users: ["view"],
    admins: [],
    settings: [],
    analytics: ["view"],
    logs: [],
  },
};

export function hasPermission(
  role: AdminRole,
  resource: Resource,
  action: Permission
): boolean {
  return PERMISSION_MAP[role]?.[resource]?.includes(action) ?? false;
}

export function getPermissions(
  role: AdminRole,
  resource: Resource
): Permission[] {
  return PERMISSION_MAP[role]?.[resource] ?? [];
}
