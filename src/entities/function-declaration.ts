import { LangEntity } from "./base";
import { Block } from "./block";

export type FunctionDeclarationParams = {
  name: string;
  args: string[];
  body: Block;
};

export class FunctionDeclaration extends LangEntity<FunctionDeclarationParams> {
  constructor() {
    super({
      name: "",
      args: [],
      body: new Block(),
    });
  }

  toRpn() {
    return `// function ${this.params.name} (${this.params.args.join(
      ", "
    )}) \n${this.params.body.toRpn()}\n// end function ${this.params.name}\n\n`;
  }
}
