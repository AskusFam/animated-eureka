import { TripWorkspaceView } from "./TripWorkspaceView";

export default function TripWorkspacePage({ params }: { params: { tripId: string } }) {
  return <TripWorkspaceView tripId={params.tripId} />;
}
