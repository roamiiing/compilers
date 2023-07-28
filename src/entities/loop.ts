import { AsmInstruction } from "../asm/instructions";
import { Command } from "../command";
import { LangEntity } from "./base";
import { Block } from "./block";
import { Expression } from "./expression";

export type LoopParams = {
  increment: string;
  from: Expression;
  to: Expression;
  step?: Expression;
  body: Block;
};

export class Loop extends LangEntity<LoopParams> {
  constructor() {
    super({
      increment: "",
      from: new Expression(),
      to: new Expression(),
      body: new Block(),
    });
  }

  toRpn(): string {
    return [
      Command.StepIn,
      "\n",
      this.params.increment,
      this.params.from.toRpn(),
      "=",
      "\n",
      this.getLabel("Condition"),
      this.params.increment,
      this.params.to.toRpn(),
      "<=",
      "\n",
      this.getLabel("Exit"),
      Command.JumpElse,
      "\n",
      this.params.body.toRpn(),
      "\n",
      this.params.increment,
      this.params.increment,
      this.params.step?.toRpn() ?? "1",
      "+",
      "=",
      "\n",
      this.getLabel("Condition"),
      Command.Jump,
      "\n",
      this.getLabel("Exit"),
      Command.StepOut,
    ].join(" ");
  }

  toAsm(): string {
    return [
      `\n// For loop\n`,
      "\n",
      this.params.from.toAsm(),
      "\n",
      AsmInstruction.Mov,
      this.params.increment,
      AsmInstruction.Pop,
      "\n",
      AsmInstruction.Label,
      this.getLabel("Condition"),
      "\n",
      AsmInstruction.Mov,
      AsmInstruction.Push,
      this.params.increment,
      "\n",
      this.params.to.toAsm(),
      "\n",
      AsmInstruction.Less,
      AsmInstruction.Pop,
      this.params.increment,
      AsmInstruction.Push,
      "\n",
      AsmInstruction.JmpFalse,
      this.getLabel("Exit"),
      AsmInstruction.Pop,
      "\n",
      `\n// For loop body\n`,
      this.params.body.toAsm(),
      "\n",
      `\n// For loop increment\n`,
      this.params.step?.toAsm() ??
        `${AsmInstruction.Mov} ${AsmInstruction.Push} 1`,
      "\n",
      AsmInstruction.Add,
      this.params.increment,
      AsmInstruction.Pop,
      this.params.increment,
      "\n",
      AsmInstruction.Jmp,
      this.getLabel("Condition"),
      "\n",
      AsmInstruction.Label,
      this.getLabel("Exit"),
      `\n// End for loop\n`,
    ].join(" ");
  }
}
