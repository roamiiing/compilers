import { AsmInstruction } from "../asm/instructions";
import { LangEntity } from "./base";
import { Statement } from "./statement";

export type BlockParams = {
  statements: Statement[];
};

export class Block extends LangEntity<BlockParams> {
  constructor() {
    super({
      statements: [],
    });
  }

  toRpn() {
    return this.params.statements.map((s) => s.toRpn()).join("\n");
  }

  toAsm() {
    return [
      // AsmInstruction.In,
      // this.getLabel("Scope"),
      "\n",
      this.params.statements.map((s) => s.toAsm()).join("\n"),
      // "\n",
      // AsmInstruction.Out,
      // this.getLabel("Scope"),
    ].join(" ");
  }
}
