import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';

export default function ThemeDemo() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-heading">Hotel Management Theme</CardTitle>
        <CardDescription className="font-inter">
          Indigo primary colors with light backgrounds, Inter & Poppins fonts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Typography */}
        <div className="space-y-2">
          <h3 className="font-heading font-semibold">Typography</h3>
          <p className="font-inter text-sm text-muted-foreground">
            Body text uses Inter font for excellent readability
          </p>
          <p className="font-heading font-medium">
            Headings use Poppins font for a modern, friendly appearance
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <h3 className="font-heading font-semibold">Buttons</h3>
          <div className="flex flex-wrap gap-2">
            <Button>Primary (Indigo)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="space-y-2">
          <h3 className="font-heading font-semibold">Room Status Indicators</h3>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="available">Available</StatusBadge>
            <StatusBadge status="occupied">Occupied</StatusBadge>
            <StatusBadge status="maintenance">Maintenance</StatusBadge>
            <StatusBadge status="cleaning">Cleaning</StatusBadge>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <h3 className="font-heading font-semibold">Color Palette</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-primary text-primary-foreground p-2 rounded">Primary (Indigo)</div>
            <div className="bg-secondary text-secondary-foreground p-2 rounded">Secondary</div>
            <div className="bg-success text-success-foreground p-2 rounded">Success</div>
            <div className="bg-warning text-warning-foreground p-2 rounded">Warning</div>
            <div className="bg-destructive text-destructive-foreground p-2 rounded">Destructive</div>
            <div className="bg-muted text-muted-foreground p-2 rounded">Muted</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}