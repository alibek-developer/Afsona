// types/banner.ts

/**
 * Website Banner Types
 * Website promotional banners management
 */

// ============================================
// ENUM TYPES
// ============================================

export enum BannerLinkType {
  CATEGORY = 'category',
  MENU_ITEM = 'menu_item',
  PROMOTION = 'promotion',
  EXTERNAL = 'external',
}

export enum BannerPosition {
  FIRST = 0,
  SECOND = 1,
  THIRD = 2,
  FOURTH = 3,
  FIFTH = 4,
}

// ============================================
// BANNER TYPES
// ============================================

export interface Website_Banner {
  id: string;
  branch_id: string;
  title: string;
  description: string | null;
  image_url: string;
  image_alt_text: string | null;
  link_url: string;
  link_type: BannerLinkType;
  position: number;
  is_active: boolean;
  start_date: string | null; // ISO 8601 date
  end_date: string | null;
  background_color: string; // HEX: #RRGGBB
  text_color: string;
  cta_button_text: string;
  cta_button_color: string;
  display_on_mobile: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface BannerFormData {
  title: string;
  description: string;
  image_url: string;
  image_alt_text: string;
  link_type: BannerLinkType;
  link_url: string;
  position: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  background_color: string;
  text_color: string;
  cta_button_text: string;
  cta_button_color: string;
  display_on_mobile: boolean;
}

// Initial empty form state
export const INITIAL_BANNER_FORM: BannerFormData = {
  title: '',
  description: '',
  image_url: '',
  image_alt_text: '',
  link_type: BannerLinkType.CATEGORY,
  link_url: '',
  position: 0,
  is_active: true,
  start_date: null,
  end_date: null,
  background_color: '#000000',
  text_color: '#FFFFFF',
  cta_button_text: 'Learn More',
  cta_button_color: '#FF0000',
  display_on_mobile: false,
};

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateBannerRequest extends BannerFormData {
  branch_id: string;
}

export interface UpdateBannerRequest extends BannerFormData {
  id: string;
  branch_id: string;
}

export interface BannerResponse {
  success: boolean;
  data?: Website_Banner;
  message: string;
  error?: string;
}

export interface BannersListResponse {
  success: boolean;
  data: Website_Banner[];
  total: number;
  message: string;
}

export interface DeleteBannerResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================
// IMAGE UPLOAD TYPES
// ============================================

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  name: string;
  size: number;
  error?: string;
}

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================
// CATEGORY/MENU ITEM TYPES (For Link Selection)
// ============================================

export interface CategoryOption {
  id: string;
  name: string;
  sort_order: number;
}

export interface MenuItemOption {
  id: string;
  name: string;
  price: number;
  category_id: string;
}

export interface PromotionOption {
  id: string;
  code: string;
  title: string;
  discount_percent?: number;
}

// ============================================
// MODAL STATE TYPES
// ============================================

export interface BannerModalState {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  mode: 'create' | 'edit';
  editingBannerId: string | null;
  formData: BannerFormData;
  errors: ValidationError[];
  success?: string;
}

// ============================================
// LIST VIEW TYPES
// ============================================

export interface BannerListState {
  banners: Website_Banner[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  sortBy: 'position' | 'created_at' | 'title';
  sortOrder: 'asc' | 'desc';
  filterStatus: 'all' | 'active' | 'inactive';
}

// ============================================
// DELETE CONFIRMATION TYPES
// ============================================

export interface DeleteConfirmState {
  isOpen: boolean;
  bannerId: string | null;
  bannerTitle: string | null;
  isDeleting: boolean;
}