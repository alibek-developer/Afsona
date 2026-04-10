'use client';

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BannerLinkType } from '@/lib/banner'

interface LinkTypeSelectorProps {
  value: BannerLinkType;
  onChange: (type: BannerLinkType) => void;
  linkValue: string;
  onLinkValueChange: (value: string) => void;
  categories: any[];
  menuItems: any[];
  promotions: any[];
  isError?: boolean;
  errorMessage?: string;
}

export default function LinkTypeSelector({
  value,
  onChange,
  linkValue,
  onLinkValueChange,
  categories,
  menuItems,
  promotions,
  isError,
  errorMessage,
}: LinkTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="link-type">Link Type *</Label>
        <Select value={value} onValueChange={(v) => onChange(v as BannerLinkType)}>
          <SelectTrigger id="link-type" className={isError ? 'border-red-500' : ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BannerLinkType.CATEGORY}>Category</SelectItem>
            <SelectItem value={BannerLinkType.MENU_ITEM}>Menu Item</SelectItem>
            <SelectItem value={BannerLinkType.PROMOTION}>Promotion Code</SelectItem>
            <SelectItem value={BannerLinkType.EXTERNAL}>External URL</SelectItem>
          </SelectContent>
        </Select>
        {isError && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-value">
          {value === BannerLinkType.CATEGORY && 'Select Category *'}
          {value === BannerLinkType.MENU_ITEM && 'Select Menu Item *'}
          {value === BannerLinkType.PROMOTION && 'Select Promotion *'}
          {value === BannerLinkType.EXTERNAL && 'Enter URL *'}
        </Label>

        {value === BannerLinkType.CATEGORY && (
          <Select value={linkValue} onValueChange={onLinkValueChange}>
            <SelectTrigger id="link-value">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {value === BannerLinkType.MENU_ITEM && (
          <Select value={linkValue} onValueChange={onLinkValueChange}>
            <SelectTrigger id="link-value">
              <SelectValue placeholder="Choose menu item" />
            </SelectTrigger>
            <SelectContent>
              {menuItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {value === BannerLinkType.PROMOTION && (
          <Select value={linkValue} onValueChange={onLinkValueChange}>
            <SelectTrigger id="link-value">
              <SelectValue placeholder="Choose promotion" />
            </SelectTrigger>
            <SelectContent>
              {promotions.map((promo) => (
                <SelectItem key={promo.id} value={promo.code}>
                  {promo.title} ({promo.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {value === BannerLinkType.EXTERNAL && (
          <Input
            id="link-value"
            type="url"
            value={linkValue}
            onChange={(e) => onLinkValueChange(e.target.value)}
            placeholder="https://example.com"
          />
        )}
      </div>
    </div>
  );
}
