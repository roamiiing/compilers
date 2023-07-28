use std::{fmt::Display, str::FromStr};

#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Float(f64),
    String(String),
}

impl FromStr for Value {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let s = s.trim();

        if (s.starts_with('"') && s.ends_with('"')) || (s.starts_with('\'') && s.ends_with('\'')) {
            Ok(Self::String(s[1..s.len() - 1].to_string()))
        } else {
            s.parse::<f64>()
                .map(Self::Float)
                .map_err(|_| format!("Invalid value: {}", s))
        }
    }
}

impl Display for Value {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Float(fl) => write!(f, "{}", fl),
            Self::String(s) => write!(f, "{}", s),
        }
    }
}

impl Value {
    pub fn from_str(s: &str) -> Result<Self, String> {
        s.parse()
    }

    pub fn add(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(a + b)),
            (Self::String(a), Self::String(b)) => Ok(Self::String(format!("{}{}", a, b))),
            (Self::String(a), Self::Float(b)) => Ok(Self::String(format!("{}{}", a, b))),
            (Self::Float(a), Self::String(b)) => Ok(Self::String(format!("{}{}", a, b))),
        }
    }

    pub fn sub(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(a - b)),
            _ => Err(format!("Cannot sub {:?} and {:?}", self, other)),
        }
    }

    pub fn mul(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(a * b)),
            _ => Err(format!("Cannot mul {:?} and {:?}", self, other)),
        }
    }

    pub fn div(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(a / b)),
            _ => Err(format!("Cannot div {:?} and {:?}", self, other)),
        }
    }

    pub fn modulo(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(a % b)),
            _ => Err(format!("Cannot modulo {:?} and {:?}", self, other)),
        }
    }

    pub fn eq(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => {
                Ok(Self::Float(if (a - b).abs() < std::f64::EPSILON {
                    1.0
                } else {
                    0.0
                }))
            }
            (Self::String(a), Self::String(b)) => Ok(Self::Float(if a == b { 1.0 } else { 0.0 })),
            _ => Err(format!("Cannot eq {:?} and {:?}", self, other)),
        }
    }

    pub fn ne(&self, other: &Self) -> Result<Self, String> {
        self.eq(other)?.not()
    }

    pub fn lt(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(if a < b { 1.0 } else { 0.0 })),
            (Self::String(a), Self::String(b)) => Ok(Self::Float(if a < b { 1.0 } else { 0.0 })),
            _ => Err(format!("Cannot lt {:?} and {:?}", self, other)),
        }
    }

    pub fn le(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(if a <= b { 1.0 } else { 0.0 })),
            (Self::String(a), Self::String(b)) => Ok(Self::Float(if a <= b { 1.0 } else { 0.0 })),
            _ => Err(format!("Cannot le {:?} and {:?}", self, other)),
        }
    }

    pub fn gt(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(if a > b { 1.0 } else { 0.0 })),
            (Self::String(a), Self::String(b)) => Ok(Self::Float(if a > b { 1.0 } else { 0.0 })),
            _ => Err(format!("Cannot gt {:?} and {:?}", self, other)),
        }
    }

    pub fn ge(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => Ok(Self::Float(if a >= b { 1.0 } else { 0.0 })),
            (Self::String(a), Self::String(b)) => Ok(Self::Float(if a >= b { 1.0 } else { 0.0 })),
            _ => Err(format!("Cannot ge {:?} and {:?}", self, other)),
        }
    }

    pub fn and(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => {
                Ok(Self::Float(if *a != 0.0 && *b != 0.0 { 1.0 } else { 0.0 }))
            }
            _ => Err(format!("Cannot and {:?} and {:?}", self, other)),
        }
    }

    pub fn or(&self, other: &Self) -> Result<Self, String> {
        match (self, other) {
            (Self::Float(a), Self::Float(b)) => {
                Ok(Self::Float(if *a != 0.0 || *b != 0.0 { 1.0 } else { 0.0 }))
            }
            _ => Err(format!("Cannot or {:?} and {:?}", self, other)),
        }
    }

    pub fn not(&self) -> Result<Self, String> {
        match self {
            Self::Float(a) => Ok(Self::Float(if *a != 0.0 { 0.0 } else { 1.0 })),
            _ => Err(format!("Cannot not {:?}", self)),
        }
    }

    pub fn neg(&self) -> Result<Self, String> {
        match self {
            Self::Float(a) => Ok(Self::Float(-a)),
            _ => Err(format!("Cannot neg {:?}", self)),
        }
    }

    pub fn is_truthy(&self) -> bool {
        match self {
            Self::Float(a) => *a != 0.0,
            Self::String(a) => !a.is_empty(),
        }
    }
}
