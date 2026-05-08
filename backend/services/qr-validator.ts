/**
 * QR Validator Service
 * Validates input data per QR type before encoding.
 */

import type {
  QRType, QRData, URLData, TextData, VCardData, WiFiData,
  SMSData, EmailData, PhoneData, GeoData, SocialData,
  AppStoreData, PaymentData, EventData
} from './qr-encoder';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const URL_REGEX = /^https?:\/\/.+/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

export function validateQR(type: QRType, data: QRData): ValidationResult {
  const errors: string[] = [];

  switch (type) {
    case 'url': {
      const d = data as URLData;
      if (!d.url || !d.url.trim()) {
        errors.push('URL is required');
      } else if (!URL_REGEX.test(d.url)) {
        errors.push('URL must start with http:// or https://');
      }
      break;
    }

    case 'text': {
      const d = data as TextData;
      if (!d.text || !d.text.trim()) {
        errors.push('Text content is required');
      } else if (d.text.length > 1000) {
        errors.push('Text must be 1000 characters or fewer');
      }
      break;
    }

    case 'vcard': {
      const d = data as VCardData;
      if (!d.firstName || !d.firstName.trim()) {
        errors.push('First name is required');
      }
      if (d.email && !EMAIL_REGEX.test(d.email)) {
        errors.push('Invalid email address');
      }
      if (d.phone && !PHONE_REGEX.test(d.phone)) {
        errors.push('Invalid phone number');
      }
      break;
    }

    case 'wifi': {
      const d = data as WiFiData;
      if (!d.ssid || !d.ssid.trim()) {
        errors.push('Network name (SSID) is required');
      }
      if (!['WPA', 'WEP', 'nopass'].includes(d.encryption)) {
        errors.push('Encryption must be WPA, WEP, or nopass');
      }
      break;
    }

    case 'sms': {
      const d = data as SMSData;
      if (!d.phone || !d.phone.trim()) {
        errors.push('Phone number is required');
      } else if (!PHONE_REGEX.test(d.phone)) {
        errors.push('Invalid phone number');
      }
      if (d.message && d.message.length > 160) {
        errors.push('SMS message must be 160 characters or fewer');
      }
      break;
    }

    case 'email': {
      const d = data as EmailData;
      if (!d.to || !d.to.trim()) {
        errors.push('Recipient email is required');
      } else if (!EMAIL_REGEX.test(d.to)) {
        errors.push('Invalid email address');
      }
      break;
    }

    case 'phone': {
      const d = data as PhoneData;
      if (!d.number || !d.number.trim()) {
        errors.push('Phone number is required');
      } else if (!PHONE_REGEX.test(d.number)) {
        errors.push('Invalid phone number');
      }
      break;
    }

    case 'geo': {
      const d = data as GeoData;
      if (d.lat === undefined || d.lat === null) {
        errors.push('Latitude is required');
      } else if (d.lat < -90 || d.lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
      if (d.lng === undefined || d.lng === null) {
        errors.push('Longitude is required');
      } else if (d.lng < -180 || d.lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
      break;
    }

    case 'social': {
      const d = data as SocialData;
      if (!d.username || !d.username.trim()) {
        errors.push('Username or profile URL is required');
      }
      const validPlatforms = ['instagram', 'linkedin', 'twitter', 'youtube', 'tiktok', 'facebook', 'github'];
      if (!validPlatforms.includes(d.platform)) {
        errors.push('Invalid platform');
      }
      break;
    }

    case 'appstore': {
      const d = data as AppStoreData;
      if (d.platform === 'ios' || d.platform === 'both') {
        if (!d.iosUrl || !d.iosUrl.trim()) {
          errors.push('iOS App Store URL is required');
        }
      }
      if (d.platform === 'android' || d.platform === 'both') {
        if (!d.androidUrl || !d.androidUrl.trim()) {
          errors.push('Google Play Store URL is required');
        }
      }
      break;
    }

    case 'payment': {
      const d = data as PaymentData;
      const validMethods = ['upi', 'paypal', 'bitcoin', 'ethereum'];
      if (!validMethods.includes(d.method)) {
        errors.push('Invalid payment method');
        break;
      }
      if (d.method === 'upi' && (!d.vpa || !d.vpa.trim())) {
        errors.push('UPI VPA address is required');
      }
      if (d.method === 'paypal' && (!d.paypalId || !d.paypalId.trim())) {
        errors.push('PayPal email or username is required');
      }
      if ((d.method === 'bitcoin' || d.method === 'ethereum') && (!d.walletAddress || !d.walletAddress.trim())) {
        errors.push('Wallet address is required');
      }
      break;
    }

    case 'event': {
      const d = data as EventData;
      if (!d.name || !d.name.trim()) {
        errors.push('Event name is required');
      }
      if (!d.startDate) {
        errors.push('Start date is required');
      } else if (isNaN(Date.parse(d.startDate))) {
        errors.push('Invalid start date');
      }
      if (d.endDate && isNaN(Date.parse(d.endDate))) {
        errors.push('Invalid end date');
      }
      break;
    }

    default:
      errors.push(`Unknown QR type: ${type}`);
  }

  return { valid: errors.length === 0, errors };
}
