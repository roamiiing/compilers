import { AsmInstruction } from "../asm/instructions";
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

  toAsm() {
    return [
      `// function ${this.params.name} (${this.params.args.join(", ")})\n`,
      AsmInstruction.Label,
      LangEntity.getLabel("Function", this.params.name),
      "\n",
      ...[...this.params.args]
        .reverse()
        .flatMap((arg) => [AsmInstruction.Mov, arg, AsmInstruction.Pop, "\n"]),
      "\n",
      this.params.body.toAsm(),
      `\n// end function ${this.params.name}\n`,
    ].join(" ");
  }
}
