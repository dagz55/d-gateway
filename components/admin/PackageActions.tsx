'use client';

import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PackageActionsProps {
  packageId: string;
  packageName: string;
}

export function PackageActions({ packageId, packageName }: PackageActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    router.push(`/admin/packages/${packageId}`);
  };

  const handleEdit = () => {
    router.push(`/admin/packages/${packageId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the package "${packageName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete package');
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 ml-4">
      <Button variant="ghost" size="sm" onClick={handleView} title="View package details">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit package">
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-red-400 hover:text-red-300" 
        onClick={handleDelete}
        disabled={isDeleting}
        title="Delete package"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
