import PageContainer from '@/components/layout/page-container';
import { ReportManagement } from '@/components/dashboard/report-management';

export const metadata = {
  title: 'Dashboard: Reports'
};

export default function ReportsPage() {
  return (
    <PageContainer scrollable={true} pageTitle="Reports" pageDescription="Lihat laporan harian per store.">
      <ReportManagement />
    </PageContainer>
  );
}
