use crate::{label::Label, operand::Operand, target::Target};
use std::str::FromStr;

#[derive(Debug, PartialEq, Clone)]
pub enum Instruction {
    Mov(Target, Operand),

    Add(Operand, Operand, Target),
    Sub(Operand, Operand, Target),
    Mul(Operand, Operand, Target),
    Div(Operand, Operand, Target),
    Mod(Operand, Operand, Target),
    And(Operand, Operand, Target),
    Or(Operand, Operand, Target),
    Not(Operand, Target),
    Neg(Operand, Target),
    Eq(Operand, Operand, Target),
    Neq(Operand, Operand, Target),
    Less(Operand, Operand, Target),
    LessEq(Operand, Operand, Target),
    Greater(Operand, Operand, Target),
    GreaterEq(Operand, Operand, Target),

    Jmp(Label),
    JmpFalse(Label, Operand),

    Print(Operand),
    Read,
    Call(Label),

    ScopeOut,

    Label(Label),
}

impl FromStr for Instruction {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let mut quote_flag = false;
        let mut word = String::new();
        let mut words = vec![];

        for char in s.chars() {
            if !char.is_whitespace() {
                if char == '"' {
                    quote_flag = !quote_flag;
                }
                word.push(char);
            } else {
                if !quote_flag {
                    words.push(word);
                    word = String::new();
                } else {
                    word.push(char);
                }
            }
        }

        if !word.is_empty() {
            words.push(word);
        }

        let mut instruction_iter = words
            .iter()
            .map(|line| line.trim())
            .filter(|line| !line.is_empty());

        let instruction = instruction_iter.next().ok_or("Empty instruction")?;
        let instruction = instruction.to_lowercase();

        let arg1 = instruction_iter.next();
        let arg2 = arg1.and_then(|_| instruction_iter.next());
        let arg3 = arg2.and_then(|_| instruction_iter.next());

        Ok(match (instruction.as_str(), arg1, arg2, arg3) {
            ("mov", Some(target), Some(operand), None) => {
                Self::Mov(target.parse::<Target>()?, operand.parse::<Operand>()?)
            }

            ("+", Some(operand1), Some(operand2), Some(target)) => Self::Add(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("-", Some(operand1), Some(operand2), Some(target)) => Self::Sub(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("*", Some(operand1), Some(operand2), Some(target)) => Self::Mul(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("/", Some(operand1), Some(operand2), Some(target)) => Self::Div(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("%", Some(operand1), Some(operand2), Some(target)) => Self::Mod(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("&", Some(operand1), Some(operand2), Some(target)) => Self::And(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("|", Some(operand1), Some(operand2), Some(target)) => Self::Or(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("!", Some(operand), Some(target), None) => {
                Self::Not(operand.parse::<Operand>()?, target.parse::<Target>()?)
            }

            ("neg", Some(operand), Some(target), None) => {
                Self::Neg(operand.parse::<Operand>()?, target.parse::<Target>()?)
            }

            ("==", Some(operand1), Some(operand2), Some(target)) => Self::Eq(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("!=", Some(operand1), Some(operand2), Some(target)) => Self::Neq(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("<", Some(operand1), Some(operand2), Some(target)) => Self::Less(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("<=", Some(operand1), Some(operand2), Some(target)) => Self::LessEq(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            (">", Some(operand1), Some(operand2), Some(target)) => Self::Greater(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            (">=", Some(operand1), Some(operand2), Some(target)) => Self::GreaterEq(
                operand1.parse::<Operand>()?,
                operand2.parse::<Operand>()?,
                target.parse::<Target>()?,
            ),

            ("jmp", Some(label), None, None) => Self::Jmp(label.parse::<Label>()?),

            ("jf", Some(label), Some(operand), None) => {
                Self::JmpFalse(label.parse::<Label>()?, operand.parse::<Operand>()?)
            }

            ("read", None, None, None) => Self::Read,

            ("prn", Some(operand), None, None) => Self::Print(operand.parse::<Operand>()?),

            ("call", Some(label), None, None) => Self::Call(label.parse::<Label>()?),

            ("out", None, None, None) => Self::ScopeOut,

            ("lbl", Some(label), None, None) => Self::Label(label.parse::<Label>()?),

            (instruction, _, _, _) => {
                return Err(format!("Error while parsing instruction: {}", instruction))
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use crate::value::Value;

    use super::*;

    #[test]
    fn test_parse_instruction() {
        assert_eq!(
            r#"mov push "Enter X""#.parse::<Instruction>(),
            Ok(Instruction::Mov(
                Target::Push,
                Operand::Value(Value::String("Enter X".to_string()))
            ))
        );
    }

    #[test]
    fn test_parse_instruction_with_label() {
        assert_eq!(
            r#"lbl $$Function__main_$$"#.parse::<Instruction>(),
            Ok(Instruction::Label(Label::new("$$Function__main_$$")))
        );
    }
}
