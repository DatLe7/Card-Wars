export interface CardInstance {
  instanceId: string;
  ownerId: string;
  cardId: string;
  name: string;
  type: string;
  land: string;
  cost: number;
  attack: number;
  defence: number;
  atkMod: number;
  defMod: number;
  damage: number;
  canFloop: boolean;
  isFlooped: boolean;
}
