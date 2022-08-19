DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;
DROP VIEW IF EXISTS v_department_costs;
DROP PROCEDURE IF EXISTS sp_employees;
DROP PROCEDURE IF EXISTS sp_employees_id;
DROP PROCEDURE IF EXISTS sp_departments;
DROP PROCEDURE IF EXISTS sp_departments_id;
DROP PROCEDURE IF EXISTS sp_roles;
DROP PROCEDURE IF EXISTS sp_roles_id;
DROP PROCEDURE IF EXISTS sp_managers_id;
DROP PROCEDURE IF EXISTS sp_addDepartment;
DROP PROCEDURE IF EXISTS sp_addRole;
DROP PROCEDURE IF EXISTS sp_addEmployee;
DROP PROCEDURE IF EXISTS sp_updateEmployeeRole;
DROP PROCEDURE IF EXISTS sp_updateEmployeeManager;
DROP PROCEDURE IF EXISTS sp_ManagerEmployees;
DROP PROCEDURE IF EXISTS sp_DepartmentEmployees;
DROP PROCEDURE IF EXISTS sp_DepartmentBudget;

CREATE TABLE department (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER,
    manager_id INTEGER,
    FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON DELETE SET NULL,
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL
);

CREATE VIEW v_department_costs
AS
SELECT 
d.id AS id,
SUM(r.salary) AS deparment_combined_salary
FROM employee e 
LEFT JOIN role r ON e.role_id = r.id 
LEFT JOIN department d ON r.department_id = d.id
GROUP BY d.id;


CREATE PROCEDURE sp_employees()
SELECT 
e.id, 
e.first_name, 
e.last_name, 
d.name AS department,
r.title, 
r.salary, 
CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM 
employee e
LEFT JOIN employee m ON e.manager_id = m.id
LEFT JOIN role r ON e.role_id = r.id
LEFT JOIN department d ON r.department_id = d.id;  

CREATE PROCEDURE sp_employees_id()
SELECT 
e.id AS value, 
CONCAT(e.first_name, ' ', e.last_name) AS name
FROM 
employee e;

CREATE PROCEDURE sp_departments()
SELECT * FROM department;

CREATE PROCEDURE sp_departments_id()
SELECT 
d.id AS value,
d.name AS name
FROM department d;

CREATE PROCEDURE sp_roles()
SELECT 
r.id,
r.title,
d.name AS department,
r.salary
FROM role r
JOIN department d ON r.department_id = d.id;

CREATE PROCEDURE sp_roles_id()
SELECT 
r.id AS value,
r.title AS name
FROM role r;

CREATE PROCEDURE sp_managers_id()
SELECT m.id AS value,  
CONCAT(m.first_name, ' ', m.last_name) AS name
FROM employee e
INNER JOIN employee m ON e.manager_id = m.id
GROUP BY m.id;

CREATE PROCEDURE sp_addDepartment(IN p_name VARCHAR(30))
INSERT INTO department (name)
VALUES (p_name);

CREATE PROCEDURE sp_addRole(IN p_title VARCHAR(30), IN p_salary DECIMAL(10,2), IN p_department INTEGER)
INSERT INTO role (title, salary, department_id)
VALUES (p_title, p_salary, p_department);

CREATE PROCEDURE sp_addEmployee(IN p_first VARCHAR(30), IN p_last VARCHAR(30), IN p_role INTEGER, IN p_manager INT)
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES (p_first, p_last, p_role, p_manager);

CREATE PROCEDURE sp_updateEmployeeRole(IN p_id INT, IN p_role INT)
UPDATE employee 
SET 
role_id = p_role
WHERE employee.id = p_id;

CREATE PROCEDURE sp_updateEmployeeManager(IN p_id INT, IN p_manager INT)
UPDATE employee 
SET 
manager_id = p_manager
WHERE employee.id = p_id;


CREATE PROCEDURE sp_ManagerEmployees(IN m_id INT)
SELECT 
e.id, 
e.first_name, 
e.last_name, 
d.name AS department,
r.title, 
r.salary, 
CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM 
employee e
LEFT JOIN employee m ON e.manager_id = m.id
LEFT JOIN role r ON e.role_id = r.id
LEFT JOIN department d ON r.department_id = d.id
WHERE m.id = m_id;  

CREATE PROCEDURE sp_DepartmentEmployees(IN d_id INT)
SELECT 
e.id, 
e.first_name, 
e.last_name, 
d.name AS department,
r.title, 
r.salary, 
CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM 
employee e
LEFT JOIN employee m ON e.manager_id = m.id
LEFT JOIN role r ON e.role_id = r.id
LEFT JOIN department d ON r.department_id = d.id
WHERE d.id = d_id;  

CREATE PROCEDURE sp_DepartmentBudget(IN d_id INT)
SELECT * 
FROM v_department_costs 
WHERE v_department_costs.id = d_id;