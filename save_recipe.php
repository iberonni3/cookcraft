<?php
/**
 * CookCraft – save_recipe.php
 * Handles server-side saving of new recipes to a JSON flat-file database.
 * Supports image URLs and local file uploads.
 */

define('DB_FILE', __DIR__ . '/data/recipes.json');
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// ── Helpers ──────────────────────────────────────────────
function load_recipes(): array {
    if (!file_exists(DB_FILE)) return [];
    $json = file_get_contents(DB_FILE);
    return json_decode($json, true) ?? [];
}

function save_recipes(array $recipes): void {
    if (!is_dir(dirname(DB_FILE))) {
        mkdir(dirname(DB_FILE), 0755, true);
    }
    file_put_contents(DB_FILE, json_encode($recipes, JSON_PRETTY_PRINT));
}

function sanitize(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function send_response($status, $message, $extra = []) {
    $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    
    if ($isAjax || isset($_GET['ajax'])) {
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode(array_merge(['message' => $message], $extra));
        exit;
    } else {
        if ($status >= 400) {
            header("Location: add-recipe.html?error=" . urlencode($message));
        } else {
            header("Location: index.html?saved=1");
        }
        exit;
    }
}

// ── Only handle POST ──────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response(405, 'Method not allowed');
}

// ── Collect & validate inputs ─────────────────────────────
$title       = sanitize($_POST['title']       ?? '');
$category    = sanitize($_POST['category']    ?? 'Dinner');
$prep        = (int) ($_POST['prep']          ?? 0);
$ingredients = $_POST['ingredients']          ?? '';
$steps       = $_POST['steps']                ?? '';
$imageUrl    = sanitize($_POST['imageUrl']    ?? '');
$favorite    = isset($_POST['favorite']) && ($_POST['favorite'] === 'true' || $_POST['favorite'] === '1');

if (empty($title) || empty($ingredients) || empty($steps)) {
    send_response(400, 'Please fill in all required fields (Name, Ingredients, Steps).');
}

// ── Handle Image Upload ───────────────────────────────────
if (!empty($_FILES['imageFile']['name'])) {
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    
    $fileInfo = pathinfo($_FILES['imageFile']['name']);
    $extension = strtolower($fileInfo['extension']);
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (in_array($extension, $allowed)) {
        $newName = 'recipe_' . time() . '_' . uniqid() . '.' . $extension;
        $targetPath = UPLOAD_DIR . $newName;
        
        if (move_uploaded_file($_FILES['imageFile']['tmp_name'], $targetPath)) {
            $imageUrl = 'uploads/' . $newName;
        }
    }
}

// ── Build recipe object ───────────────────────────────────
$ingredientList = array_filter(array_map('sanitize', array_map('trim', explode("\n", $ingredients))));
$stepList       = array_filter(array_map('sanitize', array_map('trim', explode("\n", $steps))));

$newRecipe = [
    'id'          => time(),
    'title'       => $title,
    'category'    => $category,
    'prep'        => $prep,
    'imageUrl'    => $imageUrl,
    'ingredients' => array_values($ingredientList),
    'steps'       => array_values($stepList),
    'favorite'    => $favorite,
    'created_at'  => date('Y-m-d H:i:s'),
];

// ── Persist ───────────────────────────────────────────────
$recipes   = load_recipes();
$recipes[] = $newRecipe;
save_recipes($recipes);

send_response(200, 'Recipe saved successfully!', ['recipe' => $newRecipe]);
?>
