import { AsmInstruction } from "../asm/instructions";
import { LangEntity } from "./base";
import { Expression } from "./expression";

export type ReturnParams = {
  value: Expression;
};

export class Return extends LangEntity<ReturnParams> {
  constructor() {
    super({
      value: new Expression(),
    });
  }

  toRpn() {
    return `// return ${this.params.value.toRpn()}`;
  }

  toAsm() {
    return [
      "\n// return \n",
      this.params.value.toAsm(),
      "\n",
      // по идее, указатель на возвращаемое значение уже лежит на стеке
      AsmInstruction.Out,
    ].join(" ");
  }
}
