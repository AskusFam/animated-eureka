import type { TripIntake } from "./intake";
import type { TravelerProfile } from "./session";

export type AgentObjective = "discover" | "plan_known_trip" | "coordinate_group";
export type AgentAction = "research_destinations" | "collect_trip_brief" | "collect_participant_preferences" | "create_review_workspace" | "build_itinerary" | "request_approval";

export type AgentPlan = {
  objective: AgentObjective;
  action: AgentAction;
  reason: string;
  needsUserInput: boolean;
};

export function buildAgentPlan(intake: Partial<TripIntake>, profile: TravelerProfile | null): AgentPlan {
  if (intake.objective === "destination_ideas" || (!intake.destination && !intake.dates)) {
    return { objective: "discover", action: "research_destinations", reason: "The traveler is exploring possibilities.", needsUserInput: false };
  }

  if (intake.objective === "group_trip" || intake.flowVariant === "planner") {
    if (intake.destination && intake.dates && intake.groupSize) {
      return profile
        ? { objective: "coordinate_group", action: "collect_participant_preferences", reason: "The core trip brief is ready and the planner profile is available.", needsUserInput: false }
        : { objective: "coordinate_group", action: "create_review_workspace", reason: "The core trip brief is ready; a lightweight profile will improve group planning.", needsUserInput: true };
    }
    return { objective: "coordinate_group", action: "collect_trip_brief", reason: "The group trip needs one more decision before coordination can start.", needsUserInput: true };
  }

  if (intake.destination && intake.dates && intake.groupSize) {
    return { objective: "plan_known_trip", action: "build_itinerary", reason: "The trip brief is complete enough to draft a plan.", needsUserInput: false };
  }

  return { objective: "plan_known_trip", action: "collect_trip_brief", reason: "The traveler has started planning but the brief is incomplete.", needsUserInput: true };
}
