import PageContainer from '@/components/layout/page-container';
import { WhatsAppManagement } from '@/components/dashboard/whatsapp-management';

export const metadata = {
  title: 'Dashboard: WhatsApp Connection'
};

export default function WhatsAppPage() {
  return (
    <PageContainer scrollable={true} pageTitle="WhatsApp Fonnte" pageDescription="Kelola koneksi perangkat WhatsApp Anda untuk pengiriman pesan otomatis.">
      <WhatsAppManagement />
    </PageContainer>
  );
}
