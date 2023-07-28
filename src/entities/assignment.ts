import { AsmInstruction } from "../asm/instructions";
import { LangEntity } from "./base";
import { Expression } from "./expression";

export type AssignmentParams = {
  name: string;
  value: Expression;
};

export class Assignment extends LangEntity<AssignmentParams> {
  constructor() {
    super({
      name: "",
      value: new Expression(),
    });
  }

  toRpn() {
    return `${this.params.name} ${this.params.value.toRpn()} =`;
  }

  toAsm() {
    console.log("Assignment.toAsm", this.params.name, this);

    return [
      this.params.value.toAsm(),
      "\n",
      AsmInstruction.Mov,
      this.params.name,
      AsmInstruction.Pop,
      "\n",
    ].join(" ");
  }
}
