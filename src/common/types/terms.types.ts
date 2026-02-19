export type TermsServiceType = 'saas' | 'commerce' | 'community' | 'app' | 'content' | 'platform';

export type TermsFeatureType =
  | 'basic'
  | 'paid_service' | 'subscription' | 'ecommerce' | 'community_ugc'
  | 'ai_feature' | 'location' | 'global' | 'minor';

export interface TermsFeatureInput {
  enabled: boolean;
  details: {
    paymentMethods?: string[];
    refundPolicy?: string;
    withdrawalPeriod?: string;
    autoRenewal?: boolean;
    cancellationNotice?: string;
    priceChangeNotice?: string;
    shippingPeriod?: string;
    returnPeriod?: string;
    exchangePolicy?: string;
    contentLicense?: string;
    reportPolicy?: string;
    banCriteria?: string;
    aiDisclaimer?: string;
    dataUsage?: boolean;
    locationPurpose?: string;
    locationRetention?: string;
    governingLaw?: string;
    arbitration?: string;
    parentalConsent?: boolean;
    ageLimit?: string;
  };
}

export interface TermsServiceInfo {
  serviceName: string;
  companyName: string;
  serviceType: TermsServiceType | '';
  companyAddress: string;
  businessRegistration: string;
  contactEmail: string;
  contactPhone: string;
  representative: string;
}

export interface TermsArticle {
  id: string;
  articleNumber: number;
  title: string;
  content: string;
}

export interface TermsChapter {
  id: string;
  chapterNumber: number;
  title: string;
  articles: TermsArticle[];
}

export interface GeneratedTerms {
  title: string;
  content: string;
  chapters: TermsChapter[];
  generatedAt: Date;
  version: number;
}
