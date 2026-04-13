<?php
/**
 * CookCraft – update_recipe.php
 * Handles editing/updating an existing recipe in the JSON database.
 */

define('DB_FILE', __DIR__ . '/data/recipes.json');

header('Content-Type: application/json');

function sanitize($value) {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Support both JSON input and Form Data (though JSON is preferred for updates)
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = $input['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Recipe ID is required for update']);
    exit;
}

if (!file_exists(DB_FILE)) {
    http_response_code(404);
    echo json_encode(['error' => 'Database not found']);
    exit;
}

$recipes = json_decode(file_get_contents(DB_FILE), true) ?? [];
$index = -1;
foreach ($recipes as $k => $r) {
    if ($r['id'] == $id) {
        $index = $k;
        break;
    }
}

if ($index === -1) {
    http_response_code(404);
    echo json_encode(['error' => 'Recipe not found']);
    exit;
}

// Update fields if provided
$target = &$recipes[$index];

if (isset($input['title']))       $target['title']       = sanitize($input['title']);
if (isset($input['category']))    $target['category']    = sanitize($input['category']);
if (isset($input['prep']))        $target['prep']        = (int) $input['prep'];
if (isset($input['imageUrl']))    $target['imageUrl']    = sanitize($input['imageUrl']);
if (isset($input['favorite']))    $target['favorite']    = (bool) $input['favorite'];

if (isset($input['ingredients'])) {
    if (is_array($input['ingredients'])) {
        $target['ingredients'] = array_map('sanitize', $input['ingredients']);
    } else {
        $target['ingredients'] = array_filter(array_map('sanitize', explode("\n", $input['ingredients'])));
    }
}

if (isset($input['steps'])) {
    if (is_array($input['steps'])) {
        $target['steps'] = array_map('sanitize', $input['steps']);
    } else {
        $target['steps'] = array_filter(array_map('sanitize', explode("\n", $input['steps'])));
    }
}

$target['updated_at'] = date('Y-m-d H:i:s');

file_put_contents(DB_FILE, json_encode($recipes, JSON_PRETTY_PRINT));

echo json_encode(['success' => true, 'message' => 'Recipe updated successfully', 'recipe' => $target]);
?>
