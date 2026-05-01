export type GameState = {
  selSeed: number; isAuto: boolean; planted: boolean; plantDay: number;
  water: number; nutrients: number; health: number;
  stage: number; pruned: boolean; watered: boolean; fertilized: boolean;
  harvested: boolean; gameDay: number; gameHour: number; gameMin: number;
  speed: number; totalHarvests: number;
  isIndoor: boolean;
  ph: number; pests: number; airFlow: number; temp: number;
  showHarvestEffect: boolean;
};

export const INITIAL_STATE: GameState = {
  selSeed: 0, isAuto: false, planted: false, plantDay: 0,
  water: 85, nutrients: 75, health: 100,
  stage: 0, pruned: false, watered: false, fertilized: false,
  harvested: false, gameDay: 1, gameHour: 6, gameMin: 0,
  speed: 1, totalHarvests: 0,
  isIndoor: false,
  ph: 6.5, pests: 0, airFlow: 50, temp: 22,
  showHarvestEffect: false
};
