import ComingSoonCard from '../components/ComingSoonCard'

// PropVault platform staff (platform_admin/platform_staff) currently have to
// be provisioned via the backend seed-admin flow / directly in the database —
// there's no self-serve invite flow for this tier yet (platform accounts
// don't have a Membership to hang an invite token off of, unlike builder-org
// invites). Wiring that up is a deliberate follow-up, not an oversight.
export default function TeamsPage() {
  return (
    <ComingSoonCard
      title="Platform Team"
      description="Inviting additional PropVault staff (platform admins/staff) from this screen is planned for a follow-up — for now, provision accounts via the backend."
    />
  )
}
