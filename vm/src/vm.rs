use crate::{
    instruction::Instruction, label::Label, program::Program, target::Target, value::Value,
};
use std::{collections::HashMap, io};

#[derive(Debug)]
enum VmStep {
    Next,
    Jump(usize),
    Done(Value),
}

type Scope = HashMap<String, Value>;

static MAIN_FN: &str = "_main_";

fn label(ty: &str, name: &str) -> Label {
    Label::new(&format!("$${}_{}$$", ty, name))
}

#[derive(Debug)]
pub struct Vm {
    value_stack: Vec<Value>,
    call_stack: Vec<usize>,
    scope_stack: Vec<Scope>,
}

impl Default for Vm {
    fn default() -> Self {
        Self {
            value_stack: Vec::new(),
            call_stack: Vec::new(),
            scope_stack: vec![Scope::new()],
        }
    }
}

impl Vm {
    pub fn run(&mut self, program: &Program) -> Result<Value, String> {
        let mut i = 0;

        let value = loop {
            match self.run_instruction(program, i) {
                Ok(VmStep::Next) => i += 1,
                Ok(VmStep::Jump(j)) => i = j,
                Ok(VmStep::Done(value)) => break value,
                Err(e) => return Err(e),
            }
        };

        Ok(value)
    }

    fn push_scope(&mut self) {
        self.scope_stack.push(Scope::new());
    }

    fn pop_scope(&mut self) {
        self.scope_stack.pop();
    }

    fn pop_call_stack(&mut self) -> Result<usize, String> {
        self.call_stack
            .pop()
            .ok_or_else(|| "No call stack found".to_string())
    }

    fn pop_value_stack(&mut self) -> Result<Value, String> {
        self.value_stack
            .pop()
            .ok_or_else(|| "No value stack found".to_string())
    }

    fn find_label(&self, program: &Program, label: &Label) -> Result<usize, String> {
        program
            .0
            .iter()
            .position(|instruction| {
                if let Instruction::Label(l) = instruction {
                    l == label
                } else {
                    false
                }
            })
            .ok_or_else(|| format!("No label found for {}", label))
    }

    fn run_instruction(&mut self, program: &Program, i: usize) -> Result<VmStep, String> {
        use Instruction::*;
        use VmStep::*;

        let main_label = label("Function", MAIN_FN);

        let instruction = program
            .0
            .get(i)
            .ok_or_else(|| format!("No instruction found at index {}", i))?;

        if self.is_first_run() {
            // find main function
            if let Instruction::Label(label) = instruction {
                if *label == main_label {
                    self.call_stack.push(i + 1);
                }
            }
            return Ok(Next);
        }

        log::debug!("{i}: {:?}", instruction);

        let Some(scope) = self.scope_stack.last_mut() else {
            return Err("No scope found".to_string());
        };

        match instruction {
            Call(label) => {
                self.call_stack.push(i + 1);
                self.push_scope();
                return Ok(Jump(self.find_label(program, label)?));
            }
            Mov(target, operand) => {
                let value = operand.get_value(scope, &mut self.value_stack)?;
                target.set_value(value, scope, &mut self.value_stack);
            }
            Add(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.add(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Sub(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.sub(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Mul(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value1.mul(&value2)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Div(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.div(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Mod(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.modulo(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Eq(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value1.eq(&value2)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Neq(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value1.ne(&value2)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Less(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.lt(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            LessEq(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.le(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Greater(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.gt(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            GreaterEq(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value2.ge(&value1)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            And(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value1.and(&value2)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Or(operand1, operand2, target) => {
                let value1 = operand1.get_value(scope, &mut self.value_stack)?;
                let value2 = operand2.get_value(scope, &mut self.value_stack)?;
                let result = value1.or(&value2)?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Not(operand, target) => {
                let value = operand.get_value(scope, &mut self.value_stack)?;
                let result = value.not()?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Neg(operand, target) => {
                let value = operand.get_value(scope, &mut self.value_stack)?;
                let result = value.neg()?;
                target.set_value(result, scope, &mut self.value_stack);
            }
            Jmp(label) => {
                return Ok(Jump(self.find_label(program, label)?));
            }
            JmpFalse(label, operand) => {
                let value = operand.get_value(scope, &mut self.value_stack)?;
                if !value.is_truthy() {
                    return Ok(Jump(self.find_label(program, label)?));
                }
            }
            Read => {
                let mut input = String::new();
                io::stdin()
                    .read_line(&mut input)
                    .map_err(|e| format!("Failed to read input: {e}"))?;
                let value = Value::from_str(input.trim())?;
                Target::Push.set_value(value, scope, &mut self.value_stack);
            }
            Print(operand) => {
                let value = operand.get_value(scope, &mut self.value_stack)?;
                println!("{}", value);
            }
            ScopeOut if self.is_upper_scope() => {
                self.pop_scope();
                return Ok(Done(self.pop_value_stack()?));
            }
            ScopeOut => {
                self.pop_scope();
                return Ok(Jump(self.pop_call_stack()?));
            }
            Label(_) => {}
        }

        Ok(Next)
    }

    fn is_first_run(&self) -> bool {
        self.call_stack.is_empty()
    }

    fn is_upper_scope(&self) -> bool {
        self.scope_stack.len() == 1
    }
}

#[cfg(test)]
mod tests {
    use crate::{program::Program, value::Value, vm::Vm};

    #[test]
    fn test_program() {
        let mut vm = Vm::default();
        let contents = include_str!("../test/program.4km");
        let program = contents.parse::<Program>().unwrap();
        let result = vm.run(&program).unwrap();

        assert_eq!(result, Value::from_str("136").unwrap());
    }

    #[test]
    fn test_fibonacci() {
        let mut vm = Vm::default();
        let contents = include_str!("../test/fibonacci.4km");
        let program = contents.parse::<Program>().unwrap();
        let result = vm.run(&program).unwrap();

        assert_eq!(result, Value::from_str("55").unwrap());
    }

    #[test]
    fn test_legend2() {
        let mut vm = Vm::default();
        let contents = include_str!("../test/legend2.4km");
        let program = contents.parse::<Program>().unwrap();
        let result = vm.run(&program).unwrap();

        assert_eq!(result, Value::from_str("169").unwrap());
    }

    #[test]
    fn test_legend() {
        let mut vm = Vm::default();
        let contents = include_str!("../test/legend.4km");
        let program = contents.parse::<Program>().unwrap();
        let result = vm.run(&program).unwrap();

        assert_eq!(result, Value::from_str("166").unwrap());
    }

    #[test]
    fn test_factorial() {
        let mut vm = Vm::default();
        let contents = include_str!("../test/factorial.4km");
        let program = contents.parse::<Program>().unwrap();
        let result = vm.run(&program).unwrap();

        assert_eq!(result, Value::from_str("3628800").unwrap());
    }

    #[test]
    fn test_fizzbuzz() {
        let mut vm = Vm::default();
        let contents = include_str!("../test/fizzbuzz.4km");
        let program = contents.parse::<Program>().unwrap();
        let result = vm.run(&program).unwrap();

        assert_eq!(
            result,
            Value::from_str(
                format!(r#""{}""#, include_str!("../test/fizzbuzz.txt").trim()).as_str()
            )
            .unwrap()
        );
    }
}
