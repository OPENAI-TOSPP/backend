export type ServiceType = 'saas' | 'commerce' | 'community' | 'app' | 'offline';

export type ProcessingItemType =
  | 'account_signup' | 'auth_session' | 'payment_onetime' | 'payment_subscription'
  | 'marketing_email' | 'marketing_push' | 'support_inquiry' | 'analytics_cookie'
  | 'auth_social' | 'payment_refund' | 'account_dormant'
  | 'auth_phone' | 'delivery_shipping' | 'location_gps' | 'community_content'
  | 'marketing_adpixel' | 'event_promotion' | 'survey_feedback' | 'admin_operator';

export interface OutsourcingInfo {
  id: string;
  companyName: string;
  task: string;
  country: string;
}

export interface ThirdPartyInfo {
  id: string;
  recipient: string;
  purpose: string;
  items: string;
  retentionPeriod: string;
}

export interface OverseasInfo {
  country: string;
  transferDate: string;
  method: string;
  trustee: string;
  contact: string;
}

export interface DetailInput {
  purpose: string;
  items: string[];
  customItems: string;
  retentionPeriod: string;
  customRetention: string;
  hasOutsourcing: boolean;
  outsourcingList: OutsourcingInfo[];
  hasThirdParty: boolean;
  thirdPartyList: ThirdPartyInfo[];
  hasOverseasTransfer: boolean;
  overseasInfo: OverseasInfo | null;
}

export interface ServiceInfo {
  serviceName: string;
  companyName: string;
  serviceType: ServiceType | '';
  contactEmail: string;
  contactPhone: string;
  privacyOfficerName: string;
  privacyOfficerContact: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface GeneratedDocument {
  title: string;
  content: string;
  sections: DocumentSection[];
  generatedAt: Date;
  version: number;
}
