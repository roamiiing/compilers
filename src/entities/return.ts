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
}
