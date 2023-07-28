import { LangEntity } from ".";
import { AsmInstruction } from "../asm/instructions";
import { Const } from "./const";
import { Expression } from "./expression";
import { Id } from "./id";

export type CallParams = {
  name: string;
  args: (Expression | Const | Id)[];
};

export class Call extends LangEntity<CallParams> {
  constructor(
    params: CallParams = {
      name: "",
      args: [],
    }
  ) {
    super(params);
  }

  toRpn() {
    return `${this.params.args.map((arg) => arg.toRpn()).join(" ")} !Call_${
      this.params.name
    }!`;
  }

  toAsmFunction() {
    switch (this.params.name) {
      case "_print_":
        return [
          AsmInstruction.Print,
          ...this.params.args.map(() => AsmInstruction.Pop),
        ];
      case "_read_":
        return [
          AsmInstruction.Read,
          ...this.params.args.map(() => AsmInstruction.Pop),
        ];
      default:
        return [
          AsmInstruction.Call,
          LangEntity.getLabel("Function", this.params.name),
        ];
    }
  }

  toAsm() {
    return [
      `// Call ${this.params.name} with ${this.params.args.length} args\n`,
      this.params.args.map((arg) => arg.toAsm()).join("\n"),
      "\n",
      ...this.toAsmFunction(),
      "\n",
    ].join(" ");
  }
}
