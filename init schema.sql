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
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PERMISSIONS
-- =========================
CREATE TABLE public.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- MENUS
-- =========================
CREATE TABLE public.menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,          -- contoh: 'menu-x'
    route VARCHAR(150),                -- optional, bisa null
    parent_id INT REFERENCES public.menus(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PIVOT TABLES
-- =========================

-- User <-> Role
CREATE TABLE public.role_user (
    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Role <-> Permission
CREATE TABLE public.permission_role (
    role_id INT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Menu <-> Permission
CREATE TABLE public.menu_permission (
    menu_id INT NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_id, permission_id)
);

alter table public.users add column deleted_at timestamp(0) default null;

insert into public.users (name, email, password) values ('admin', 'admin@example.com', '$2y$12$shr9us4trQyRgWrRXgkXo.DLhCiW/NFb7CsuDR8h739EBsb5SKGX6'); -- password: password

insert into public.permissions (name, description) values 
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

insert into public.roles (name, description) values 
    ('admin', 'Admin'),
    ('user', 'User');

insert into public.permission_role (role_id, permission_id) values 
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

insert into public.role_user (role_id, user_id) values 
    (1, 1);

alter table public.menus 
	add column icon varchar(100),
	add column order_index int;

insert into public.menus (name, slug, route, parent_id, icon, order_index) values 
    ('Dashboard', 'dashboard', 'dashboard.index', null, 'Gauge', 1),
    ('Users', 'users', 'users.index', null, 'Users', 2),
    ('Permissions', 'permissions', 'permissions.index', null, 'Lock', 3),
    ('Roles', 'roles', 'roles.index', null, 'UserCog', 4),
    ('Menus', 'menus', 'menus.index', null, 'Menu', 5),
    ('Account Settings', 'account-settings', 'account-settings.index', null, 'Settings', 6);

insert into public.menu_permission (menu_id, permission_id) values 
    (1, 1),
    (2, 4),
    (3, 8),
    (4, 12),
    (5, 16),
    (6, 2);

create or replace view public.menu_tree as
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
    FROM public.menus m
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
    FROM public.menus m
    JOIN public.menu_tree mt ON m.parent_id = mt.id
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

CREATE OR REPLACE FUNCTION public.adjust_menu_order_after_delete()
RETURNS trigger AS $$
BEGIN
  -- Update order_index semua menu dengan parent_id yang sama
  -- dan order_index lebih besar dari yang dihapus
  UPDATE public.menus
  SET order_index = order_index - 1
  WHERE parent_id IS NOT DISTINCT FROM OLD.parent_id
    AND order_index > OLD.order_index;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER public.ta_adjust_menu_order_after_delete
AFTER DELETE ON public.menus
FOR EACH ROW
EXECUTE PROCEDURE public.adjust_menu_order_after_delete();

CREATE OR REPLACE FUNCTION public.set_menu_order_before_insert()
RETURNS trigger AS $$
DECLARE
  max_order integer;
BEGIN
  -- Cari order_index tertinggi di parent yang sama
  SELECT COALESCE(MAX(order_index), 0)
  INTO max_order
  FROM public.menus
  WHERE parent_id IS NOT DISTINCT FROM NEW.parent_id;

  -- Set order_index baru = max + 1
  NEW.order_index := max_order + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER public.tb_set_menu_order_before_insert
BEFORE INSERT ON public.menus
FOR EACH ROW
EXECUTE PROCEDURE public.set_menu_order_before_insert();

ALTER TABLE public.menus
DROP CONSTRAINT menus_parent_id_fkey;

ALTER TABLE public.menus
ADD CONSTRAINT menus_parent_id_fkey
FOREIGN KEY (parent_id)
REFERENCES public.menus (id)
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
           FROM public.menus m
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
           FROM public.menus m
             JOIN public.menu_tree mt ON m.parent_id = mt.id
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

alter table public.menus 
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
           FROM public.menus m
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
           FROM public.menus m
             JOIN public.menu_tree mt ON m.parent_id = mt.id
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

update public.menus set menu_active_pattern = 'users.*' where route = 'users.index';

alter table public.menu_permission add column route varchar(100);

UPDATE public.menu_permission mp
SET route = m.route
FROM public.menus m
WHERE mp.menu_id = m.id;

ALTER TABLE public.menu_permission
ALTER COLUMN route SET NOT NULL;

ALTER TABLE public.menu_permission
DROP CONSTRAINT menu_permission_pkey;

ALTER TABLE public.menu_permission
ADD CONSTRAINT menu_permission_pkey PRIMARY KEY (menu_id, permission_id, route);

update public.menus set menu_active_pattern = 'users.*' where route = 'users.index';
update public.menus set menu_active_pattern = 'permissions.*' where route = 'permissions.index';
update public.menus set menu_active_pattern = 'roles.*' where route = 'roles.index';
update public.menus set menu_active_pattern = 'menus.*' where route = 'menus.index';
update public.menus set menu_active_pattern = 'account-settings.*' where route = 'account-settings.index';
update public.menus set menu_active_pattern = 'dashboard.*' where route = 'dashboard.index';

delete from public.menu_permission;

insert into public.menu_permission (menu_id, permission_id, route) values 
    (1, 1, 'dashboard.index'),
    (2, 4, 'users.index'),
    (2, 5, 'users.create'),
    (2, 6, 'users.detail'),
    (2, 6, 'users.detail.update-profile'),
    (2, 6, 'users.detail.change-password'),
    (2, 6, 'users.detail.change-role'),
    (2, 7, 'users.detail.deactivate'),
    (2, 7, 'users.detail.reactivate'),
    (2, 5, 'users.store'),
    (3, 8, 'permissions.index'),
    (3, 9, 'permissions.create'),
    (3, 10, 'permissions.update'),
    (3, 11, 'permissions.delete'),
    (4, 12, 'roles.index'),
    (4, 13, 'roles.create'),
    (4, 14, 'roles.update'),
    (4, 15, 'roles.delete'),
    (5, 16, 'menus.index'),
    (5, 17, 'menus.add'),
    (5, 17, 'menus.create'),
    (5, 18, 'menus.detail'),
    (5, 18, 'menus.update-order'),
    (5, 19, 'menus.destroy'),
    (5, 18, 'menus.update'),
    (6, 2, 'account-settings.index'),
    (6, 3, 'account-settings.change-password'),
    (6, 3, 'account-settings.deactivate'),
    (6, 3, 'account-settings.update-profile');
    
alter table public.users add column avatar text;

insert into public.menu_permission (menu_id, permission_id, route) values
    (6, 3, 'account-settings.upload-profile-picture');