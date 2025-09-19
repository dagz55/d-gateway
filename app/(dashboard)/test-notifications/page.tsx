import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestNotificationsPage() {
  const createTestNotifications = async () => {
    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Created ${data.notifications.length} test notifications!`);
        window.location.reload();
      } else {
        alert('Failed to create test notifications');
      }
    } catch (error) {
      console.error('Error creating test notifications:', error);
      alert('Error creating test notifications');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const response = await fetch('/api/test-notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('All notifications deleted!');
        window.location.reload();
      } else {
        alert('Failed to delete notifications');
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
      alert('Error deleting notifications');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Notifications</h1>
        <p className="text-muted-foreground">
          Test the notification system by creating sample notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the buttons below to test the notification component in the header:
          </p>

          <div className="space-y-2">
            <Button
              onClick={createTestNotifications}
              className="w-full"
            >
              Create Test Notifications
            </Button>

            <Button
              variant="destructive"
              onClick={deleteAllNotifications}
              className="w-full"
            >
              Delete All Notifications
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Click "Create Test Notifications" to add sample notifications</p>
            <p>• Check the notification bell icon in the header (upper right)</p>
            <p>• The bell should show a red badge with the count of unread notifications</p>
            <p>• Click the bell to open the notifications dropdown</p>
            <p>• Click individual notifications to mark them as read</p>
            <p>• Use "Mark all read" to mark all notifications as read</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}