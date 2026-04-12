import { Website_Banner, BannerFormData } from './banner'
import { supabase } from './supabaseClient'

/**
 * API Wrapper for Banner operations
 */
export const bannerService = {
  // List banners
  async fetchAll(branchId: string, params: any = {}) {
    const query = new URLSearchParams({
      branchId,
      ...params
    });
    const response = await fetch(`/api/banners?${query}`);
    if (!response.ok) throw new Error('Failed to fetch banners');
    return await response.json();
  },

  // Create banner
  async create(data: BannerFormData & { branch_id: string }) {
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create banner');
      
      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error creating banner:', error);
      return { success: false, error: error.message };
    }
  },

  // Update banner
  async update(id: string, data: Partial<BannerFormData>) {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update banner');
      
      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error updating banner:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete banner
  async delete(id: string) {
    const response = await fetch(`/api/banners/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to delete banner');
    }
    return await response.json();
  },

  // Reorder banners
  async reorder(banners: { id: string, position: number }[]) {
    const response = await fetch('/api/banners/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banners }),
    });
    if (!response.ok) throw new Error('Failed to reorder banners');
    return await response.json();
  },

  // Dropdown options
  async getCategories() {
    const response = await fetch('/api/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getMenuItems(branchId: string) {
    const response = await fetch(`/api/menu-items?branchId=${branchId}`);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return response.json();
  },

  async getPromotions(branchId: string) {
    const response = await fetch(`/api/promotions?branchId=${branchId}`);
    if (!response.ok) throw new Error('Failed to fetch promotions');
    return response.json();
  }
};
