<?php
/**
 * CookCraft – get_recipes.php
 * Returns all saved recipes as a JSON array.
 * Called by the JavaScript frontend to load server-persisted recipes.
 *
 * Usage: GET /get_recipes.php
 *        GET /get_recipes.php?id=12345  (single recipe)
 */

define('DB_FILE', __DIR__ . '/data/recipes.json');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ── Load recipes from flat-file DB ───────────────────────
function load_recipes(): array {
    if (!file_exists(DB_FILE)) return [];
    $json = file_get_contents(DB_FILE);
    return json_decode($json, true) ?? [];
}

$recipes = load_recipes();

// ── Optional: filter by single ID ────────────────────────
if (isset($_GET['id'])) {
    $id      = (int) $_GET['id'];
    $matched = array_filter($recipes, fn($r) => $r['id'] === $id);

    if (empty($matched)) {
        http_response_code(404);
        echo json_encode(['error' => 'Recipe not found']);
        exit;
    }

    echo json_encode(array_values($matched)[0]);
    exit;
}

// ── Return all ────────────────────────────────────────────
echo json_encode($recipes);
?>
