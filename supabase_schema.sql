-- Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text default 'personal',
  priority text default 'medium',
  status text default 'pending',
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Crear tabla de transacciones (finanzas)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount decimal(10,2) not null,
  description text not null,
  category text default 'Otros',
  account text default 'personal' check (account in ('personal', 'business')),
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Crear tabla de contactos (CRM)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  status text default 'lead' check (status in ('lead', 'prospect', 'customer', 'inactive')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Crear tabla de eventos (Calendario)
CREATE TABLE IF NOT EXISTS events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  all_day boolean default false,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table transactions enable row level security;
alter table contacts enable row level security;
alter table events enable row level security;

-- Políticas de seguridad (cada usuario solo ve sus datos)
CREATE POLICY "Users can only access their own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own tasks"
  ON tasks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own transactions"
  ON transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own contacts"
  ON contacts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own events"
  ON events FOR ALL USING (auth.uid() = user_id);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
