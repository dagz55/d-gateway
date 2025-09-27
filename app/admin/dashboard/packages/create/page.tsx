import { requireAdmin } from '@/lib/admin';
import CreatePackageForm from '@/components/admin/CreatePackageForm';

export default async function CreatePackagePage() {
  // Require admin authentication
  const adminUser = await requireAdmin();

  return <CreatePackageForm />;
}