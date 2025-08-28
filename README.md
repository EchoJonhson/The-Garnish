# The Garnish

*A bar management system for artisans, not just accountants.*

---

## Manifesto

This is not just another piece of software. It's a statement.

We believe that the heart of a bar isn't in its spreadsheets, but in the craft, the atmosphere, and the stories shared over a well-made drink. "The Garnish" is designed to be the silent partner that handles the tedious, so you can focus on the magic. It’s the final, perfect touch—the garnish—that complements your artistry without ever getting in the way.

We're building this for the artist, the host, the creator. If you believe in the soul of your establishment, you're in the right place. This is for those who pour their passion into every glass.

This is for artisans, not just accountants.

---

## 🚀 Quick Start

### System Requirements

- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 9.0.0
- **Available Ports**: 3001 (backend), 5173 (frontend)

### One-Click Start (Recommended)

```bash
npm run start
```

This command will automatically:
- ✅ Check your system environment.
- ✅ Install all dependencies.
- ✅ Initialize the database.
- ✅ Start backend and frontend services.
- ✅ Display access URLs.

### Access

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Default Login**: `admin` / `admin123`

---

## 🛠️ Troubleshooting

A comprehensive troubleshooting guide is available in `TROUBLESHOOTING.md`. Here are the most common solutions:

- **Page is blank or you see errors?**
    1.  **Force Refresh**: `Ctrl + F5` or `Cmd + Shift + R`.
    2.  **Check Console**: Open Developer Tools (F12) and look for red error messages in the Console tab.
    3.  **Restart Server**: Stop the process in your terminal (`Ctrl + C`) and run `npm run start` again.

- **Port already in use?**
    ```bash
    # Find the process using the port (e.g., 5173)
    lsof -i :5173
    # Stop the process
    kill -9 <PID>
    ```

- **Dependencies failed to install?**
    ```bash
    # Clean cache and reinstall everything
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
    ```

For more detailed guides on specific issues, please see `TROUBLESHOOTING.md`.

---

## Project Structure

*(A brief overview of the project structure will be added here soon.)*

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite

---

**Enjoy using The Garnish! 🍹**