-- users management
-- permissions management
-- roles management
-- menus management
-- settings
-- security
-- logout

-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PERMISSIONS
-- =========================
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- MENUS
-- =========================
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,          -- contoh: 'menu-x'
    route VARCHAR(150),                -- optional, bisa null
    parent_id INT REFERENCES menus(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PIVOT TABLES
-- =========================

-- User <-> Role
CREATE TABLE role_user (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Role <-> Permission
CREATE TABLE permission_role (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Menu <-> Permission
CREATE TABLE menu_permission (
    menu_id INT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_id, permission_id)
);

alter table users add column deleted_at timestamp(0) default null;

insert into users (name, email, password) values ('admin', 'admin@example.com', '$2y$12$shr9us4trQyRgWrRXgkXo.DLhCiW/NFb7CsuDR8h739EBsb5SKGX6'); -- password: password

insert into permissions (name, description) values 
    ('dashboard.index', 'View dashboard'),
    ('account-settings.index', 'View account settings'),
    ('account-settings.edit', 'Edit account settings'),
    ('users.index', 'View users'),
    ('users.create', 'Create users'),
    ('users.edit', 'Edit users'),
    ('users.delete', 'Delete users'),
    ('permissions.index', 'View permissions'),
    ('permissions.create', 'Create permissions'),
    ('permissions.edit', 'Edit permissions'),
    ('permissions.delete', 'Delete permissions'),
    ('roles.index', 'View roles'),
    ('roles.create', 'Create roles'),
    ('roles.edit', 'Edit roles'),
    ('roles.delete', 'Delete roles'),
    ('menus.index', 'View menus'),
    ('menus.create', 'Create menus'),
    ('menus.edit', 'Edit menus'),
    ('menus.delete', 'Delete menus');

insert into roles (name, description) values 
    ('admin', 'Admin'),
    ('user', 'User');

insert into permission_role (role_id, permission_id) values 
    -- Admin (role_id = 1) dapat semua permission
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (1, 7),
    (1, 8),
    (1, 9),
    (1, 10),
    (1, 11),
    (1, 12),
    (1, 13),
    (1, 14),
    (1, 15),
    (1, 16),
    (1, 17),
    (1, 18),
    (1, 19),
    (2, 1),
    (2, 2),
    (2, 3);

insert into role_user (role_id, user_id) values 
    (1, 1);

alter table menus 
	add column icon varchar(100),
	add column order_index int;

insert into menus (name, slug, route, parent_id, icon, order_index) values 
    ('Dashboard', 'dashboard', 'dashboard.index', null, 'Gauge', 1),
    ('Users', 'users', 'users.index', null, 'Users', 2),
    ('Permissions', 'permissions', 'permissions.index', null, 'Lock', 3),
    ('Roles', 'roles', 'roles.index', null, 'UserCog', 4),
    ('Menus', 'menus', 'menus.index', null, 'Menu', 5),
    ('Account Settings', 'account-settings', 'account-settings.index', null, 'Settings', 6);

insert into menu_permission (menu_id, permission_id) values 
    (1, 1),
    (2, 4),
    (3, 8),
    (4, 12),
    (5, 16),
    (6, 2);

create or replace view menu_tree as
WITH RECURSIVE menu_tree AS (
    -- Root (menu tanpa parent)
    SELECT 
        m.id,
        m.name,
        m.parent_id,
        m.route,
        m.slug,
        m.icon,
        m.order_index AS order_position,
        1 AS level,
        ARRAY[m.order_index] AS path_order,
        m.name::text AS path_name
    FROM menus m
    WHERE m.parent_id IS NULL

    UNION ALL

    -- Recursive (menu anak)
    SELECT 
        m.id,
        m.name,
        m.parent_id,
        m.route,
        m.slug,
        m.icon,
        m.order_index AS order_position,
        mt.level + 1 AS level,
        mt.path_order || m.order_index AS path_order,
        (mt.path_name || ' > ' || m.name::text) AS path_name
    FROM menus m
    JOIN menu_tree mt ON m.parent_id = mt.id
)
SELECT 
    menu_tree.id,
    menu_tree.name,
    menu_tree.parent_id,
    menu_tree.route,
    menu_tree.slug,
    menu_tree.icon,
    menu_tree.order_position,
    menu_tree.level,
    menu_tree.path_order,
    menu_tree.path_name
FROM menu_tree
ORDER BY menu_tree.path_order;

CREATE OR REPLACE FUNCTION adjust_menu_order_after_delete()
RETURNS trigger AS $$
BEGIN
  -- Update order_index semua menu dengan parent_id yang sama
  -- dan order_index lebih besar dari yang dihapus
  UPDATE menus
  SET order_index = order_index - 1
  WHERE parent_id IS NOT DISTINCT FROM OLD.parent_id
    AND order_index > OLD.order_index;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ta_adjust_menu_order_after_delete
AFTER DELETE ON menus
FOR EACH ROW
EXECUTE PROCEDURE adjust_menu_order_after_delete();

CREATE OR REPLACE FUNCTION set_menu_order_before_insert()
RETURNS trigger AS $$
DECLARE
  max_order integer;
BEGIN
  -- Cari order_index tertinggi di parent yang sama
  SELECT COALESCE(MAX(order_index), 0)
  INTO max_order
  FROM menus
  WHERE parent_id IS NOT DISTINCT FROM NEW.parent_id;

  -- Set order_index baru = max + 1
  NEW.order_index := max_order + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tb_set_menu_order_before_insert
BEFORE INSERT ON menus
FOR EACH ROW
EXECUTE PROCEDURE set_menu_order_before_insert();

ALTER TABLE menus
DROP CONSTRAINT menus_parent_id_fkey;

ALTER TABLE menus
ADD CONSTRAINT menus_parent_id_fkey
FOREIGN KEY (parent_id)
REFERENCES menus (id)
ON UPDATE NO ACTION
ON DELETE RESTRICT;

DROP VIEW public.menu_tree;
CREATE OR REPLACE VIEW public.menu_tree AS 
 WITH RECURSIVE menu_tree AS (
         SELECT m.id,
            m.name,
            m.parent_id,
            m.route,
            m.slug,
            m.icon,
            m.order_index AS order_position,
            1 AS level,
            ARRAY[m.order_index] AS path_order_index,
            ARRAY[m.id] AS path_order,
            m.name::text AS path_name
           FROM menus m
          WHERE m.parent_id IS NULL
        UNION ALL
         SELECT m.id,
            m.name,
            m.parent_id,
            m.route,
            m.slug,
            m.icon,
            m.order_index AS order_position,
            mt.level + 1 AS level,
            mt.path_order_index || m.order_index AS path_order_index,
            mt.path_order || m.id AS path_order,
            (mt.path_name || ' > '::text) || m.name::text AS path_name
           FROM menus m
             JOIN menu_tree mt ON m.parent_id = mt.id
        )
 SELECT menu_tree.id,
    menu_tree.name,
    menu_tree.parent_id,
    menu_tree.route,
    menu_tree.slug,
    menu_tree.icon,
    menu_tree.order_position,
    menu_tree.level,
    menu_tree.path_order_index,
    menu_tree.path_order,
    menu_tree.path_name
   FROM menu_tree
  ORDER BY menu_tree.path_order_index;

alter table menus 
    add column menu_active_pattern varchar(100) default null;

DROP VIEW public.menu_tree;
CREATE OR REPLACE VIEW public.menu_tree AS 
 WITH RECURSIVE menu_tree AS (
         SELECT m.id,
            m.name,
            m.parent_id,
            m.route,
            m.menu_active_pattern,
            m.slug,
            m.icon,
            m.order_index AS order_position,
            1 AS level,
            ARRAY[m.order_index] AS path_order_index,
            ARRAY[m.id] AS path_order,
            m.name::text AS path_name
           FROM menus m
          WHERE m.parent_id IS NULL
        UNION ALL
         SELECT m.id,
            m.name,
            m.parent_id,
            m.route,
            m.menu_active_pattern,
            m.slug,
            m.icon,
            m.order_index AS order_position,
            mt.level + 1 AS level,
            mt.path_order_index || m.order_index AS path_order_index,
            mt.path_order || m.id AS path_order,
            (mt.path_name || ' > '::text) || m.name::text AS path_name
           FROM menus m
             JOIN menu_tree mt ON m.parent_id = mt.id
        )
 SELECT menu_tree.id,
    menu_tree.name,
    menu_tree.parent_id,
    menu_tree.route,
    menu_tree.menu_active_pattern,
    menu_tree.slug,
    menu_tree.icon,
    menu_tree.order_position,
    menu_tree.level,
    menu_tree.path_order_index,
    menu_tree.path_order,
    menu_tree.path_name
   FROM menu_tree
  ORDER BY menu_tree.path_order_index;

update menus set menu_active_pattern = 'users.*' where route = 'users.index';

alter table menu_permission add column route varchar(100);

UPDATE menu_permission mp
SET route = m.route
FROM menus m
WHERE mp.menu_id = m.id;

ALTER TABLE menu_permission
ALTER COLUMN route SET NOT NULL;