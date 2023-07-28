import { Call } from "./call";
import { LangEntity } from "./base";
import { Const } from "./const";
import { Id } from "./id";
import { AsmInstruction } from "../asm/instructions";

export enum Operator {
  // Comparison
  Equal = "==",
  NotEqual = "!=",
  GreaterThan = ">",
  LessThan = "<",
  GreaterThanOrEqual = ">=",
  LessThanOrEqual = "<=",

  // Arithmetic
  Add = "+",
  Subtract = "-",
  Multiply = "*",
  Divide = "/",
  Power = "^",
  Modulo = "%",
  Negate = "!",

  // Unary
  NegateUnary = "!Negate!",
}

const unaryOps = [Operator.NegateUnary, Operator.Negate] as Operator[];

const operatorMap = {
  [Operator.Add]: AsmInstruction.Add,
  [Operator.Subtract]: AsmInstruction.Sub,
  [Operator.Multiply]: AsmInstruction.Mul,
  [Operator.Divide]: AsmInstruction.Div,
  [Operator.Modulo]: AsmInstruction.Mod,
  [Operator.Negate]: AsmInstruction.Not,
  [Operator.NegateUnary]: AsmInstruction.Neg,
  [Operator.Equal]: AsmInstruction.Eq,
  [Operator.NotEqual]: AsmInstruction.Neq,
  [Operator.GreaterThan]: AsmInstruction.Greater,
  [Operator.LessThan]: AsmInstruction.Less,
  [Operator.GreaterThanOrEqual]: AsmInstruction.GreaterEq,
  [Operator.LessThanOrEqual]: AsmInstruction.LessEq,
};

const isOperator = (value: Token): value is Operator => {
  return (
    typeof value === "string" &&
    Object.values(Operator).includes(value as Operator)
  );
};

type Parenthesis = "(" | ")";

type Token = Operator | Parenthesis | Id | Const | Call;

const getPriority = (operator: Operator) => {
  switch (operator) {
    case "==":
    case "!=":
    case ">":
    case "<":
    case ">=":
    case "<=":
      return 1;

    case "+":
    case "-":
      return 2;

    case "*":
    case "/":
      return 4;

    case "^":
    case "%":
    case "!":
      return 5;

    case "!Negate!":
      return 6;

    default:
      return 1000;
  }
};

export type ExpressionParams = {
  tokens: Token[];
};

export class Expression extends LangEntity<ExpressionParams> {
  constructor(
    params: ExpressionParams = {
      tokens: [],
    }
  ) {
    super(params);
  }

  addToken(token: Token, isUnary: boolean = false) {
    if (isUnary && typeof token === "string" && token === Operator.Subtract) {
      token = Operator.NegateUnary;
    }

    this.params.tokens.push(token);
  }

  toRpnInner() {
    const stack: Token[] = [];
    const output: Token[] = [];

    for (const token of this.params.tokens) {
      if (token instanceof Id || token instanceof Const) {
        output.push(token);
      } else if (token instanceof Call) {
        output.push(token);
      } else if (isOperator(token)) {
        const priority = getPriority(token as Operator);

        while (
          stack.length > 0 &&
          isOperator(stack[stack.length - 1]) &&
          getPriority(stack[stack.length - 1] as Operator) >= priority
        ) {
          output.push(stack.pop() as Operator);
        }

        stack.push(token);
      } else if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length > 0 && stack[stack.length - 1] !== "(") {
          output.push(stack.pop() as Operator);
        }

        stack.pop();
      }
    }

    while (stack.length > 0) {
      output.push(stack.pop() as Operator);
    }

    return output;
  }

  toRpn(): string {
    return this.toRpnInner()
      .map((token) => (token as LangEntity).toRpn?.() ?? token.toString())
      .join(" ");
  }

  toAsm(): string {
    return this.toRpnInner()
      .map((v) => {
        if (v instanceof Const)
          return `${AsmInstruction.Mov} ${AsmInstruction.Push} ${v.toAsm()}`;

        if (v instanceof Id)
          return `${AsmInstruction.Mov} ${AsmInstruction.Push} ${v.params.name}`;

        if (v instanceof Call) return v.toAsm();

        if (isOperator(v)) {
          if (unaryOps.includes(v)) {
            return [
              `${operatorMap[v] ?? "UNKNOWN"} ${AsmInstruction.Pop} ${
                AsmInstruction.Push
              }`,
            ].join("\n");
          }

          return `${operatorMap[v] ?? "UNKNOWN"} ${AsmInstruction.Pop} ${
            AsmInstruction.Pop
          } ${AsmInstruction.Push}`;
        }

        return "UNKNOWN";
      })
      .join("\n");
  }
}
