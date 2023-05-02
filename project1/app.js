// ***************  Light / Dark mode toggle ****************************
function toggleSchemeMode() {
    const toggleBtn = document.getElementById('toggle__button');
    const rootEl = document.documentElement;

    toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('toggle__button--dark');
        rootEl.classList.toggle('darkModeRoot');
    })
}

toggleSchemeMode();

// ************************************************************************


// **************** Operations Logic **************************************
const MAX_NUM_DISPLAY_CHARS = 8;

class Calculator {
    constructor() {
        this.operation = null;
        this.displayed_value = "0"; //big value displayed
        this.history = []; //small display of what has last been calculated 
        this.command_pressed = false;
        this.pending = false;
    }

    all_clear() {
        this.operation = null;
        this.displayed_value = "0";
        this.history = [];
        this.command_pressed = false;
        this.pending = false;
    }

    delete() {
        if (this.displayed_value.length == 1) {
            this.displayed_value = "0";
            return;
        }
        this.displayed_value = this.displayed_value.slice(0, -1);
    }

    update_visual(value) {
        let converted_value = value + '';

        if (this.displayed_value == "0" || this.displayed_value == "illegal") {
            this.displayed_value = converted_value;
        } else {
            if (this.command_pressed == true) {
                this.displayed_value = converted_value;
                this.command_pressed = false;
            } else {
                if (this.displayed_value.includes(".") && converted_value == ".") {
                    return;
                }
                this.displayed_value += converted_value;
            }
        }
        this.displayed_value = this.displayed_value.slice(0, MAX_NUM_DISPLAY_CHARS);
       if (this.operation != null) {
            this.pending = true;
        }

    }

    new_operation(operator) {
        if (this.pending == true) {
            this.execute();
        }
        this.operation = operator;
        this.command_pressed = true;
        this.operation.set_a(this.displayed_value);
    }

    display_history() {
        let history_string = "";
        for (let i = 0; i < this.history.length; i++) {
            if (i == 0) {
                history_string += this.history[i].a;
                history_string += " ";
            }
            history_string += this.history[i].symbol;
            history_string += " ";
            history_string += this.history[i].b;
            history_string += " ";
        }
        let string_start_index = history_string.length - 20;
        if (string_start_index < 0) {
            string_start_index = 0;
        }
        history_string = history_string.slice(string_start_index, history_string.length); //trying to limit history of string displayed 
        return history_string;
    }

    execute() {
        if (this.operation == null) {
            return;
        }
        this.command_pressed = true;
        let result = this.operation.calculate(this.displayed_value);
        result = result.toString();
        this.history.push(this.operation);
        this.displayed_value = result.slice(0, MAX_NUM_DISPLAY_CHARS);
        this.pending = false;

        updateUI();
    }
}

class BaseCmd {
    constructor() {
        this.a = 0;
        this.b = 0; // used for the historical reference later
    }

    //convert the value to a float type if possible 
    set_a(value) {
        this.a = this.convert_value(value);
    }

    convert_value(value) {
        switch (typeof value) {
            case "number":
                return value;
            case "string":
                return parseFloat(value);
            default:
                break;
        }
    }
}

class SubtractCmd extends BaseCmd {
    constructor() {
        super();
        this.symbol = "-";
    }

    //calculate takes in a number or float type returns same type
    calculate(value) {
        value = this.convert_value(value);
        this.b = value;
        return this.a - value;
    }
}

class AddCmd extends BaseCmd {
    constructor() {
        super();
        this.symbol = "+";
    }

    calculate(value) {
        value = this.convert_value(value);
        this.b = value;
        return this.a + value;
    }
}

class MultiplyCmd extends BaseCmd {
    constructor() {
        super();
        this.symbol = "*";
    }

    calculate(value) {
        value = this.convert_value(value);
        this.b = value;
        return this.a * value;
    }
}

class DivideCmd extends BaseCmd {
    constructor() {
        super();
        this.symbol = "/";
    }

    calculate(value) {
        value = this.convert_value(value);
        this.b = value;
        if (value == 0) {
            return "illegal";
        }
        return this.a / value;
    }
}

class RemainderCmd extends BaseCmd {
    constructor() {
        super();
        this.symbol = "%";
    }

    calculate(value) {
        value = this.convert_value(value);
        this.b = value;
        return this.a % value;
    }
}


// ************************ Dom Manip ***************************
// UI Components
const keys = document.getElementsByClassName('keyboard__key');
const resultDisp = document.querySelector('.display__result');
const historyDisp = document.querySelector('.display__operation');


let calc = new Calculator();

function updateUI() {
    // Update UI
    resultDisp.textContent = calc.displayed_value;
    historyDisp.textContent = calc.display_history();
}

function action(symbol) {
    switch (symbol) {
        case '+':
            calc.new_operation(new AddCmd());
            break;
        case '-':
            calc.new_operation(new SubtractCmd());
            break;
        case 'x':
            calc.new_operation(new MultiplyCmd());
            break;
        case '/':
            calc.new_operation(new DivideCmd());
            break;
        case '%':
            calc.new_operation(new RemainderCmd());
            break;
        case 'AC':
        case 'Escape':
            calc.all_clear();
            break;
        case 'Del':
        case 'Backspace':
            calc.delete();
            break;
        case '=':
        case 'Enter':
            calc.execute();
            break;
    }
    if (!isNaN(symbol) || symbol == '.')
        calc.update_visual(symbol);
}

for (let i = 0; i < keys.length; i++) {
    keys[i].addEventListener('click', (e) => {
        action(keys[i].firstElementChild.textContent);
        e.target.style.boxShadow = '2px 2px 10px #000000';
        setTimeout(() => e.target.style.boxShadow = '', 200);
        updateUI();

        console.log(calc.displayed_value);
        console.log(calc.display_history());
    })
}

// ********* Physical Keyboard Functionality ***********

const possibleOperations = ['+', '-', '%', '*', '=', '.', 'Enter', '/', 'Backspace', 'Escape'];
window.addEventListener('keydown', (e) => {
    let key = e.key;
    if (possibleOperations.includes(key) || !isNaN(key)) {

        if (key == '*')
            key = 'x';
        else if (key == '/')
            e.preventDefault();


        action(key);
        updateUI();
        console.log(key + ' ' + typeof key);
    }
}); 