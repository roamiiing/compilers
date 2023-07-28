use crate::value::Value;
use std::{collections::HashMap, str::FromStr};

#[derive(Debug, Clone, PartialEq)]
pub enum Operand {
    Id(String),
    Value(Value),
    Pop,
}

impl FromStr for Operand {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let s = s.trim();

        if s == "pop" {
            Ok(Self::Pop)
        } else if s.starts_with('_') && s.ends_with('_') {
            Ok(Self::Id(s.to_owned()))
        } else {
            s.parse::<Value>().map(Self::Value)
        }
    }
}

impl Operand {
    pub fn get_value(
        &self,
        variables: &HashMap<String, Value>,
        stack: &mut Vec<Value>,
    ) -> Result<Value, String> {
        match self {
            Self::Id(id) => variables.get(id).cloned().ok_or_else(|| {
                format!(
                    "Variable {} not found in scope: {:#?}",
                    id,
                    variables.keys().collect::<Vec<_>>()
                )
            }),
            Self::Value(value) => Ok(value.clone()),
            Self::Pop => stack
                .pop()
                .ok_or_else(|| "Cannot pop. The value stack is empty".to_string()),
        }
    }
}
