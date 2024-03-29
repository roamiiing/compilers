import { AsmInstruction } from "../asm/instructions";
import { Command } from "../command";
import { LangEntity } from "./base";
import { Loop } from "./loop";

export type ExitParams = {
  entityId: number;
};

export class Exit extends LangEntity<ExitParams> {
  constructor(
    params: ExitParams = {
      entityId: -1,
    }
  ) {
    super(params);
  }

  toRpn() {
    return [
      LangEntity.getLabel("Exit", Loop.name, this.params.entityId),
      Command.Jump,
    ].join(" ");
  }

  toAsm() {
    return [
      AsmInstruction.Jmp,
      LangEntity.getLabel("Exit", Loop.name, this.params.entityId),
    ].join(" ");
  }
}
