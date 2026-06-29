import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import useHeader from './useHeader';
import MegaMenu from 'app/layouts/shared/MegaMenu';
import api from 'app/services/api';
import { userLoggedOut } from 'app/redux/auth/authSlice';
import { SHORTCUT_MENUS } from './data';
import GeoFenceNotificationBell from 'app/components/GeoFenceNotificationBell';

const DEFAULT_PROFILE_IMAGE = '/assets/images/faces/1.jpg';

export default function Layout1Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { handleMenuClick, toggleFullScreen, handleSearchBoxOpen } = useHeader();

  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [imageLoading, setImageLoading] = useState(true);

  const displayName = useMemo(() => {
    const firstName = user?.first_name || user?.firstName || '';
    const lastName = user?.last_name || user?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user?.name || user?.fullName || user?.username || 'User';
  }, [user]);

  useEffect(() => {
    if (!user?.user_id) {
      setProfileImage(DEFAULT_PROFILE_IMAGE);
      setImageLoading(false);
      return;
    }

    const fetchProfileImage = async () => {
      try {
        const res = await api.get(`/api/users/${user.user_id}`);
        const photo = res.data.data.photo;
        if (photo && !photo.includes('assets/images/faces/1.jpg')) {
          const url = photo.startsWith('http') || photo.startsWith('/')
            ? photo
            : `/uploads/employees/${photo}`;
          setProfileImage(url);
        } else {
          setProfileImage(DEFAULT_PROFILE_IMAGE);
        }
      } catch (error) {
        console.error('Failed to fetch profile image', error);
        setProfileImage(DEFAULT_PROFILE_IMAGE);
      } finally {
        setImageLoading(false);
      }
    };

    fetchProfileImage();
  }, [user?.user_id]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      // Continue logout locally
    }
    dispatch(userLoggedOut());
    navigate('/sessions/signin', { replace: true });
  };

  return (
    <div className="main-header">
      <div className="logo">
        <img src="/assets/images/logo.png" alt="Logo" />
      </div>

      <div className="menu-toggle" onClick={handleMenuClick}>
        <div />
        <div />
        <div />
      </div>

      <div className="d-none d-lg-flex align-items-center gap-3">
        {/* MEGA MENU BUTTON */}
        <Dropdown>
          <Dropdown.Toggle as="div" className="toggle-hidden cursor-pointer">
            Mega Menu
          </Dropdown.Toggle>

          <div className="mega-menu">
            <Dropdown.Menu className="mt-3">
              <MegaMenu />
            </Dropdown.Menu>
          </div>
        </Dropdown>

        {/* SEARCH BOX INPUT */}
        <div className="search-bar">
          <input type="text" placeholder="Search" onFocus={handleSearchBoxOpen} />
          <i className="search-icon text-muted i-Magnifi-Glass1" />
        </div>
      </div>

      <div className="m-auto" />

      <div className="header-part-right">
        {/* FULLSCREEN HANDLER */}
        <i
          datafullscreen="true"
          onClick={toggleFullScreen}
          className="i-Full-Screen header-icon d-none d-sm-inline-block"
        />

        {/* APPS MENU BAR */}
        <Dropdown>
          <Dropdown.Toggle as="span" className="toggle-hidden">
            <i className="i-Safe-Box text-muted header-icon" role="button" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="mt-3">
            <div className="menu-icon-grid">
              {SHORTCUT_MENUS.map((menu) => (
                <Link key={menu.text} to={menu.link}>
                  <i className={menu.icon} /> {menu.text}
                </Link>
              ))}
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* NOTIFICATION MENU BAR — Geo-Fence Alerts */}
        <GeoFenceNotificationBell />

        {/* USER PROFILE MENU BAR */}
        <div className="user col px-3">
          <Dropdown>
            <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
               {!imageLoading ? (
              <img
                src={profileImage}
                id="userDropdown"
                alt={displayName}
                onError={() => setProfileImage(DEFAULT_PROFILE_IMAGE)}
              />
            ) : (
              <div className="placeholder-glow">
                <span className="placeholder rounded-circle" style={{ width: '40px', height: '40px' }} />
              </div>
            )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="mt-3">
              <Dropdown.Item>
                <i className="i-Lock-User me-1" /> {displayName}
              </Dropdown.Item>

              <Dropdown.Item as={Link} to="/account/settings/profile">
                <i className="i-Data-Settings me-1" /> Account settings
              </Dropdown.Item>

              <Dropdown.Item as={Link} to="/sessions/change-password">
                <i className="i-Billing me-1" /> Change Password
              </Dropdown.Item>

              <Dropdown.Item as="button" type="button" onClick={handleLogout}>
                <i className="i-Lock-2 me-1" /> Sign out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
