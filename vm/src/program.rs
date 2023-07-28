use crate::instruction::Instruction;
use std::str::FromStr;

#[derive(Debug)]
pub struct Program(pub Vec<Instruction>);

impl FromStr for Program {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        s.lines()
            .map(|line| line.trim())
            .enumerate()
            .filter(|(_, line)| !line.is_empty() && !line.starts_with("//"))
            .map(|(i, line)| {
                line.parse::<Instruction>().map_err(|e| {
                    format!("Error while parsing instruction on line {}: {}", i + 1, e)
                })
            })
            .collect::<Result<Vec<_>, _>>()
            .map(Program)
    }
}
