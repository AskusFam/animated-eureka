import { CreateTripForm } from "./CreateTripForm";

export default function DashboardPage() {
  return (
    <main className="shell">
      <nav className="nav"><span className="brand">RallyUp</span><span className="status">Organizer view</span></nav>
      <div className="eyebrow">Organizer workspace</div>
      <h1>Trips</h1>
      <div className="dashboard-links"><a className="button secondary-button" href="/onboarding">Set up traveler profile ↗</a><span>RallyUp uses this to make better suggestions with fewer questions.</span></div>
      <CreateTripForm />
    </main>
  );
}
