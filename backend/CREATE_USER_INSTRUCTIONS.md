# 👤 Create New Database User

Since `root` is giving us trouble, let's create a fresh user `gear_admin`.

## Step 1: Stop MySQL
1. Open `services.msc`.
2. Find `MySQL80` (or `MySQL`).
3. **Stop** it.

## Step 2: Run User Creation Scripts
Open **Administrator Command Prompt** and run:

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0.41\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL"C:\Program Files\MySQL\MySQL Server 8.0.41\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="e:\Majors\GearGuard\backend\create_user.txt" Server 8.0\my.ini" --init-file="e:\Majors\GearGuard\backend\create_user.txt" --console
```

Wait for "ready for connections", then wait 5 seconds, and press `Ctrl + C`.

## Step 3: Start MySQL
1. Go back to `services.msc`.
2. **Start** `MySQL80`.

## Step 4: Update .env
Change your `.env` to use the new user:

```properties
DB_USER=gear_admin
DB_PASSWORD="GearGuard2025!"
```
