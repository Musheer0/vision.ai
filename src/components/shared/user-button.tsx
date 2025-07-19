import { UserButton } from '@clerk/nextjs'
import { ThemeToggleItem } from './theme-toggle-clerk'

const UserBtn = () => {
  return (
    <UserButton
      appearance={{
        variables: {
          colorPrimary: 'var(--primary)', 
        }
      }}
    >
        <UserButton.MenuItems>
            <ThemeToggleItem/>
        </UserButton.MenuItems>
    </UserButton>
  )
}

export default UserBtn
