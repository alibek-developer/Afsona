import { BannerFormData, ValidationError } from './banner'

export const validateBannerForm = (data: BannerFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (data.title.length > 60) {
    errors.push({ field: 'title', message: 'Max 60 characters' });
  }

  if (data.description && data.description.length > 200) {
    errors.push({ field: 'description', message: 'Max 200 characters' });
  }

  if (!data.image_url) {
    errors.push({ field: 'image_url', message: 'Image is required' });
  }

  if (data.cta_button_text && data.cta_button_text.length > 30) {
    errors.push({ field: 'cta_button_text', message: 'Max 30 characters' });
  }

  const hexRegex = /^#[0-9A-F]{6}$/i;
  if (data.background_color && !hexRegex.test(data.background_color)) {
    errors.push({ field: 'background_color', message: 'Invalid hex color' });
  }
  if (data.text_color && !hexRegex.test(data.text_color)) {
    errors.push({ field: 'text_color', message: 'Invalid hex color' });
  }
  if (data.cta_button_color && !hexRegex.test(data.cta_button_color)) {
    errors.push({ field: 'cta_button_color', message: 'Invalid hex color' });
  }

  if (data.start_date && data.end_date) {
    if (new Date(data.start_date) > new Date(data.end_date)) {
      errors.push({ field: 'start_date', message: 'Start date must be before end date' });
    }
  }

  return errors;
};