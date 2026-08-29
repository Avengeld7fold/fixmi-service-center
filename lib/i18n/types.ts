export type Locale = "id" | "en";

export interface Dictionary {
  locale: Locale;
  common: {
    brandTagline: string;
    bookNow: string;
    chatWhatsApp: string;
    viewDetails: string;
    learnMore: string;
    back: string;
    close: string;
    search: string;
    loading: string;
    openInMaps: string;
    freeCheck: string;
    officialWarranty: string;
    allRightsReserved: string;
  };
  nav: {
    home: string;
    pricelist: string;
    promo: string;
    gallery: string;
    about: string;
    contact: string;
    admin: string;
  };
  hero: {
    badge: string;
    titleBroken: string;
    subtitlePrefix: string;
    subtitleMiddle: string;
    subtitleSuffix: string;
    titleSolusinya1: string;
    titleSolusinya2: string;
    taglineDescription: string;
    consultationCta: string;
    checkPricingCta: string;
    diagnosticNotice: string;
  };
  whyUs: {
    badge: string;
    heading1: string;
    heading2: string;
    description: string;
    pillar1Value: string;
    pillar1Label: string;
    pillar1Desc: string;
    pillar2Value: string;
    pillar2Label: string;
    pillar2Desc: string;
    pillar3Value: string;
    pillar3Label: string;
    pillar3Desc: string;
    checkPriceBtn: string;
    waConsultBtn: string;
    galleryTitle: string;
  };
  teardown: {
    badge: string;
    heading: string;
    subheading: string;
    scrollHint: string;
    modalEstimate: string;
    modalWarranty: string;
    modalSymptoms: string;
    modalFixmiSolution: string;
    modalConsultBtn: string;
  };
  journey: {
    badge: string;
    heading: string;
    step1Tag: string;
    step1Title: string;
    step1Desc: string;
    step2Tag: string;
    step2Title: string;
    step2Desc: string;
    step3Tag: string;
    step3Title: string;
    step3Desc: string;
    step4Tag: string;
    step4Title: string;
    step4Desc: string;
    bottomCtaText: string;
    bottomCtaBtn: string;
  };
  reviews: {
    badge: string;
    heading: string;
    subheading: string;
    filterRelevant: string;
    filterNewest: string;
    readMore: string;
    readLess: string;
    writeReviewBtn: string;
    viewAllReviewsBtn: string;
    verifiedCustomer: string;
  };
  faq: {
    badge: string;
    heading1: string;
    heading2: string;
    subheading: string;
    cardBadge: string;
    cardTitle: string;
    cardDesc: string;
    items: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
  pricelist: {
    badge: string;
    title1: string;
    title2: string;
    description: string;
    warrantyDetailsBtn: string;
    searchPlaceholder: string;
    allCategories: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyCtaBtn: string;
    unlistedTitle: string;
    unlistedDescription: string;
    unlistedCtaBtn: string;
    unlistedBadge: string;
    warrantyModalTitle: string;
    warrantyModalSubtitle: string;
    warrantyItems: Array<{
      title: string;
      description: string;
    }>;
  };
  promo: {
    badge: string;
    title: string;
    subtitle: string;
    claimBtn: string;
    emptyPromo: string;
  };
  gallery: {
    badge: string;
    title: string;
    subtitle: string;
    allFilter: string;
    emptyGallery: string;
  };
  footer: {
    headStore: string;
    branchStore: string;
    otherStore: string;
    openStatusOpen: string;
    openStatusClosed: string;
    openHoursLabel: string;
    directContactLabel: string;
    locationLabel: string;
    mapsBtn: string;
    consultationBtn: string;
    quickLinks: string;
    devicesSupported: string;
    language: string;
  };
}
