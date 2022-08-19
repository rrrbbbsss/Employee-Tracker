const inquirer = require('inquirer');
const db = require('./config/connection.js');
const cTable = require('console.table');

class Choice {
    constructor(choice, action) {
        this.name = choice;
        this.value = action;
    }
}

// try to pretty print some things
function printQueryResult(result) {
    console.log('\n\n');
    console.table(result[0][0]);
    console.log('\n\n');
}
function printAddResult(result) {
    console.log('\n\n');
    console.log(`Added ${result} to database`)
    console.log('\n\n');
}

// input validation functions
function validateStringlength(str) {
    if (str.length <= 30) {
        return true;
    } else {
        console.log("Please enter a string less than 30 characters long");
        return false;
    }
}
function validateSalary(str) {
    if (parseFloat(str)) {
        return true;
    } else {
        console.log("Please enter a valid salary");
        return false;
    }
}

// actions from menu choices
function quitA(conn) {
    return conn;
}
function viewAllEmployeesA(conn) {
    return conn.query('call sp_employees()')
        .then(result => {
            printQueryResult(result);
            return mainPrompt(conn);
        });
}
function viewAllRolesA(conn) {
    return conn.query('call sp_roles()')
        .then(result => {
            printQueryResult(result);
            return mainPrompt(conn);
        });
}
function viewAllDepartmentsA(conn) {
    return conn.query('call sp_departments()')
        .then(result => {
            printQueryResult(result);
            return mainPrompt(conn);
        });
}
async function addDepartmentA(conn) {
    const { department } = await addDepartmentPrompt();
    const result = await conn.query('call sp_addDepartment(?)', [department]);
    printAddResult(department);
    return mainPrompt(conn);
}
async function addRoleA(conn) {
    const [[departments]] = await conn.query('call sp_departments_id()');
    const { role, salary, department } = await addRolePrompt(departments);
    const result = await conn.query('call sp_addRole(?,?,?)', [role, salary, department]);
    printAddResult(role);
    return mainPrompt(conn);
}
async function addEmployeeA(conn) {
    const [[roles]] = await conn.query('call sp_roles_id()');
    const [[employees]] = await conn.query('call sp_employees_id()');
    const { first_name, last_name, role, manager } = await addEmployeePrompt(roles, employees);
    const result = await conn.query('call sp_addEmployee(?,?,?,?)', [first_name, last_name, role, manager]);
    printAddResult(first_name + last_name);
    return mainPrompt(conn);
}
async function updateEmployeeRoleA(conn) {
    const [[employees]] = await conn.query('call sp_employees_id()');
    const [[roles]] = await conn.query('call sp_roles_id()');
    const { employee, role } = await updateEmployeeRolePrompt(employees, roles);
    const result = await conn.query('call sp_updateEmployeeRole(?,?)', [employee, role]);
    // todo add print statement
    return mainPrompt(conn);
}
async function updateEmployeeManagerA(conn) {
    const [[employees]] = await conn.query('call sp_employees_id()');
    const { employee, manager } = await updateEmployeeManagerPrompt(employees);
    const result = await conn.query('call sp_updateEmployeeManager(?,?)', [employee, manager]);
    // todo add print statement
    return mainPrompt(conn);
}
async function viewManagersEmployeesA(conn) {
    const [[managers]] = await conn.query('call sp_managers_id()');
    const { manager } = await viewManagersEmployeesPrompt(managers);
    const result = await conn.query('call sp_ManagerEmployees(?)', [manager]);
    printQueryResult(result);
    return mainPrompt(conn);
}
async function viewDepartmentEmployeesA(conn) {
    const [[departments]] = await conn.query('call sp_departments_id()');
    const { department } = await viewDepartmentEmployeesPrompt(departments);
    const result = await conn.query('call sp_DepartmentEmployees(?)', [department]);
    printQueryResult(result);
    return mainPrompt(conn);
}
async function viewDepartmentBudgetA(conn) {
    const [[departments]] = await conn.query('call sp_departments_id()');
    const { department } = await viewDepartmentBudgetPrompt(departments);
    const result = await conn.query('call sp_DepartmentBudget(?)', [department]);
    printQueryResult(result);
    return mainPrompt(conn);
}


const mainChoices = [
    new Choice('View All Employees', viewAllEmployeesA),
    new Choice('Add Employee', addEmployeeA),
    new Choice('Update Employee Role', updateEmployeeRoleA),
    new Choice('View All Roles', viewAllRolesA),
    new Choice('Add Role', addRoleA),
    new Choice('View All Departments', viewAllDepartmentsA),
    new Choice('Add Department', addDepartmentA),
    new Choice('Update Employees Manager', updateEmployeeManagerA),
    new Choice('View Employees by Manager', viewManagersEmployeesA),
    new Choice('View Employees by Department', viewDepartmentEmployeesA),
    new Choice('View Department Budget', viewDepartmentBudgetA),
    new Choice('Quit', quitA),
]

const mainQuestions = [
    {
        type: 'list',
        name: 'main',
        message: 'What would you like to do?',
        choices: mainChoices
    }
]

function mainPrompt(conn) {
    return inquirer.prompt(mainQuestions)
        .then(({ main }) => {
            return main(conn);
        });
}
function addDepartmentPrompt() {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Please enter the title of the department: ',
            validate: validateStringlength
        }
    ])
}
function addRolePrompt(departments) {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: 'Please enter the title of the role: ',
            validate: validateStringlength
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Please enter the salary of the role: ',
            validate: validateSalary
        },
        {
            type: 'list',
            name: 'department',
            message: 'Please select the department of the role: ',
            choices: departments
        }
    ])
}
function addEmployeePrompt(roles, managers) {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "Please enter the employee's first name: ",
            validate: validateStringlength
        },
        {
            type: 'input',
            name: 'last_name',
            message: "Please enter the employee's last name: ",
            validate: validateStringlength
        },
        {
            type: 'list',
            name: 'role',
            message: "Please select the employee's role: ",
            choices: roles
        },
        {
            type: 'list',
            name: 'manager',
            message: "Please select the employee's manager: ",
            choices: [{ name: 'None', value: undefined }, ...managers]
        }
    ])
}
function updateEmployeeRolePrompt(employees, roles) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Which employee's role do you want to update?",
            choices: employees
        },
        {
            type: 'list',
            name: 'role',
            message: "Which role do you want to assign the selected employee?",
            choices: roles
        }
    ])
}
function updateEmployeeManagerPrompt(employees) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Which employee's manager do you want to update?",
            choices: employees
        },
        {
            type: 'list',
            name: 'manager',
            message: "Which manager do you want to assign the selected employee?",
            choices: employees
        }
    ])
}
function viewManagersEmployeesPrompt(managers) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: "Which manager do you want to see the employees of?",
            choices: managers
        }
    ])
}
function viewManagersEmployeesPrompt(managers) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: "Which manager do you want to see the employees of?",
            choices: managers
        }
    ])
}
function viewDepartmentEmployeesPrompt(departments) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'department',
            message: "Which department do you want to see the employees of?",
            choices: departments
        }
    ])
}
function viewDepartmentBudgetPrompt(departments) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'department',
            message: "Which department do you want to see their budget?",
            choices: departments
        }
    ])
}


const banner = `
======================
== Employee Tracker ==
======================

`

function init() {
    console.log(banner);
    db
        .then(conn => {
            return mainPrompt(conn);
        })
        .then(conn => {
            console.log('see ya later');
            conn.end();
        })
        .catch(err => console.log(err));
}

init();