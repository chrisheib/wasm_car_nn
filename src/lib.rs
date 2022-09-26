mod utils;

use wasm_bindgen::prelude::*;

use serde::{Deserialize, Serialize};

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

static mut STATE: State = State { cars: vec![] };

struct State {
    cars: Vec<Car>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Car {
    number: i32,
    brain: Network,
}

#[derive(Serialize, Deserialize, Debug)]
struct Network {
    levels: Vec<Level>,
}

impl Network {
    fn feed_forward(&self, inputs: Vec<f64>) -> [bool; 4] {
        let mut outputs = self.levels[0].feed_forward(inputs);
        for l in self.levels.iter().skip(1) {
            outputs = l.feed_forward(outputs);
        }
        if outputs.len() != 4 {
            panic!("Hier müssen 4 Outputs sein!!! Es sind {}", outputs.len())
        }
        let mut out = [false, false, false, false];
        for (i, o) in outputs.iter().enumerate() {
            out[i] = *o == 1.0;
        }
        out
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Level {
    outputs: usize,
    weights: Vec<Vec<f64>>,
    biases: Vec<f64>,
    last_level: bool,
}

impl Level {
    fn feed_forward(&self, inputs: Vec<f64>) -> Vec<f64> {
        let mut outputs = vec![];
        for output_num in 0..self.outputs {
            let mut sum = 0.0;
            for (input_num, input) in inputs.iter().enumerate() {
                sum += input * self.weights[input_num][output_num]
            }
            let out = if self.last_level {
                // Sigmoid
                if 1.0 / (1.0 + (-(sum + self.biases[output_num])).exp()) > 0.5 {
                    1.0
                } else {
                    0.0
                }
            } else {
                // Relu
                if sum + self.biases[output_num] > 0.0 {
                    sum + self.biases[output_num]
                } else {
                    0.0
                }
            };
            outputs.push(out);
        }
        outputs
    }
}

fn get_mut_ref() -> &'static mut State {
    unsafe { &mut STATE }
}

#[wasm_bindgen]
pub fn init_hook() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn add_car(number: JsValue, network: JsValue) {
    let network: Network =
        serde_wasm_bindgen::from_value(network.clone()).expect(&format!("{network:?}"));
    let number: i32 = serde_wasm_bindgen::from_value(number).unwrap();

    let cars = &mut get_mut_ref().cars;

    let car = Car {
        number,
        brain: network,
    };
    // console_log!("{car:?}");
    cars.push(car);
}

#[wasm_bindgen]
pub fn feed_forward_car_no(number: JsValue, inputs: JsValue) -> JsValue {
    let number: usize = serde_wasm_bindgen::from_value(number).unwrap();
    let inputs: Vec<f64> = serde_wasm_bindgen::from_value(inputs).unwrap();

    // console_log!("{inputs:?}");

    let cars = &get_mut_ref().cars;

    let car = &cars[number];
    let out = car.brain.feed_forward(inputs);

    serde_wasm_bindgen::to_value(&out).unwrap()
}

#[wasm_bindgen]
pub fn test_send_array(number: JsValue) {
    let number: Vec<f64> = serde_wasm_bindgen::from_value(number).unwrap();
    console_log!("{number:?}");
}

#[wasm_bindgen]
pub fn test_send_array_array(number: JsValue) {
    let number: Vec<Vec<f64>> = serde_wasm_bindgen::from_value(number).unwrap();
    console_log!("{number:?}");
}

#[derive(Serialize, Deserialize, Debug)]
struct Test {
    name: String,
    arrrrs: Vec<Vec<f64>>,
}

#[wasm_bindgen]
pub fn test_send_struct(number: JsValue) {
    let number: Test = serde_wasm_bindgen::from_value(number).unwrap();
    console_log!("{number:?}");
}

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    // fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// #[wasm_bindgen]
// pub fn greet() {
//     alert("Hello, wasm-car-dl!");
// }
