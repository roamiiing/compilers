export type AsmOperand = string;

export const enum AsmInstruction {
  Mov = "mov", // mov <dst> <src>

  Add = "+", // add <dst> <src> <res>
  Sub = "-", // sub <dst> <src> <res>
  Mul = "*", // mul <dst> <src> <res>
  Div = "/", // div <dst> <src> <res>
  Mod = "%", // mod <dst> <src> <res>
  And = "&", // and <dst> <src> <res>
  Or = "|", // or <dst> <src> <res>
  Not = "!", // not <dst> <res>
  Neg = "neg", // neg <dst> <res>
  Eq = "==", // eq <dst> <src> <res>
  Neq = "!=", // neq <dst> <src> <res>
  Less = "<", // less <dst> <src> <res>
  LessEq = "<=", // lessEq <dst> <src> <res>
  Greater = ">", // greater <dst> <src> <res>
  GreaterEq = ">=", // greaterEq <dst> <src> <res>

  Jmp = "jmp", // jmp <dst>
  JmpFalse = "jf", // jf <dst> <src>

  Print = "prn", // print ...<src>
  Read = "read", // read <dst>
  Call = "call", // call <dst>
  Ret = "ret", // ret

  Push = "push", // push <src>
  Pop = "pop", // pop <dst>

  In = "in", // in <dst>
  Out = "out", // out
  Label = "lbl", // label <dst>
}
