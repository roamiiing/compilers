use std::{fmt::Display, str::FromStr};

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct Label(String);

impl FromStr for Label {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let s = s.trim();

        if s.starts_with("$$") && s.ends_with("$$") {
            Ok(Self(s.to_owned()))
        } else {
            Err(format!("Invalid label: {}", s))
        }
    }
}

impl Display for Label {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl Label {
    pub fn new(s: &str) -> Self {
        s.parse().unwrap()
    }
}
