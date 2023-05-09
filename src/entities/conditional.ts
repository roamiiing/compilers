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
}
