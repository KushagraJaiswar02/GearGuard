# 🔐 Resetting MySQL Root Password

You are locked out of the database. Follow these steps to reset the password to **`GearGuard2025!`**.

## 🛑 CRITICAL STEP: Stop MySQL First
The error `Do you already have another mysqld server running on port: 3306 ?` means **MySQL is still running**. You MUST stop it first.

1. Press `Win + R`, type `services.msc`, and press Enter.
2. Find **MySQL80** (or **MySQL**).
3. **Right-click > Stop**.
4. **Wait** until it stops completely.

> **Alternative (Admin Command Prompt):**
> Run: `net stop MySQL80`

## Step 2: Run the Reset Command
Once the service is **stopped**, run this command in Administrator Command Prompt:

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0.41\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="e:\Majors\GearGuard\backend\mysql-init.txt" --console
```

It should run, change the password, and then maybe hang or shut down.
- If it hangs saying "ready for connections", wait 10 seconds then press `Ctrl + C`.

## Step 3: Start Service
1. Go back to `services.msc`.
2. **Right-click > Start**.

## Step 4: Update .env & Connect
Update `.env`:
```properties
DB_PASSWORD="GearGuard2025!"
```
Then try running verification again.
