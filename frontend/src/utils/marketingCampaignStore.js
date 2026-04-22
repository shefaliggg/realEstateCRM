const CAMPAIGNS_KEY = 'mk-campaigns-v1'
const PROFILE_SETTINGS_KEY = 'mk-profile-settings-v1'

const DEFAULT_PROFILE_SETTINGS = {
  companyDetails: {
    companyName: '',
    industry: '',
    productsOrServices: '',
    website: '',
    primaryMarket: '',
    uniqueValueProposition: '',
  },
  personaTags: [],
  discoveryQA: [
    {
      id: 'profile-q-1',
      question: 'What are your primary products or services?',
      answer: '',
    },
    {
      id: 'profile-q-2',
      question: 'Which customer segment is the best fit for your offering?',
      answer: '',
    },
    {
      id: 'profile-q-3',
      question: 'What pain points do your target customers face before buying?',
      answer: '',
    },
    {
      id: 'profile-q-4',
      question: 'What objection is most common in your sales conversations?',
      answer: '',
    },
    {
      id: 'profile-q-5',
      question: 'What makes your brand different from nearby competitors?',
      answer: '',
    },
  ],
  updatedAt: null,
}

const DEFAULT_CAMPAIGN_QA = [
  {
    id: 'campaign-q-1',
    question: 'What is the single most important outcome for this campaign?',
    answer: '',
  },
  {
    id: 'campaign-q-2',
    question: 'Which audience persona tags should this campaign target first?',
    answer: '',
  },
  {
    id: 'campaign-q-3',
    question: 'What offer or message should persuade this audience to respond?',
    answer: '',
  },
  {
    id: 'campaign-q-4',
    question: 'How will you measure success for this campaign?',
    answer: '',
  },
  {
    id: 'campaign-q-5',
    question: 'What action should the customer take after seeing this campaign?',
    answer: '',
  },
]

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function withDefaultProfileSettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {}
  return {
    companyDetails: {
      ...DEFAULT_PROFILE_SETTINGS.companyDetails,
      ...(source.companyDetails && typeof source.companyDetails === 'object' ? source.companyDetails : {}),
    },
    personaTags: Array.isArray(source.personaTags) ? source.personaTags : [],
    discoveryQA: Array.isArray(source.discoveryQA)
      ? DEFAULT_PROFILE_SETTINGS.discoveryQA.map((baseQ) => {
          const found = source.discoveryQA.find((q) => q.id === baseQ.id)
          return found ? { ...baseQ, ...found } : baseQ
        })
      : DEFAULT_PROFILE_SETTINGS.discoveryQA,
    updatedAt: source.updatedAt ?? null,
  }
}

function buildDefaultMediaPerformance(type, index, campaignStatus) {
  const baseImpressions = 7000 + index * 1700
  const baseClicks = Math.max(70, Math.round(baseImpressions * 0.028))
  const baseLeads = Math.max(8, Math.round(baseClicks * 0.11))
  const baseConversions = Math.max(1, Math.round(baseLeads * 0.18))

  let mediaStatus = 'Running'
  if (campaignStatus === 'Draft') mediaStatus = 'Planned'
  if (campaignStatus === 'Paused') mediaStatus = 'Paused'
  if (campaignStatus === 'Completed') mediaStatus = 'Completed'

  return {
    type,
    status: mediaStatus,
    impressions: baseImpressions,
    clicks: baseClicks,
    leads: baseLeads,
    conversions: baseConversions,
    spend: baseLeads * 250,
  }
}

function buildMediaPerformance(campaignTypes, sourcePerformance, campaignStatus) {
  const safeTypes = Array.isArray(campaignTypes) ? campaignTypes : []
  const existingByType = new Map(
    (Array.isArray(sourcePerformance) ? sourcePerformance : [])
      .filter((item) => item?.type)
      .map((item) => [item.type, item])
  )

  return safeTypes.map((type, index) => {
    const existing = existingByType.get(type)
    if (!existing) return buildDefaultMediaPerformance(type, index, campaignStatus)

    return {
      type,
      status: existing.status ?? buildDefaultMediaPerformance(type, index, campaignStatus).status,
      impressions: Number(existing.impressions ?? 0),
      clicks: Number(existing.clicks ?? 0),
      leads: Number(existing.leads ?? 0),
      conversions: Number(existing.conversions ?? 0),
      spend: Number(existing.spend ?? 0),
    }
  })
}

function withDefaultCampaign(campaign) {
  const source = campaign && typeof campaign === 'object' ? campaign : {}
  const rawTypes = Array.isArray(source.campaignTypes)
    ? source.campaignTypes
    : source.channel
      ? [source.channel]
      : ['Meta Ads']

  const normalizedTypes = rawTypes.flatMap((type) => {
    if (type === 'Social Media') return SOCIAL_MEDIA_CAMPAIGN_TYPES
    return [type]
  })

  const dedupedTypes = [...new Set(normalizedTypes)]

  return {
    id: source.id,
    name: source.name ?? '',
    campaignTypes: dedupedTypes,
    objective: source.objective ?? 'Lead Generation',
    status: source.status ?? 'Draft',
    budget: source.budget ?? '',
    startDate: source.startDate ?? '',
    endDate: source.endDate ?? '',
    campaignQA: Array.isArray(source.campaignQA)
      ? DEFAULT_CAMPAIGN_QA.map((baseQ) => {
          const found = source.campaignQA.find((q) => q.id === baseQ.id)
          return found ? { ...baseQ, ...found } : baseQ
        })
      : DEFAULT_CAMPAIGN_QA,
    mediaPerformance: buildMediaPerformance(
      dedupedTypes,
      source.mediaPerformance,
      source.status ?? 'Draft'
    ),
    createdAt: source.createdAt ?? null,
    updatedAt: source.updatedAt ?? null,
  }
}

export function getMarketingProfileSettings() {
  const saved = readJson(PROFILE_SETTINGS_KEY, DEFAULT_PROFILE_SETTINGS)
  return withDefaultProfileSettings(saved)
}

export function saveMarketingProfileSettings(settings) {
  const normalized = withDefaultProfileSettings(settings)
  normalized.updatedAt = new Date().toISOString()
  writeJson(PROFILE_SETTINGS_KEY, normalized)
  return normalized
}

export function getCampaigns() {
  const saved = readJson(CAMPAIGNS_KEY, [])
  if (!Array.isArray(saved)) return []
  return saved.map(withDefaultCampaign)
}

export function getCampaignById(id) {
  if (!id) return null
  return getCampaigns().find((campaign) => campaign.id === id) ?? null
}

export function saveCampaigns(campaigns) {
  const safeList = Array.isArray(campaigns) ? campaigns.map(withDefaultCampaign) : []
  writeJson(CAMPAIGNS_KEY, safeList)
  return safeList
}

export function createCampaign(payload) {
  const campaigns = getCampaigns()
  const now = new Date().toISOString()
  const campaign = withDefaultCampaign({
    ...payload,
    id: `cmp-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  })
  campaigns.unshift(campaign)
  saveCampaigns(campaigns)
  return campaign
}

export function updateCampaign(id, updates) {
  if (!id) return null
  const campaigns = getCampaigns()
  const index = campaigns.findIndex((campaign) => campaign.id === id)
  if (index === -1) return null

  const updated = withDefaultCampaign({
    ...campaigns[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  })
  campaigns[index] = updated
  saveCampaigns(campaigns)
  return updated
}

export const SOCIAL_MEDIA_CAMPAIGN_TYPES = [
  'Facebook',
  'Instagram',
  'LinkedIn',
  'YouTube',
  'X (Twitter)',
  'Pinterest',
]

export const CAMPAIGN_TYPE_GROUPS = [
  {
    label: 'Performance Channels',
    options: [
      'Meta Ads',
      'Google Ads',
      'WhatsApp',
      'SMS',
      'Email',
      'AI Calling',
    ],
  },
  {
    label: 'Social Media Lists',
    options: SOCIAL_MEDIA_CAMPAIGN_TYPES,
  },
]

export const CAMPAIGN_CHANNEL_OPTIONS = CAMPAIGN_TYPE_GROUPS.flatMap((group) => group.options)

export const CAMPAIGN_OBJECTIVE_OPTIONS = [
  'Lead Generation',
  'Site Visit Bookings',
  'Brand Awareness',
  'Re-engagement',
  'Event Registrations',
  'Closed Deal Acceleration',
]

export const CAMPAIGN_STATUS_OPTIONS = ['Draft', 'Active', 'Paused', 'Completed']
