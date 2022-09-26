const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
// const networkCanvas = document.getElementById("networkCanvas");
// networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
// const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        cars[i].number = i;
        if (i != 0) {
            if (i % 2 == 0) {
                NeuralNetwork.mutateAll(cars[i].brain, (i * (1.0 / (N * 10.0))) / 4);
            } else {
                NeuralNetwork.mutatePoints(cars[i].brain, (i * (1.0 / (N * 10.0))) / 4);
            }
            // push_to
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -100, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -400, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -400, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -650, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -700, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -900, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -900, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -1050, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -1100, 30, 50, "DUMMY", 2, getRandomColor()),
];

let old_select = -1;
let frame = 0
let best_distance = 1000000;
let best_frame = 0;
document.getElementById("car_list").value = ""

function save() {
    let number = document.getElementById("car_select").value;
    localStorage.setItem("bestBrain",
        JSON.stringify(cars[number].brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
        cars[i - 1].number = i - 1
    }
    return cars;
}

function run_main() {
    // let brain = { levels: new Array(3) }
    // brain.levels[0] = {
    //     outputs: 2,
    //     weights: [[1, 2], [2, 3]],
    //     biases: [1, 2],
    //     last_level: false
    // }
    // brain.levels[1] = {
    //     outputs: 2,
    //     weights: [[1, 2], [2, 3]],
    //     biases: [1, 2],
    //     last_level: false
    // }
    // brain.levels[2] = {
    //     outputs: 4,
    //     weights: [[1, 2, 3, 5], [2, 3, 4, 5]],
    //     biases: [1, 2, 3, 4],
    //     last_level: true
    // }

    for (let i in cars) {
        let brain = { levels: [] }

        for (let j in cars[i].brain.levels) {
            // console.log(cars[i].brain.levels[j])
            let level = {
                outputs: cars[i].brain.levels[j].outputs.length,
                weights: cars[i].brain.levels[j].weights,
                biases: cars[i].brain.levels[j].biases,
                last_level: cars[i].brain.levels[j].lastLevel
            }
            // console.log(level)
            brain.levels.push(level)
        }

        add_car(Number(i), brain)
    }

    // add_car(1, brain)
    animate()
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    let min_distance = Math.min(...cars.map(c => c.y - traffic[traffic.length - 1].y))

    let bestCar = cars.find(c => c.y - traffic[traffic.length - 1].y == min_distance);

    if (min_distance < best_distance) {
        if (old_select != bestCar.number) {
            old_select = bestCar.number;
            document.getElementById("car_select").value = bestCar.number;
            document.getElementById("car_list").value += bestCar.number + "\n"
        }
        best_distance = min_distance
        document.getElementById("best_car").innerText = bestCar.number + ": " + Math.trunc(min_distance);
        best_frame = frame
    }

    carCanvas.height = window.innerHeight;
    // networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, true);
    carCtx.fillText(frame.toString(), 10, 10 + bestCar.y - 100)

    carCtx.restore();

    // networkCtx.lineDashOffset = -time / 50;
    // Visualizer.drawNetwork(networkCtx, bestCar.brain);
    frame += 1
    if (frame <= 1300 && best_frame + 50 > frame) {
        requestAnimationFrame(animate);
    } else {
        if (document.getElementById("car_select").value != 0) {
            save();
            document.getElementById("hall_of_fame").value += document.getElementById("car_select").value + ": " + Math.trunc(best_distance) + "\n"
        }
        location.reload();
    }
}