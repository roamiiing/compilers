import { AsmInstruction } from "../asm/instructions";
import { Command } from "../command";
import { LangEntity } from "./base";
import { Expression } from "./expression";
import { Statement } from "./statement";

export type SwitchBlockParams = {
  statements: Statement[];
};

export class SwitchBlock extends LangEntity<SwitchBlockParams> {
  constructor() {
    super({
      statements: [],
    });
  }

  toRpn() {
    return this.params.statements.map((s) => s.toRpn()).join("\n");
  }

  toAsm(): string {
    return [
      "\n",
      this.params.statements.map((s) => s.toAsm()).join("\n"),
      "\n",
    ].join(" ");
  }
}

export type SwitchCaseParams = {
  values: Expression[];
  body: SwitchBlock;
};

export class SwitchCase extends LangEntity<SwitchCaseParams> {
  constructor() {
    super({
      values: [],
      body: new SwitchBlock(),
    });
  }

  toRpn() {
    // is handled by Switch itself
    return "";
  }

  toAsm() {
    // is handled by Switch itself
    return "";
  }
}

export type SwitchParams = {
  value: Expression;
  cases: SwitchCase[];
  default?: SwitchBlock;
};

export class Switch extends LangEntity<SwitchParams> {
  constructor() {
    super({
      value: new Expression(),
      cases: [],
    });
  }

  toRpn() {
    return [
      Command.StepIn,

      this.params.cases.flatMap((c) => [
        ...c.params.values.flatMap((v, i) => [
          this.params.value.toRpn(),
          v.toRpn(),
          "==",
          i !== 0 ? "||" : "",
        ]),
        "\n",
        c.getLabel("Skip"),
        Command.JumpElse,
        "\n",
        c.params.body.toRpn(),
        "\n",
        c.getLabel("Skip"),
      ]),

      this.params.default?.toRpn() ?? "",
      "\n",
      this.getLabel("Exit"),

      Command.StepOut,
    ]
      .flat()
      .join(" ");
  }

  toAsm() {
    return [
      `\n// Switch\n`,
      ...this.params.cases.flatMap((c) => [
        "\n// Case\n",
        ...c.params.values.flatMap((v, i) => [
          this.params.value.toAsm(),
          "\n",
          v.toAsm(),
          "\n",

          AsmInstruction.Eq,
          AsmInstruction.Pop,
          AsmInstruction.Pop,
          AsmInstruction.Push,

          "\n",
        ]),
        ...Array(c.params.values.length - 1)
          .fill(
            [
              AsmInstruction.Or,
              AsmInstruction.Pop,
              AsmInstruction.Pop,
              AsmInstruction.Push,
            ].join(" ")
          )
          .map((s) => s + "\n"),

        AsmInstruction.JmpFalse,
        c.getLabel("Skip"),
        AsmInstruction.Pop,
        "\n",
        c.params.body.toAsm() ?? "// No body",
        "\n",
        AsmInstruction.Jmp, // do not fall through ?
        this.getLabel("Exit"),
        "\n",
        AsmInstruction.Label,
        c.getLabel("Skip"),
        "\n",
      ]),
      this.params.default?.toAsm() ?? "",
      "\n",
      AsmInstruction.Label,
      this.getLabel("Exit"),
      "\n",
    ].join(" ");
  }
}
