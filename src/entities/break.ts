import { AsmInstruction } from "../asm/instructions";
import { Command } from "../command";
import { LangEntity } from "./base";
import { Switch } from "./switch";

export type BreakParams = {
  entityId: number;
};

export class Break extends LangEntity<BreakParams> {
  constructor(
    params: BreakParams = {
      entityId: -1,
    }
  ) {
    super(params);
  }

  toRpn() {
    return [
      LangEntity.getLabel("Exit", Switch.name, this.params.entityId),
      Command.Jump,
    ].join(" ");
  }

  toAsm() {
    return [
      AsmInstruction.Jmp,
      LangEntity.getLabel("Exit", Switch.name, this.params.entityId),
    ].join(" ");
  }
}
