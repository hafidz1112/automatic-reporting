import PageContainer from '@/components/layout/page-container';
import { UserManagement } from '@/components/dashboard/user-management';

export const metadata = {
  title: 'Dashboard: Users'
};

export default function UsersPage() {
  return (
    <PageContainer scrollable={true} pageTitle="Users" pageDescription="Manage your system users.">
      <UserManagement />
    </PageContainer>
  );
}
