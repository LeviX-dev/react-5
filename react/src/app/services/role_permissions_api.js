import api from "./api";

const BASE_URL = process.env.REACT_APP_API_URL || "https://react5.myospaz.in/api";

export const fetchRoles = async () => {
  const res = await api.get("/api/roles");
  return res.data.data; // ✅ returns plain array
};

export const fetchPermissions = async () => {
  const res = await api.get("/api/permissions");
  return res.data.data; // ✅ returns plain array
};

export const fetchRoleWithPermissions = async (roleId) => {
  const res = await api.get(`/api/roles/getRole/${roleId}/permissions`);
  return res.data.data; // ✅ returns { role, permissions }
};

export const assignPermissions = async (roleId, permissionIds) => {
  const res = await api.put(`/api/roles/update/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
  return res.data; // no .data needed, just returns { success, message }
};

export const fetchRoleNavigationPermissions = async (roleId) => {
  const res = await api.get(`/api/roles/${roleId}/navigation-permissions`);
  return res.data.data; // returns { role, navigationIds }
};

export const assignNavigationPermissions = async (roleId, navigationIds) => {
  const res = await api.put(`/api/roles/${roleId}/navigation-permissions`, {
    navigation_ids: navigationIds,
  });
  return res.data;
};

export const createRole = async (name) => {
  const res = await api.post("/api/roles/add", {
    name,
    guard_name: "web",
  });
  return res.data.data; // ✅ returns { id, name, guard_name, ... }
};