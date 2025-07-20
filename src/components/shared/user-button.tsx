import { UserButton } from '@clerk/nextjs';
import { ThemeToggleItem } from './theme-toggle-clerk';

const UserBtn = () => {
  return (
    <UserButton
      appearance={{
        variables: {
          colorPrimary: 'var(--primary)',
        },
        elements: {
          // This targets the button that wraps the avatar
          userButtonAvatarBox: 'w-20 h-20', // 48px x 48px (default is like w-8 h-8)
          // If you want to bump up actual avatar image
          avatarImage: 'w-20 h-20',
        },
      }}
    >
    </UserButton>
  );
};

export default UserBtn;
