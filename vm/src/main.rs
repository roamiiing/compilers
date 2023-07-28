mod instruction;
mod label;
mod operand;
mod program;
mod target;
mod value;
mod vm;

use program::Program;
use std::{env, fs::File, io::Read};
use vm::Vm;

fn main() -> Result<(), String> {
    pretty_env_logger::init();

    let file_path = env::args().nth(1).expect("No file path provided");

    let mut file = File::open(file_path).expect("File not found");

    let mut program = String::new();

    file.read_to_string(&mut program)
        .expect("Error while reading file");

    let program = program.parse::<Program>()?;

    let mut vm = Vm::default();

    let result = vm.run(&program)?;

    println!("Result: {:?}", result);

    Ok(())
}
