import { Box } from 'rangkaui';

type HomeHeaderProps = {
  title: string;
  subtitle: string;
  userName: string;
  userRole: string;
  avatarSrc?: string;
  avatarLabel: string;
};

export const HomeHeader = ({ title, subtitle, userName, userRole, avatarSrc, avatarLabel }: HomeHeaderProps) => {
  return (
    <header className="home-header">
      <Box className="home-header-inner">
        <Box className="home-header-title-group">
          <h1 className="home-header-title">
            {title}
          </h1>
          <p className="home-header-subtitle">{subtitle}</p>
        </Box>

        <Box className="home-header-user-group">
          {avatarSrc ? <img src={avatarSrc} alt={userName} className="home-header-avatar" /> : <span className="home-header-avatar">{avatarLabel}</span>}
          <Box className="home-header-user-stack">
            <p className="home-header-user-name">{userName}</p>
            <p className="home-header-user-role">{userRole}</p>
          </Box>
        </Box>
      </Box>
    </header>
  );
};
