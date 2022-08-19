INSERT INTO department (name)
VALUES
('it'),
('sales'),
('legal');

INSERT INTO role (title, salary, department_id)
VALUES
('it grunt', '1.00', 1),
('it manager', '100.00', 1),
('sales grunt', '1.00', 2),
('sales manager', '100.00', 2),
('lawyer grunt', '10.00', 3),
('laywer manager', '11.00', 3);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('mob', 'tee', 2, NULL),
('tim', 'terp', 4, NULL),
('Jim', 'slim', 6, NULL),
('bob', 'smith', 1,1),
('mike', 'chin', 1,1),
('sally', 'sanders', 3,2),
('sam', 'slide', 3,2),
('lee', 'loo', 5,3),
('malcolm', 'middle', 6, 3),
('charles', 'lie', 5,9);