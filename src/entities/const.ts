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
}
