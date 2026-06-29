import EmployeeProfile from "../../employees/tabs/Profile";

export default function UserProfile({ user, onPhotoUpdate }) {
  if (!user) return null;

  const profileData = {
    ...user,
    staff_id: user.staff_id || user.id,
  };

  return <EmployeeProfile employee={profileData} onPhotoUpdate={onPhotoUpdate} />;
}
