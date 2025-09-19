'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Plus,
  X,
  Save,
  ArrowLeft,
  DollarSign,
  List,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PackageFormData {
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  active: boolean;
}

export default function CreatePackageForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    price: 0,
    duration_days: 30,
    features: [],
    active: true,
  });

  const handleInputChange = (field: keyof PackageFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          duration_days: formData.duration_days,
          features: formData.features,
          active: formData.active
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create package');
      }

      toast.success('Package created successfully!');
      router.push('/admin/packages');
    } catch (error: any) {
      console.error('Error creating package:', error);
      toast.error(error.message || 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationOptions = [
    { value: 7, label: '1 Week' },
    { value: 30, label: '1 Month' },
    { value: 90, label: '3 Months' },
    { value: 365, label: '1 Year' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/packages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
            Create <span className="gradient-text">Package</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Create a new subscription package for your platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Set the basic details for your subscription package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium Trading Signals"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this package includes..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Duration */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  Pricing & Duration
                </CardTitle>
                <CardDescription>
                  Set the price and subscription duration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="29.99"
                        className="pl-10"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <select
                      id="duration"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={formData.duration_days}
                      onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value))}
                      required
                    >
                      {durationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-accent" />
                  Package Features
                </CardTitle>
                <CardDescription>
                  Add features that are included in this package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Features</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center gap-2 px-3 py-1"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(feature)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Settings */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-accent" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this package available to users
                    </p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => handleInputChange('active', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Package Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {formData.name || 'Package Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || 'Package description...'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    ${formData.price || 0}
                  </span>
                  <Badge variant="outline">
                    {durationOptions.find(d => d.value === formData.duration_days)?.label || '1 Month'}
                  </Badge>
                </div>

                {formData.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <div className="space-y-1">
                      {formData.features.slice(0, 3).map((feature, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          • {feature}
                        </p>
                      ))}
                      {formData.features.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{formData.features.length - 3} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !formData.name || !formData.description}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Package
                  </>
                )}
              </Button>

              <Button type="button" variant="outline" className="w-full" asChild>
                <Link href="/admin/packages">
                  Cancel
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}