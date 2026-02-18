-- Actualizar tabla de perfiles para incluir rol
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Actualizar perfiles existentes para tener rol 'user' por defecto
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Verificar que el campo se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles';
