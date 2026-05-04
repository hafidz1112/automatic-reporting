import PageContainer from '@/components/layout/page-container';
import { StoreManagement } from '@/components/dashboard/store-management';

export const metadata = {
  title: 'Dashboard: Stores'
};

export default function StoresPage() {
  return (
    <PageContainer scrollable={true} pageTitle="Stores" pageDescription="Kelola daftar store/cabang.">
      <StoreManagement />
    </PageContainer>
  );
}
