import { OnboardingForm } from "./OnboardingForm";

export default function OnboardingPage({ searchParams }: { searchParams: { phone?: string; tripId?: string } }) {
  return (
    <main className="workspace-shell">
      <div className="workspace-kicker">RallyUp traveler profile</div>
      <h1>Give RallyUp a better read on your travel style.</h1>
      <p className="workspace-intro">A few useful defaults help RallyUp make better suggestions without turning every text into a questionnaire. You can change these anytime.</p>
      <OnboardingForm phoneNumber={searchParams.phone ?? ""} tripId={searchParams.tripId} />
    </main>
  );
}
