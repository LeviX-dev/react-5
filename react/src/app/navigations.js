import api from "app/services/api";
import {
  fetchRoles,
  fetchRoleNavigationPermissions,
} from "app/services/role_permissions_api";

export const staticNavigations = [
  {
    id: "dashboard",
    name: "Dashboard",
    type: "dropDown",
    icon: "i-Bar-Chart",
    sub: [
      {
        id: "dashboard.v1",
        name: "Version 1",
        type: "link",
        icon: "i-Clock-3",
        path: "/dashboard/v1",
      },
      {
        id: "dashboard.v2",
        name: "Version 2",
        type: "link",
        icon: "i-Clock-4",
        path: "/dashboard/v2",
      },
    ],
  },
  {
    id: "user",
    name: "User",
    type: "dropDown",
    icon: "i-Administrator",
    sub: [
      {
        id: "user.list",
        name: "Users List",
        type: "link",
        icon: "i-Find-User",
        path: "/user/UserList",
      },
      {
        id: "employees.lists",
        name: "Employee Lists",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/employees/EmployeeLists",
      },
      {
        id: "user.lastlogin",
        name: "Users Last Login",
        type: "link",
        icon: "i-Clock-Forward",
        path: "/user/UsersLastLogin",
      },
      {
        id: "employees.import",
        name: "Import Employees",
        type: "link",
        icon: "i-Upload",
        path: "/employees/ImportEmployees",
      },
    ],
  },
  {
    id: "organization",
    name: "Organization",
    type: "dropDown",
    icon: "i-Building",
    sub: [
      {
        id: "organization.company",
        name: "Company setup",
        type: "link",
        icon: "i-Building",
        path: "/organization/company",
      },
      {
        id: "organization.department",
        name: "Department",
        type: "link",
        icon: "i-Conference",
        path: "/organization/department",
      },
      {
        id: "organization.designation",
        name: "Designation",
        type: "link",
        icon: "i-Business-Man",
        path: "/organization/designation",
      },
      {
        id: "organization.geolocation",
        name: "Geo Location",
        type: "link",
        icon: "i-Globe",
        path: "/organization/geo-location",
      },
      {
        id: "organization.officeshift",
        name: "Office Shift",
        type: "link",
        icon: "i-Clock",
        path: "/organization/officeshift",
      },
      {
        id: "organization.roles",
        name: "Role & Permission",
        type: "link",
        icon: "i-Checked-User",
        path: "/organization/roles",
      },
      {
        id: "organization.announcements",
        name: "Announcements",
        type: "link",
        icon: "i-Speach-Bubble-Asking",
        path: "/organization/announcements",
      },
      {
        id: "organization.policy",
        name: "Company Policy",
        type: "link",
        icon: "i-File-Clipboard-File--Text",
        path: "/organization/company-policy",
      },
      {
        id: "organization.calendar1",
        name: "Calender",
        type: "link",
        icon: "i-File-Clipboard-File--Text",
        path: "/organization/calendar1",
      },
    ],
  },
  {
    id: "timesheet",
    name: "Timesheet",
    type: "dropDown",
    icon: "i-Clock",
    sub: [
      {
        id: "timesheet.add_update",
        name: "Add And Update",
        type: "link",
        icon: "i-Business-ManWoman",
        path: "/Timesheet/Add And Update",
      },
      {
        id: "timesheet.import",
        name: "Import Attendance",
        type: "link",
        icon: "i-Add-UserStar",
        path: "/Timesheet/Import Attendance",
      },
      {
        id: "timesheet.requests",
        name: "Attendance Requests",
        type: "link",
        icon: "i-Clock-3",
        path: "/Timesheet/Attendance Requests",
      },
      {
        id: "timesheet.daily",
        name: "Daily Attendance",
        type: "link",
        icon: "i-Clock-3",
        path: "/Timesheet/Daily Attendance",
      },
      {
        id: "timesheet.datewise",
        name: "Date Wise Attendance",
        type: "link",
        icon: "i-Clock-3",
        path: "/Timesheet/date-wise-attendance",
      },
      {
        id: "timesheet.monthly",
        name: "Monthly Attendance",
        type: "link",
        icon: "i-Clock-3",
        path: "/Timesheet/monthly-attendance",
      },
      {
        id: "timesheet.live_tracking",
        name: "Live Location Tracking",
        type: "link",
        icon: "i-Globe",
        path: "/Timesheet/Live Location Tracking",
      },
      {
        id: "timesheet.officeshift1",
        name: "Office Shift 1",
        type: "link",
        icon: "i-Clock",
        path: "/timesheet/office-shift-1",
      },
      {
        id: "timesheet.office_shift_form",
        name: "Office Shift Form",
        type: "link",
        icon: "i-Clock",
        path: "/timesheet/office-shift-form",
      },
    ],
  },
  {
    id: "hr_calender",
    name: "HR Calender",
    type: "dropDown",
    icon: "i-Calendar-2",
    sub: [
      {
        id: "hr_calender.holiday",
        name: "Manage Holiday",
        type: "link",
        icon: "i-Clock-3",
        path: "/Timesheet/Manage Holiday",
      },
      {
        id: "hr_calender.leave",
        name: "Manage Leave",
        type: "link",
        icon: "i-Clock-3",
        path: "/Timesheet/Manage Leave",
      },
    ],
  },
  {
    id: "assets",
    name: "Assets",
    type: "dropDown",
    icon: "i-Folder",
    sub: [
      {
        id: "assets.category",
        name: "Category",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/asset/category",
      },
      {
        id: "assets.list",
        name: "Assets List",
        type: "link",
        icon: "i-Folder",
        path: "/asset/assets",
      },
    ],
  },
  {
    id: "event",
    name: "Event",
    type: "dropDown",
    icon: "i-Calendar",
    sub: [
      {
        id: "event.list",
        name: "Event",
        type: "link",
        icon: "i-Calendar",
        path: "/events",
      },
      {
        id: "event.meetings",
        name: "Meetings",
        type: "link",
        icon: "i-Handshake",
        path: "/meetings",
      },
    ],
  },
  {
    id: "icons",
    name: "Icons",
    type: "link",
    icon: "i-Icons",
    path: "/icons",
  },
  {
    id: "forms",
    name: "Forms",
    type: "dropDown",
    icon: "i-File-Horizontal-Text",
    sub: [
      {
        id: "forms.basic",
        name: "Basic",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/basic",
      },
      {
        id: "forms.actionbar",
        name: "Action Bar",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/actionbar",
      },
      {
        id: "forms.layouts",
        name: "Layouts",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/layouts",
      },
      {
        id: "forms.multicolumn",
        name: "Multi Column",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/multicolumn",
      },
      {
        id: "forms.inputgroup",
        name: "Input Group",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/inputgroup",
      },
      {
        id: "forms.validation",
        name: "Validation",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/validation",
      },
      {
        id: "forms.wizard",
        name: "Wizard",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/wizard",
      },
      {
        id: "forms.editor",
        name: "Editor",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/editor",
      },
      {
        id: "forms.taginput",
        name: "Tag Input",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/forms/taginput",
      },
    ],
  },
  {
    id: "uikits",
    name: "UI Kits",
    type: "dropDown",
    icon: "i-Library",
    sub: [
      {
        id: "uikits.alerts",
        name: "Alerts",
        type: "link",
        icon: "i-Bell",
        path: "/uikits/alerts",
      },
      {
        id: "uikits.accordions",
        name: "Accordions",
        type: "link",
        icon: "i-Split-Horizontal-2-Window",
        path: "/uikits/accordions",
      },
      {
        id: "uikits.badges",
        name: "Badges",
        type: "link",
        icon: "i-Medal-2",
        path: "/uikits/badges",
      },
      {
        id: "uikits.buttons",
        name: "Buttons",
        type: "link",
        icon: "i-Arrow-Right-in-Circle",
        path: "/uikits/buttons",
      },
      {
        id: "uikits.tabs",
        name: "Tabs",
        type: "link",
        icon: "i-One-Window",
        path: "/uikits/tabs",
      },
      {
        id: "uikits.cards",
        name: "Cards",
        type: "link",
        icon: "i-ID-Card",
        path: "/uikits/cards",
      },
      {
        id: "uikits.cards_metrics",
        name: "Cards Metrics",
        type: "link",
        icon: "i-Line-Chart-2",
        path: "/uikits/cards-metrics",
      },
      {
        id: "uikits.carousel",
        name: "Carousel",
        type: "link",
        icon: "i-Film-Video",
        path: "/uikits/carousel",
      },
      {
        id: "uikits.collapsibles",
        name: "Collapsibles",
        type: "link",
        icon: "i-Film-Video",
        path: "/uikits/collapsibles",
      },
      {
        id: "uikits.lists",
        name: "Lists",
        type: "link",
        icon: "i-Belt-3",
        path: "/uikits/lists",
      },
      {
        id: "uikits.paginations",
        name: "Paginations",
        type: "link",
        icon: "i-Arrow-Next",
        path: "/uikits/paginations",
      },
      {
        id: "uikits.popover",
        name: "Popover",
        type: "link",
        icon: "i-Speach-Bubble-3",
        path: "/uikits/popover",
      },
      {
        id: "uikits.progressbar",
        name: "Progress Bar",
        type: "link",
        icon: "i-Loading",
        path: "/uikits/progressbar",
      },
      {
        id: "uikits.tables",
        name: "Tables",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/uikits/tables",
      },
      {
        id: "uikits.tooltip",
        name: "Tooltip",
        type: "link",
        icon: "i-Speach-Bubble-8",
        path: "/uikits/tooltip",
      },
      {
        id: "uikits.modals",
        name: "Modals",
        type: "link",
        icon: "i-Duplicate-Window",
        path: "/uikits/modals",
      },
      {
        id: "uikits.sliders",
        name: "Sliders",
        type: "link",
        icon: "i-Width-Window",
        path: "/uikits/sliders",
      },
      {
        id: "uikits.rating",
        name: "Rating",
        type: "link",
        icon: "i-Like",
        path: "/uikits/rating",
      },
    ],
  },
  {
    id: "widgets",
    name: "Widgets",
    type: "dropDown",
    icon: "i-Window",
    sub: [
      {
        id: "widgets.app",
        name: "App",
        type: "link",
        icon: "i-Window",
        path: "/widgets/app",
      },
      {
        id: "widgets.card",
        name: "Card",
        type: "link",
        icon: "i-ID-Card",
        path: "/widgets/card",
      },
      {
        id: "widgets.list",
        name: "List",
        type: "link",
        icon: "i-Belt-3",
        path: "/widgets/list",
      },
      {
        id: "widgets.weather",
        name: "Weather",
        type: "link",
        icon: "i-Cloud",
        path: "/widgets/weather",
      },
      {
        id: "widgets.statistics",
        name: "Statistics",
        type: "link",
        icon: "i-Bar-Chart",
        path: "/widgets/statistics",
      },
    ],
  },
  {
    id: "charts",
    name: "Charts",
    type: "dropDown",
    icon: "i-Bar-Chart-2",
    sub: [
      {
        id: "charts.echart",
        name: "EChart",
        type: "link",
        icon: "i-Bar-Chart",
        path: "/charts/echart",
      },
      {
        id: "charts.recharts",
        name: "Recharts",
        type: "link",
        icon: "i-Line-Chart",
        path: "/charts/recharts",
      },
      {
        id: "charts.victory",
        name: "Victory",
        type: "link",
        icon: "i-Bar-Chart-2",
        path: "/charts/victory",
      },
      {
        id: "charts.apex",
        name: "Apex",
        type: "link",
        icon: "i-Bar-Chart-3",
        path: "/charts/apex",
      },
    ],
  },
  {
    id: "datatable",
    name: "Data Table",
    type: "dropDown",
    icon: "i-File-Horizontal-Text",
    sub: [
      {
        id: "datatable.basic",
        name: "Basic",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/datatable/basic",
      },
      {
        id: "datatable.search",
        name: "Search",
        type: "link",
        icon: "i-Search",
        path: "/datatable/search",
      },
      {
        id: "datatable.pagination",
        name: "Pagination",
        type: "link",
        icon: "i-Arrow-Next",
        path: "/datatable/pagination",
      },
      {
        id: "datatable.variants",
        name: "Variants",
        type: "link",
        icon: "i-File-Horizontal-Text",
        path: "/datatable/variants",
      },
    ],
  },
  {
    id: "extra_kits",
    name: "Extra Kits",
    type: "dropDown",
    icon: "i-Suitcase",
    sub: [
      {
        id: "extra_kits.dropdown",
        name: "Dropdown",
        type: "link",
        icon: "i-Arrow-Down-in-Circle",
        path: "/extra-kits/dropdown",
      },
      {
        id: "extra_kits.image_cropper",
        name: "Image Cropper",
        type: "link",
        icon: "i-Crop-2",
        path: "/extra-kits/image-cropper",
      },
      {
        id: "extra_kits.loaders",
        name: "Loaders",
        type: "link",
        icon: "i-Loading-3",
        path: "/extra-kits/loaders",
      },
      {
        id: "extra_kits.toastr",
        name: "Toastr",
        type: "link",
        icon: "i-Bell",
        path: "/extra-kits/toastr",
      },
      {
        id: "extra_kits.sweet_alert",
        name: "Sweet Alert",
        type: "link",
        icon: "i-Christmas-Bell",
        path: "/extra-kits/sweet-alert",
      },
      {
        id: "extra_kits.user_tour",
        name: "User Tour",
        type: "link",
        icon: "i-Plane",
        path: "/extra-kits/user-tour",
      },
      {
        id: "extra_kits.upload",
        name: "Upload",
        type: "link",
        icon: "i-Upload",
        path: "/extra-kits/upload",
      },
    ],
  },
  {
    id: "pages",
    name: "Pages",
    type: "dropDown",
    icon: "i-File",
    sub: [
      {
        id: "pages.pricing",
        name: "Pricing",
        type: "link",
        icon: "i-Money-2",
        path: "/pages/pricing",
      },
      {
        id: "pages.search",
        name: "Search",
        type: "link",
        icon: "i-Search",
        path: "/pages/search",
      },
      {
        id: "pages.profile",
        name: "Profile",
        type: "link",
        icon: "i-Business-Man",
        path: "/pages/profile",
      },
      {
        id: "pages.faq",
        name: "FAQ",
        type: "link",
        icon: "i-Question",
        path: "/pages/faq",
      },
      {
        id: "pages.blank",
        name: "Blank",
        type: "link",
        icon: "i-File",
        path: "/pages/blank",
      },
    ],
  },
  {
    id: "apps",
    name: "Apps",
    type: "dropDown",
    icon: "i-Apps",
    sub: [
      {
        id: "apps.inbox",
        name: "Inbox",
        type: "link",
        icon: "i-Email",
        path: "/apps/inbox",
      },
      {
        id: "apps.calendar",
        name: "Calendar",
        type: "link",
        icon: "i-Calendar",
        path: "/apps/calendar",
      },
      {
        id: "apps.chat",
        name: "Chat",
        type: "link",
        icon: "i-Speach-Bubble-3",
        path: "/apps/chat",
      },
      {
        id: "apps.contact",
        name: "Contact",
        type: "link",
        icon: "i-Address-Book",
        path: "/apps/contact",
      },
      {
        id: "apps.ecommerce",
        name: "Ecommerce",
        type: "link",
        icon: "i-Full-Cart",
        path: "/apps/ecommerce",
      },
      {
        id: "apps.invoice",
        name: "Invoice",
        type: "link",
        icon: "i-Receipt-4",
        path: "/apps/invoice",
      },
      {
        id: "apps.task",
        name: "Task",
        type: "link",
        icon: "i-Check",
        path: "/apps/task",
      },
    ],
  },
];

const getStoredRoleName = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const payloadJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
    );
    const payload = JSON.parse(payloadJson);

    return payload?.role || null;
  } catch (error) {
    return null;
  }
};

const isAdminRole = (roleName) =>
  String(roleName || "").toLowerCase() === "admin";

const getStoredPermissionIds = () => {
  try {
    const raw = localStorage.getItem("role_navigation_ids");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set((parsed || []).map(String).filter(Boolean));
  } catch (error) {
    return new Set();
  }
};

const savePermissionIds = (ids) => {
  localStorage.setItem("role_navigation_ids", JSON.stringify(Array.from(ids)));
};

const hasNavigationIds = (menus = []) => {
  for (const item of menus) {
    if (item?.id) return true;
    if (Array.isArray(item?.sub) && hasNavigationIds(item.sub)) return true;
  }
  return false;
};

const filterNavigationsByPermissions = (menus, allowedIds) => {
  if (!(allowedIds instanceof Set)) {
    // If the permission set is invalid or null, return empty sidebar to enforce security
    return [];
  }

  if (!hasNavigationIds(menus)) {
    return menus; // If menus don't have IDs at all, this might be a static fallback without IDs.
  }

  if (allowedIds.size === 0) {
    return [];
  }

  return menus
    .map((item) => {
      const itemId = item?.id ? String(item.id) : null;
      const selfAllowed = Boolean(itemId) && allowedIds.has(itemId);

      // Strict mode: if the parent menu doesn't have permission itself, hide the entire category
      if (!selfAllowed) {
        return null;
      }

      if (Array.isArray(item.sub) && item.sub.length > 0) {
        const filteredSub = item.sub.filter((subItem) => {
          const subId = subItem?.id ? String(subItem.id) : null;
          return Boolean(subId) && allowedIds.has(subId);
        });

        if (filteredSub.length > 0) {
          return { ...item, sub: filteredSub };
        }

        // If it's a dropdown but no sub-items are allowed, hide the useless dropdown parent
        if (item.type === "dropDown" || item.type === "extLink") {
          return null;
        }
      }

      return item;
    })
    .filter(Boolean);
};

const getLoggedUserPermissionIds = async () => {
  const roleName = getStoredRoleName();
  if (!roleName) return null;

  try {
    const roles = await fetchRoles();
    const role = (roles || []).find(
      (r) =>
        String(r.name || "").toLowerCase() === String(roleName).toLowerCase(),
    );

    if (!role?.id) return null;

    const roleData = await fetchRoleNavigationPermissions(role.id);
    const ids = new Set(
      (roleData?.navigationIds || []).map(String).filter(Boolean),
    );

    savePermissionIds(ids);
    return ids;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    const cached = getStoredPermissionIds();
    return cached.size > 0 ? cached : null;
  }
};

export const fetchNavigations = async () => {
  const response = await api.get("api/navigations");
  return response.data;
};

const mergeIcons = (apiMenus, staticMenus) => {
  const staticMap = new Map();
  const buildMap = (menus) => {
    for (const item of menus) {
      if (item.id) {
        staticMap.set(item.id, item.icon);
      }
      if (Array.isArray(item.sub)) {
        buildMap(item.sub);
      }
    }
  };
  buildMap(staticMenus);

  const merge = (menus) => {
    return menus.map((item) => {
      const merged = { ...item };
      if (
        item.id &&
        staticMap.has(item.id) &&
        (item.icon === null || item.icon === undefined)
      ) {
        merged.icon = staticMap.get(item.id);
      }
      if (Array.isArray(item.sub)) {
        merged.sub = merge(item.sub);
      }
      return merged;
    });
  };
  return merge(apiMenus);
};

export const getNavigations = async () => {
  let allMenus = staticNavigations;

  try {
    const data = await fetchNavigations();
    if (Array.isArray(data) && data.length > 0) {
      allMenus = mergeIcons(data, staticNavigations);
    }
  } catch (error) {
    console.error("Error fetching navigations:", error);
    allMenus = staticNavigations;
  }

  const allowedIds = await getLoggedUserPermissionIds();
  return filterNavigationsByPermissions(allMenus, allowedIds);
};

// Backward compatible export for code paths that still use static menu directly.
export const navigations = staticNavigations;
