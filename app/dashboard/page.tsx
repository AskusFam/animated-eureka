import { CreateTripForm } from "./CreateTripForm";

export default function DashboardPage() {
  return (
    <main className="shell">
      <nav className="nav"><span className="brand">Trip Concierge</span><span className="status"><span className="dot" /> Prototype</span></nav>
      <div className="eyebrow">Organizer workspace</div>
      <h1>Trips</h1>
      <CreateTripForm />
    </main>
  );
}
