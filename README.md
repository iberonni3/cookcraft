# 🍳 CookCraft – Recipe Manager

CookCraft is a professional, full-stack personal recipe management application designed to help you organize, browse, and save your favorite culinary creations. Built with a clean "Glassmorphism" design, it offers a premium user experience while maintaining a simple, functional backend.

## ✨ Features

- **Full CRUD Support**: Create, Read, Update, and Delete your recipes with ease.
- **Premium Design**: A modern, responsive UI featuring smooth CSS animations, elegant typography (Playfair Display & Outfit), and a warm color palette.
- **Advanced Search & Filtering**: Instant search by recipe name or ingredients, plus category-based filtering (Breakfast, Lunch, Dinner, etc.).
- **Favorites System**: "Heart" your most-loved recipes to find them quickly; your preferences are saved to the server.
- **Flexible Media**: Support for both pasting online image URLs and uploading photos directly from your device.
- **SEO Optimized**: Includes Recipe Schema.org structured data, making your recipes ready for search engines.

## 🚀 Tech Stack

- **Frontend**: HTML5 (Semantic), CSS3 (Custom design, Grid/Flexbox), Vanilla JavaScript (ES6+ Fetch API).
- **Backend**: PHP (Server-side logic & file handling).
- **Storage**: JSON-based flat-file database (no complex DB setup required).

## 🛠️ Setup Instructions

To run CookCraft locally, you will need a PHP environment (like **XAMPP**, WAMP, or MAMP).

1.  **Locate Web Root**: Open your local server directory (e.g., `C:\xampp\htdocs\`).
2.  **Move Files**: Place all CookCraft files and folders into a new directory named `cookcraft`.
3.  **Permissions**: Ensure the `uploads/` and `data/` directories are writable by the server.
4.  **Launch**:
    - Start your Apache server.
    - Open your browser and go to: `http://localhost/cookcraft/index.html`

## 📂 Project Structure

- `index.html`: The main dashboard and search portal.
- `add-recipe.html`: Dynamic form for creating and editing recipes.
- `recipe.html`: Detailed view for individual recipes.
- `style.css`: Custom design system and premium styling.
- `app.js`: Core frontend logic and API communications.
- `save_recipe.php`: Handles new entry creation and image uploads.
- `update_recipe.php`: Powers editing and favorite toggling.
- `delete_recipe.php`: Handles recipe removal.
- `get_recipes.php`: API endpoint for fetching saved recipes.
- `data/`: Contains the `recipes.json` database.
- `uploads/`: Stores images uploaded directly to the platform.

---
*Built with ❤️ for food lovers.*
