/**
 * QR Encoder Service
 * Handles building the correct encoded string for all 12 QR content types.
 */

export type QRType =
  | 'url'
  | 'text'
  | 'vcard'
  | 'wifi'
  | 'sms'
  | 'email'
  | 'phone'
  | 'geo'
  | 'social'
  | 'appstore'
  | 'payment'
  | 'event'
  | 'whatsapp'
  | 'pdf'
  | 'image'
  | 'menu';

// --- Type-specific data shapes ---

export interface URLData { url: string }
export interface TextData { text: string }
export interface VCardData {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  company?: string;
  title?: string;
  website?: string;
  address?: string;
}
export interface WiFiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}
export interface SMSData { phone: string; message?: string }
export interface EmailData { to: string; subject?: string; body?: string }
export interface PhoneData { number: string }
export interface GeoData { lat: number; lng: number; useGoogleMaps?: boolean }
export interface SocialData {
  platform: 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok' | 'facebook' | 'github';
  username: string;
}
export interface AppStoreData {
  platform: 'ios' | 'android' | 'both';
  iosUrl?: string;
  androidUrl?: string;
}
export interface PaymentData {
  method: 'upi' | 'paypal' | 'bitcoin' | 'ethereum';
  // UPI fields
  vpa?: string;
  name?: string;
  amount?: string;
  // PayPal fields
  paypalId?: string;
  // Crypto fields
  walletAddress?: string;
}
export interface EventData {
  name: string;
  startDate: string; // ISO 8601
  endDate?: string;
  location?: string;
  description?: string;
  allDay?: boolean;
}

export type QRData =
  | URLData
  | TextData
  | VCardData
  | WiFiData
  | SMSData
  | EmailData
  | PhoneData
  | GeoData
  | SocialData
  | AppStoreData
  | PaymentData
  | EventData
  | WhatsAppData
  | PDFData
  | ImageData
  | MenuData;

export interface WhatsAppData { phone: string; message?: string }
export interface PDFData { pdfUrl: string }
export interface ImageData { imageUrl: string }
export interface MenuData { menuUrl: string }

// --- Social media URL builders ---

const SOCIAL_URL_MAP: Record<string, (username: string) => string> = {
  instagram: (u) => `https://instagram.com/${u}`,
  linkedin: (u) => `https://linkedin.com/in/${u}`,
  twitter: (u) => `https://x.com/${u}`,
  youtube: (u) => `https://youtube.com/@${u}`,
  tiktok: (u) => `https://tiktok.com/@${u}`,
  facebook: (u) => `https://facebook.com/${u}`,
  github: (u) => `https://github.com/${u}`,
};

// --- Date formatting for vCalendar ---

function toVCalDate(isoDate: string, allDay?: boolean): string {
  const d = new Date(isoDate);
  if (allDay) {
    return d.toISOString().replace(/[-:]/g, '').split('T')[0];
  }
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// --- Main encoder ---

export function encodeQR(type: QRType, data: QRData): string {
  switch (type) {
    case 'url': {
      const d = data as URLData;
      return d.url;
    }

    case 'text': {
      const d = data as TextData;
      return d.text;
    }

    case 'vcard': {
      const d = data as VCardData;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${d.lastName || ''};${d.firstName}`,
        `FN:${d.firstName}${d.lastName ? ' ' + d.lastName : ''}`,
      ];
      if (d.phone) lines.push(`TEL:${d.phone}`);
      if (d.email) lines.push(`EMAIL:${d.email}`);
      if (d.company) lines.push(`ORG:${d.company}`);
      if (d.title) lines.push(`TITLE:${d.title}`);
      if (d.website) lines.push(`URL:${d.website}`);
      if (d.address) lines.push(`ADR:;;${d.address}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'wifi': {
      const d = data as WiFiData;
      const hidden = d.hidden ? 'true' : 'false';
      return `WIFI:T:${d.encryption};S:${d.ssid};P:${d.password || ''};H:${hidden};;`;
    }

    case 'sms': {
      const d = data as SMSData;
      return d.message
        ? `smsto:${d.phone}:${d.message}`
        : `smsto:${d.phone}`;
    }

    case 'email': {
      const d = data as EmailData;
      const params: string[] = [];
      if (d.subject) params.push(`subject=${encodeURIComponent(d.subject)}`);
      if (d.body) params.push(`body=${encodeURIComponent(d.body)}`);
      return `mailto:${d.to}${params.length ? '?' + params.join('&') : ''}`;
    }

    case 'phone': {
      const d = data as PhoneData;
      return `tel:${d.number}`;
    }

    case 'geo': {
      const d = data as GeoData;
      if (d.useGoogleMaps || (d as any).useGoogleMaps === 'true') {
        return `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;
      }
      return `geo:${d.lat},${d.lng}`;
    }

    case 'social': {
      const d = data as SocialData;
      // If it already looks like a URL, use it directly
      if (d.username.startsWith('http://') || d.username.startsWith('https://')) {
        return d.username;
      }
      const builder = SOCIAL_URL_MAP[d.platform];
      if (!builder) return d.username;
      return builder(d.username.replace(/^@/, ''));
    }

    case 'appstore': {
      const d = data as AppStoreData;
      // For "both" we encode the iOS URL (the primary QR destination)
      if (d.platform === 'ios' || d.platform === 'both') {
        return d.iosUrl || '';
      }
      return d.androidUrl || '';
    }

    case 'payment': {
      const d = data as PaymentData;
      switch (d.method) {
        case 'upi': {
          const params: string[] = [];
          if (d.vpa) params.push(`pa=${d.vpa}`);
          if (d.name) params.push(`pn=${encodeURIComponent(d.name)}`);
          if (d.amount) params.push(`am=${d.amount}`);
          return `upi://pay?${params.join('&')}`;
        }
        case 'paypal':
          return d.amount
            ? `https://paypal.me/${d.paypalId}/${d.amount}`
            : `https://paypal.me/${d.paypalId}`;
        case 'bitcoin':
          return d.walletAddress || '';
        case 'ethereum':
          return d.walletAddress || '';
        default:
          return '';
      }
    }

    case 'event': {
      const d = data as EventData;
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${d.name}`,
        `DTSTART:${toVCalDate(d.startDate, d.allDay)}`,
      ];
      if (d.endDate) {
        lines.push(`DTEND:${toVCalDate(d.endDate, d.allDay)}`);
      }
      if (d.location) lines.push(`LOCATION:${d.location}`);
      if (d.description) lines.push(`DESCRIPTION:${d.description}`);
      lines.push('END:VEVENT', 'END:VCALENDAR');
      return lines.join('\n');
    }

    case 'whatsapp': {
      const d = data as WhatsAppData;
      const phoneClean = d.phone.replace(/[^0-9]/g, '');
      return d.message 
        ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(d.message)}`
        : `https://wa.me/${phoneClean}`;
    }

    case 'pdf': return (data as PDFData).pdfUrl;
    case 'image': return (data as ImageData).imageUrl;
    case 'menu': return (data as MenuData).menuUrl;

    default:
      return '';
  }
}
