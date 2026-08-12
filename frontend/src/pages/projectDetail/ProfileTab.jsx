import { amenityIcon, formatDate, formatPrice, getInitials } from './shared'

export default function ProfileTab({ project, profileTypeConfig, locationText, mapSrc, mapActionLink }) {
  const assignedUsers = Array.isArray(project.managedBy) ? project.managedBy.filter((u) => u && typeof u === 'object') : []
  const designationByUserId = new Map(
    (project.teamDesignations || [])
      .map((d) => [typeof d.user === 'string' ? d.user : d.user?._id, d.designation])
      .filter(([userId]) => userId)
  )
  const pricing = project.pricing || {}
  const chargeEntries = [
    ['Base Price / Sq.ft', pricing.basePricePerSqft ? formatPrice(pricing.basePricePerSqft) : null],
    ['PLC Charges', pricing.plcCharges ? formatPrice(pricing.plcCharges) : null],
    ['Floor Rise Charges', pricing.floorRiseCharges ? formatPrice(pricing.floorRiseCharges) : null],
    ['Parking Charges', pricing.parkingCharges ? formatPrice(pricing.parkingCharges) : null],
    ['Club Membership Fee', pricing.clubMembershipFee ? formatPrice(pricing.clubMembershipFee) : null],
    ['Registration Charges', pricing.registrationCharges ? formatPrice(pricing.registrationCharges) : null],
    ['Other Charges', pricing.otherCharges ? formatPrice(pricing.otherCharges) : null],
  ].filter(([, v]) => v)
  const priceRangeLabel = pricing.priceStart && pricing.priceEnd
    ? `${formatPrice(pricing.priceStart)} - ${formatPrice(pricing.priceEnd)}`
    : pricing.priceStart ? `From ${formatPrice(pricing.priceStart)}` : null

  const specifications = project.specifications || {}
  const specEntries = [
    ['Structure', specifications.structure],
    ['Flooring', specifications.flooring],
    ['Kitchen', specifications.kitchen],
    ['Bathroom', specifications.bathroom],
    ['Doors', specifications.doors],
    ['Windows', specifications.windows],
    ['Electrical', specifications.electrical],
    ['Plumbing', specifications.plumbing],
    ['Paint', specifications.paint],
  ].filter(([, v]) => v)

  const nearbyLocations = project.nearbyLocations || []

  const salesInfo = project.salesInfo || {}
  const contact = project.contact || {}
  const contactEntries = [
    ['Sales Phone', contact.salesPhone, contact.salesPhone ? `tel:${contact.salesPhone}` : null],
    ['Alternate Phone', contact.alternatePhone, contact.alternatePhone ? `tel:${contact.alternatePhone}` : null],
    ['WhatsApp', contact.whatsapp, contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}` : null],
    ['Email', contact.email, contact.email ? `mailto:${contact.email}` : null],
    ['Website', contact.website, contact.website || null],
  ].filter(([, v]) => v)
  const hasSalesInfo = salesInfo.bankLoanAvailable || salesInfo.approvedBanks?.length > 0 || salesInfo.salesOfficeAddress || salesInfo.siteOfficeContact || salesInfo.crmNotes

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">📋 Basic Information</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Project Name</dt><dd className="font-medium text-right">{project.name}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Developer</dt><dd className="font-medium text-right">{project.developerName || '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Project Type</dt><dd className="font-medium">{project.type}</dd></div>
        </dl>
        {project.description && (
          <p className="text-sm text-gray-600 whitespace-pre-line mt-3 pt-3 border-t border-gray-100">{project.description}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">📍 Location</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Address</dt><dd className="font-medium text-right">{locationText || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">City</dt><dd className="font-medium">{project.location?.city || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">State</dt><dd className="font-medium">{project.location?.state || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Country</dt><dd className="font-medium">{project.location?.country || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Pincode</dt><dd className="font-medium">{project.location?.pincode || '—'}</dd></div>
          </dl>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {mapSrc ? (
              <iframe title={`${project.name} map`} src={mapSrc} className="h-40 w-full border-0 sm:h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="flex h-40 items-center justify-center bg-slate-50 text-sm text-gray-400 sm:h-full">Add address to show map</div>
            )}
          </div>
        </div>
        {mapActionLink && (
          <a href={mapActionLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-primary-600 hover:text-primary-700">
            Open in Google Maps →
          </a>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">🏗️ Project Details</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium">{project.status}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">RERA No.</dt><dd className="font-medium">{project.reraNo || '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">RERA Reg. Date</dt><dd className="font-medium">{formatDate(project.reraRegistrationDate)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Launch Date</dt><dd className="font-medium">{formatDate(project.launchDate)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Construction Start</dt><dd className="font-medium">{formatDate(project.constructionStartDate)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Possession Date</dt><dd className="font-medium">{formatDate(project.possessionDate)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Total Land Area</dt><dd className="font-medium">{project.totalLandArea || '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Towers / Floors</dt><dd className="font-medium">{project.numberOfTowers || '—'} / {project.numberOfFloors || '—'}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">💰 Pricing</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Price Range</dt><dd className="font-medium">{priceRangeLabel || 'Price on request'}</dd></div>
          {chargeEntries.map(([label, value]) => (
            <div key={label} className="flex justify-between"><dt className="text-gray-500">{label}</dt><dd className="font-medium">{value}</dd></div>
          ))}
          <div className="flex justify-between"><dt className="text-gray-500">GST Applicable</dt><dd className="font-medium">{pricing.gstApplicable ? 'Yes' : 'No'}</dd></div>
        </dl>
      </div>

      {project.amenities?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">{profileTypeConfig.amenitiesTitle}</h3>
          <div className="flex flex-wrap gap-2">
            {project.amenities.map((a) => (
              <span key={a} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">
                <span className="text-base leading-none">{amenityIcon(a)}</span> {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {specEntries.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">🧱 Specifications</h3>
            <dl className="space-y-2 text-sm">
              {specEntries.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4"><dt className="text-gray-500">{label}</dt><dd className="font-medium text-right">{value}</dd></div>
              ))}
            </dl>
          </div>
        )}

        {nearbyLocations.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">📌 Nearby Places</h3>
            <div className="space-y-2">
              {nearbyLocations.map((n, i) => (
                <div key={i} className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">{n.type}{n.name ? ` · ${n.name}` : ''}</span>
                  <span className="font-medium text-gray-800 shrink-0">{n.distance || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(hasSalesInfo || contactEntries.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hasSalesInfo && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">💼 Sales Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Bank Loan Available</dt><dd className="font-medium">{salesInfo.bankLoanAvailable ? 'Yes' : 'No'}</dd></div>
                {salesInfo.approvedBanks?.length > 0 && (
                  <div className="flex justify-between gap-4"><dt className="text-gray-500">Approved Banks</dt><dd className="font-medium text-right">{salesInfo.approvedBanks.join(', ')}</dd></div>
                )}
                {salesInfo.salesOfficeAddress && (
                  <div className="flex justify-between gap-4"><dt className="text-gray-500">Sales Office</dt><dd className="font-medium text-right">{salesInfo.salesOfficeAddress}</dd></div>
                )}
                {salesInfo.siteOfficeContact && (
                  <div className="flex justify-between"><dt className="text-gray-500">Site Office Contact</dt><dd className="font-medium">{salesInfo.siteOfficeContact}</dd></div>
                )}
                {salesInfo.crmNotes && (
                  <div className="pt-1">
                    <dt className="text-gray-500 mb-1">CRM Notes</dt>
                    <dd className="font-medium text-gray-700 whitespace-pre-line">{salesInfo.crmNotes}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {contactEntries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📞 Contact</h3>
              <dl className="space-y-2 text-sm">
                {contactEntries.map(([label, value, link]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-right">
                      {link ? <a href={link} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700">{value}</a> : value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      {assignedUsers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">👥 Assigned Team</h3>
          <div className="flex flex-wrap gap-3">
            {assignedUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-2 rounded-full border border-gray-100 bg-slate-50 pl-1.5 pr-3 py-1.5">
                <span className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {getInitials(u.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{designationByUserId.get(u._id) || u.role || 'Team member'}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Manage team & designations from the Team tab.</p>
        </div>
      )}
    </div>
  )
}
