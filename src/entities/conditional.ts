import { AsmInstruction } from "../asm/instructions";
import { Command } from "../command";
import { LangEntity } from "./base";
import { Block } from "./block";
import { Expression } from "./expression";

export type ConditionalParams = {
  condition: Expression;
  body: Block;
  elseBody?: Block;
};

export class Conditional extends LangEntity<ConditionalParams> {
  constructor() {
    super({
      condition: new Expression(),
      body: new Block(),
    });
  }

  toRpn() {
    return [
      this.params.condition.toRpn(),
      "\n",
      this.getLabel("Else"),
      Command.JumpElse,
      "\n",
      this.params.body.toRpn(),
      "\n",
      this.getLabel("Exit"),
      Command.Jump,
      "\n",
      this.getLabel("Else"),
      this.params.elseBody?.toRpn() ?? "",
      "\n",
      this.getLabel("Exit"),
    ].join(" ");
  }

  toAsm() {
    return [
      `// If condition\n`,
      this.params.condition.toAsm(),
      "\n",
      AsmInstruction.JmpFalse,
      this.getLabel("Else"),
      AsmInstruction.Pop,
      "\n",
      `// Then\n`,
      this.params.body.toAsm(),
      "\n",
      AsmInstruction.Jmp,
      this.getLabel("Exit"),
      "\n",
      `// Else\n`,
      AsmInstruction.Label,
      this.getLabel("Else"),
      "\n",
      this.params.elseBody?.toAsm() ?? "",
      "\n",
      AsmInstruction.Label,
      this.getLabel("Exit"),
      "\n",
    ].join(" ");
  }
}
