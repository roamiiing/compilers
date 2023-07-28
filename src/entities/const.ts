import { LangEntity } from "./base";

export type ConstParams = {
  value: string;
};

export class Const extends LangEntity<ConstParams> {
  constructor(
    params = {
      value: "",
    }
  ) {
    super(params);
  }

  toRpn() {
    return this.params.value;
  }

  toAsm() {
    console.log("Const.toAsm", this.params.value, this.params.value.length);

    if (
      this.params.value.startsWith("'") ||
      this.params.value.startsWith('"')
    ) {
      return this.params.value;
    }

    if (this.params.value === "true") {
      return "1";
    }

    if (this.params.value === "false") {
      return "0";
    }

    if (this.params.value.startsWith("0x")) {
      return parseInt(
        this.params.value.slice(2, this.params.value.length),
        16
      ).toString();
    }

    if (this.params.value.startsWith("0q")) {
      return parseInt(
        this.params.value.slice(2, this.params.value.length),
        4
      ).toString();
    }

    return parseFloat(this.params.value).toString(10);
  }
}
