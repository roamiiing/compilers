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
}
