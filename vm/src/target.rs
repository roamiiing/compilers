use crate::value::Value;
use std::{collections::HashMap, fmt::Display, str::FromStr};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Target {
    Id(String),
    Push,
}

impl FromStr for Target {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let s = s.trim();

        if s == "push" {
            Ok(Self::Push)
        } else if s.starts_with('_') && s.ends_with('_') {
            Ok(Self::Id(s.to_owned()))
        } else {
            Err(format!("Invalid target: {}", s))
        }
    }
}

impl Display for Target {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Id(id) => write!(f, "{}", id),
            Self::Push => write!(f, "push"),
        }
    }
}

impl Target {
    pub fn set_value(
        &self,
        value: Value,
        variables: &mut HashMap<String, Value>,
        stack: &mut Vec<Value>,
    ) {
        match self {
            Self::Id(id) => {
                variables.insert(id.clone(), value);
            }
            Self::Push => {
                stack.push(value);
            }
        }
    }
}
