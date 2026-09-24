// Shared defaults for per-user settings stored in User.preferences (JSON).

export const TT_LOCATIONS = [
  'Port of Spain', 'San Fernando', 'Arima', 'Chaguanas', 'Point Fortin',
  'Diego Martin', 'San Juan / Laventille', 'Tunapuna / Piarco', 'Sangre Grande',
  'Couva / Tabaquite / Talparo', 'Princes Town', 'Penal / Debe', 'Siparia',
  'Mayaro / Rio Claro', 'Tobago',
];

export const defaultPreferences = {
  // Appearance
  compactMode: false,
  reduceMotion: false,
  // Notifications
  enableAllNotifications: true,
  emailNotifications: true,
  inAppNotifications: true,
  pushNotifications: true,
  notifyNewMessage: true,
  notifyListingApproved: true,
  notifyListingRejected: true,
  notifyPastPaperApproved: true,
  notifyPastPaperRejected: true,
  notifyEbookApproved: true,
  notifyReportUpdates: true,
  notifyFavoriteSchoolUpdates: true,
  notifyPasswordChanged: true,
  notifySecurityAlert: true,
  notifyAnnouncements: true,
  notifyPromotionalEmails: false,
  // Privacy
  profileVisibility: 'public',
  showPhone: false,
  showWhatsapp: false,
  showEmail: false,
  allowSearchEngineIndex: true,
  // Messaging
  allowMessages: true,
  muteMessageSounds: false,
  emailOnMessage: true,
  showReadReceipts: true,
  showOnlineStatus: true,
  autoReplyMessage: '',
  // Personalization
  saveRecentlyViewed: true,
  personalizedRecs: true,
  showFavoriteSchoolsFirst: true,
  homepagePersonalization: true,
  // Social links
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  websiteUrl: '',
};

export type UserPreferences = typeof defaultPreferences;

/** Merge stored JSON over defaults, keeping only known keys with matching types. */
export function normalizePreferences(raw: unknown): UserPreferences {
  const out: any = { ...defaultPreferences };
  if (raw && typeof raw === 'object') {
    for (const key of Object.keys(defaultPreferences) as (keyof UserPreferences)[]) {
      const v = (raw as any)[key];
      if (v !== undefined && typeof v === typeof defaultPreferences[key]) out[key] = v;
    }
  }
  return out;
}
