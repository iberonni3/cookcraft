<?php
/**
 * CookCraft – delete_recipe.php
 * Handles server-side deletion of a recipe from the JSON database.
 */

define('DB_FILE', __DIR__ . '/data/recipes.json');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id   = $data['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Recipe ID is required']);
    exit;
}

if (!file_exists(DB_FILE)) {
    http_response_code(404);
    echo json_encode(['error' => 'Database not found']);
    exit;
}

$recipes = json_decode(file_get_contents(DB_FILE), true) ?? [];
$initialCount = count($recipes);

$recipes = array_filter($recipes, fn($r) => $r['id'] != $id);

if (count($recipes) === $initialCount) {
    http_response_code(404);
    echo json_encode(['error' => 'Recipe not found']);
    exit;
}

file_put_contents(DB_FILE, json_encode(array_values($recipes), JSON_PRETTY_PRINT));

echo json_encode(['success' => true, 'message' => 'Recipe deleted successfully']);
?>
