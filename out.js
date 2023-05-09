var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/entities/base.ts
var _LangEntity = class {
  constructor(params = {}) {
    this.params = params;
    _LangEntity.counter++;
  }
  __type__ = this.constructor.name;
  id = _LangEntity.counter;
  static getLabel(label, type, id) {
    return `$$${label}_${type}_${id}$$`;
  }
  getLabel(label) {
    return _LangEntity.getLabel(label, this.__type__, this.id);
  }
  set(key, value) {
    this.params[key] = value;
  }
};
var LangEntity = _LangEntity;
__publicField(LangEntity, "counter", 0);

// src/entities/call.ts
var Call = class extends LangEntity {
  constructor(params = {
    name: "",
    args: []
  }) {
    super(params);
  }
  toRpn() {
    return `${this.params.args.map((arg) => arg.toRpn()).join(" ")} !Call_${this.params.name}!`;
  }
};

// src/entities/const.ts
var Const2 = class extends LangEntity {
  constructor(params = {
    value: ""
  }) {
    super(params);
  }
  toRpn() {
    return this.params.value;
  }
};

// src/entities/id.ts
var Id2 = class extends LangEntity {
  constructor(params = {
    name: ""
  }) {
    super(params);
  }
  toRpn() {
    return this.params.name;
  }
};

// src/entities/expression.ts
var Operator = /* @__PURE__ */ ((Operator3) => {
  Operator3["Equal"] = "==";
  Operator3["NotEqual"] = "!=";
  Operator3["GreaterThan"] = ">";
  Operator3["LessThan"] = "<";
  Operator3["GreaterThanOrEqual"] = ">=";
  Operator3["LessThanOrEqual"] = "<=";
  Operator3["Add"] = "+";
  Operator3["Subtract"] = "-";
  Operator3["Multiply"] = "*";
  Operator3["Divide"] = "/";
  Operator3["Power"] = "^";
  Operator3["Modulo"] = "%";
  Operator3["Negate"] = "!";
  Operator3["NegateUnary"] = "!Negate!";
  return Operator3;
})(Operator || {});
var isOperator = (value) => {
  return typeof value === "string" && Object.values(Operator).includes(value);
};
var getPriority = (operator) => {
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
      return 1e3;
  }
};
var Expression2 = class extends LangEntity {
  constructor(params = {
    tokens: []
  }) {
    super(params);
  }
  addToken(token, isUnary = false) {
    if (isUnary && typeof token === "string" && token === "-" /* Subtract */) {
      token = "!Negate!" /* NegateUnary */;
    }
    this.params.tokens.push(token);
  }
  // Shunting-yard algorithm
  toRpn() {
    const stack = [];
    const output = [];
    for (const token of this.params.tokens) {
      if (token instanceof Id2 || token instanceof Const2) {
        output.push(token);
      } else if (token instanceof Call) {
        output.push(token);
      } else if (isOperator(token)) {
        const priority = getPriority(token);
        while (stack.length > 0 && isOperator(stack[stack.length - 1]) && getPriority(stack[stack.length - 1]) >= priority) {
          output.push(stack.pop());
        }
        stack.push(token);
      } else if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length > 0 && stack[stack.length - 1] !== "(") {
          output.push(stack.pop());
        }
        stack.pop();
      }
    }
    while (stack.length > 0) {
      output.push(stack.pop());
    }
    return output.map((token) => token.toRpn?.() ?? token.toString()).join(" ");
  }
};

// src/entities/assignment.ts
var Assignment = class extends LangEntity {
  constructor() {
    super({
      name: "",
      value: new Expression2()
    });
  }
  toRpn() {
    return `${this.params.name} ${this.params.value.toRpn()} =`;
  }
};

// src/entities/switch.ts
var SwitchBlock = class extends LangEntity {
  constructor() {
    super({
      statements: []
    });
  }
  toRpn() {
    return this.params.statements.map((s) => s.toRpn()).join("\n");
  }
};
var SwitchCase = class extends LangEntity {
  constructor() {
    super({
      values: [],
      body: new SwitchBlock()
    });
  }
  toRpn() {
    return "";
  }
};
var Switch = class extends LangEntity {
  constructor() {
    super({
      value: new Expression2(),
      cases: []
    });
  }
  toRpn() {
    return [
      "stepInto" /* StepIn */,
      this.params.cases.flatMap((c) => [
        ...c.params.values.flatMap((v, i) => [
          this.params.value.toRpn(),
          v.toRpn(),
          "==",
          i !== 0 ? "||" : ""
        ]),
        "\n",
        c.getLabel("Skip"),
        "jumpElse" /* JumpElse */,
        "\n",
        c.params.body.toRpn(),
        "\n",
        c.getLabel("Skip")
      ]),
      this.params.default?.toRpn() ?? "",
      "\n",
      this.getLabel("Exit"),
      "stepOut" /* StepOut */
    ].flat().join(" ");
  }
};

// src/entities/break.ts
var Break = class extends LangEntity {
  constructor(params = {
    entityId: -1
  }) {
    super(params);
  }
  toRpn() {
    return [
      LangEntity.getLabel("Exit", Switch.name, this.params.entityId),
      "jump" /* Jump */
    ].join(" ");
  }
};

// src/entities/block.ts
var Block = class extends LangEntity {
  constructor() {
    super({
      statements: []
    });
  }
  toRpn() {
    return this.params.statements.map((s) => s.toRpn()).join("\n");
  }
};

// src/entities/conditional.ts
var Conditional = class extends LangEntity {
  constructor() {
    super({
      condition: new Expression2(),
      body: new Block()
    });
  }
  toRpn() {
    return [
      this.params.condition.toRpn(),
      "\n",
      this.getLabel("Else"),
      "jumpElse" /* JumpElse */,
      "\n",
      this.params.body.toRpn(),
      "\n",
      this.getLabel("Exit"),
      "jump" /* Jump */,
      "\n",
      this.getLabel("Else"),
      this.params.elseBody?.toRpn() ?? "",
      "\n",
      this.getLabel("Exit")
    ].join(" ");
  }
};

// src/entities/loop.ts
var Loop = class extends LangEntity {
  constructor() {
    super({
      increment: "",
      from: new Expression2(),
      to: new Expression2(),
      body: new Block()
    });
  }
  toRpn() {
    return [
      "stepInto" /* StepIn */,
      "\n",
      this.params.increment,
      this.params.from.toRpn(),
      "=",
      "\n",
      this.getLabel("Condition"),
      this.params.increment,
      this.params.to.toRpn(),
      "<=",
      "\n",
      this.getLabel("Exit"),
      "jumpElse" /* JumpElse */,
      "\n",
      this.params.body.toRpn(),
      "\n",
      this.params.increment,
      this.params.increment,
      this.params.step?.toRpn() ?? "1",
      "+",
      "=",
      "\n",
      this.getLabel("Condition"),
      "jump" /* Jump */,
      "\n",
      this.getLabel("Exit"),
      "stepOut" /* StepOut */
    ].join(" ");
  }
};

// src/entities/exit.ts
var Exit = class extends LangEntity {
  constructor(params = {
    entityId: -1
  }) {
    super(params);
  }
  toRpn() {
    return [
      LangEntity.getLabel("Exit", Loop.name, this.params.entityId),
      "jump" /* Jump */
    ].join(" ");
  }
};

// src/entities/return.ts
var Return = class extends LangEntity {
  constructor() {
    super({
      value: new Expression2()
    });
  }
  toRpn() {
    return `// return ${this.params.value.toRpn()}`;
  }
};

// src/entities/function-declaration.ts
var FunctionDeclaration = class extends LangEntity {
  constructor() {
    super({
      name: "",
      args: [],
      body: new Block()
    });
  }
  toRpn() {
    return `// function ${this.params.name} (${this.params.args.join(
      ", "
    )}) 
${this.params.body.toRpn()}
// end function ${this.params.name}

`;
  }
};

// src/entities/global.ts
var Global = class extends LangEntity {
  constructor() {
    super({
      functions: []
    });
  }
  toRpn() {
    return this.params.functions.map((f) => f.toRpn()).join("\n");
  }
};

// src/stack.ts
var Stack = class {
  stack = [];
  set(value) {
    this.stack = value;
  }
  push(...values) {
    return this.stack.push(...values);
  }
  pop() {
    return this.stack.pop();
  }
  popMany(count) {
    if (count > this.stack.length)
      throw new Error("Stack exceeded");
    if (count === 0)
      return [];
    return this.stack.splice(-count);
  }
  peek() {
    return this.stack.at(-1);
  }
  export() {
    return this.stack.join(", ");
  }
  get value() {
    return this.stack;
  }
  get length() {
    return this.stack.length;
  }
  toString() {
    return `Stack {${this.export()}}`;
  }
};

// src/tracer.ts
var Tracer = class {
  state = new Stack();
  waypoints = new Stack();
  waypoint() {
    this.waypoints.push(this.state.length);
  }
  rewind() {
    const waypoint = this.waypoints.pop();
    if (waypoint === null || waypoint === void 0)
      return [];
    return this.state.popMany(this.state.length - waypoint) ?? [];
  }
  push(...values) {
    return this.state.push(...values);
  }
  pop() {
    return this.state.pop();
  }
  peek() {
    return this.state.peek();
  }
  findLast(predicate) {
    return this.state.value.findLast(predicate);
  }
  get current() {
    return this.state.peek();
  }
};

// src/main.ts
var reset = () => {
  const tracer = new Tracer();
  const debug = console.log;
  const getAll = () => {
    console.warn(tracer.current);
    return tracer.current.toRpn();
  };
  const pushGlobal = () => tracer.push(new Global());
  const pushAssignment = () => tracer.push(new Assignment());
  const pushConst = (value) => {
    const expression = tracer.findLast(
      (entity) => entity instanceof Expression2
    );
    if (!expression) {
      console.error("No expression found while pushing", value);
      return;
    }
    expression.addToken(new Const2({ value }));
  };
  const pushExpression = () => {
    const isAlreadyParsingExpression = tracer.findLast((entity) => entity instanceof Expression2) !== void 0;
    if (isAlreadyParsingExpression) {
      return;
    }
    tracer.push(new Expression2());
  };
  const pushUnaryOperator = (operator) => pushOperator(operator, true);
  const pushOperator = (operator, isUnary) => {
    const expression = tracer.findLast(
      (entity) => entity instanceof Expression2
    );
    if (!expression) {
      console.error("No expression found while pushing", operator);
      console.error("Current tracer", tracer.current);
      return;
    }
    expression.addToken(operator, isUnary);
  };
  const pushCall = (call) => {
    const expression = tracer.findLast(
      (entity) => entity instanceof Expression2
    );
    if (!expression) {
      console.error("No expression found while pushing call", call);
      return;
    }
    expression.addToken(call);
  };
  const pushId = () => tracer.push(new Id2());
  const pushBlock = () => tracer.push(new Block());
  const pushFunctionDeclaration = () => tracer.push(new FunctionDeclaration());
  const pushReturn = () => tracer.push(new Return());
  const pushBreak = () => {
    const latest = tracer.findLast((entity) => entity instanceof Switch);
    if (!latest) {
      console.error("No switch found");
    }
    tracer.push(new Break({ entityId: latest?.id }));
  };
  const pushExit = () => {
    const latest = tracer.findLast((entity) => entity instanceof Loop);
    if (!latest) {
      console.error("No loop found");
    }
    tracer.push(new Exit({ entityId: latest?.id }));
  };
  const pushLoop = () => tracer.push(new Loop());
  const pushConditional = () => tracer.push(new Conditional());
  const pushSwitch = () => tracer.push(new Switch());
  const pushSwitchCase = (expr) => {
    const existingCase = tracer.current;
    if (existingCase instanceof SwitchCase) {
      if (!expr) {
        console.error("No expression found");
        return;
      }
      existingCase.params.values.push(expr);
    } else if (expr) {
      tracer.push(new SwitchCase());
      tracer.current.set("values", [expr]);
    } else {
      const latestSwitch = tracer.findLast(
        (entity) => entity instanceof Switch
      );
      if (!latestSwitch) {
        console.error("No switch found");
        return;
      }
      latestSwitch.set("default", new SwitchBlock());
    }
  };
  const endCase = () => {
    const latestSwitch = tracer.findLast(
      (entity) => entity instanceof Switch
    );
    if (!latestSwitch) {
      console.error("No switch found");
      return;
    }
    const block = tracer.pop();
    tracer.current.set("body", block);
    if (!latestSwitch.params.default) {
      const _case = tracer.pop();
      tracer.current.params.cases.push(_case);
    } else {
      latestSwitch.set("default", block);
    }
  };
  const pushSwitchBlock = () => tracer.push(new SwitchBlock());
  const handleBinaryExpr = () => {
    const children = tracer.rewind();
    const expr = tracer.pop();
    expr.set("tokens", [
      ...children.map((c) => c instanceof Expression2 ? c.params.tokens : c).flat()
    ]);
    if (!(expr instanceof Expression2))
      return;
    if (tracer.current instanceof Expression2) {
      tracer.current.set("tokens", [
        ...expr.params.tokens,
        ...tracer.current.params.tokens
      ]);
    } else {
      tracer.push(expr);
    }
    console.log(tracer.current);
  };
  const idToCall = () => {
    const id = tracer.pop();
    if (!(id instanceof Id2))
      return;
    tracer.push(new Call({ name: id.params.name, args: [] }));
  };
  return {
    waypoint: tracer.waypoint.bind(tracer),
    rewind: tracer.rewind.bind(tracer),
    push: tracer.push.bind(tracer),
    pop: tracer.pop.bind(tracer),
    get current() {
      return tracer.current;
    },
    pushGlobal,
    pushFunctionDeclaration,
    pushBlock,
    pushAssignment,
    pushReturn,
    pushBreak,
    pushExit,
    pushLoop,
    pushConditional,
    pushSwitch,
    pushSwitchCase,
    pushSwitchBlock,
    pushConst,
    pushOperator,
    pushUnaryOperator,
    pushExpression,
    pushId,
    pushCall,
    endCase,
    handleBinaryExpr,
    idToCall,
    getAll,
    debug,
    reset
  };
};
var $$ = reset();
window.ignoreLastWord = false;
window.tracer = $$;
window.$$ = $$;
