import type {
  StageDefinition,
  StageObjective,
  StoreDefinition,
  TransitionContent,
  VisualDefinition,
} from "./types";

export function getStageObjective(stage: StageDefinition): StageObjective {
  return stage.objective;
}

export function getStageObjectiveType(
  stage: StageDefinition,
): StageObjective["type"] {
  return stage.objective.type;
}

export function getStageCollectibleVisual(
  stage: StageDefinition,
): VisualDefinition {
  return stage.objective.collectibleVisual;
}

export function getStageCollectibles(stage: StageDefinition) {
  return stage.objective.collectibles;
}

export function getStageStore(stage: StageDefinition): StoreDefinition | null {
  return stage.objective.type === "transport" ? stage.objective.store : null;
}

export function getTransitionContent(
  content: TransitionContent,
  fallbackTitle: string,
  fallbackSubtitle: string,
): Required<TransitionContent> {
  return {
    speech: content.speech,
    title: content.title ?? fallbackTitle,
    subtitle: content.subtitle ?? fallbackSubtitle,
  };
}
