import { LangEntity } from "./base";
import { FunctionDeclaration } from "./function-declaration";

export type GlobalParams = {
  functions: FunctionDeclaration[];
};

export class Global extends LangEntity<GlobalParams> {
  constructor() {
    super({
      functions: [],
    });
  }

  toRpn() {
    return this.params.functions.map((f) => f.toRpn()).join("\n");
  }

  toAsm() {
    return this.params.functions.map((f) => f.toAsm()).join("\n");
  }
}
