import { DecisionWorkspaceView } from "./DecisionWorkspaceView";

export default function TripDecisionPage({ params }: { params: { tripId: string } }) {
  return <DecisionWorkspaceView tripId={params.tripId} />;
}
