<?php
/**
 * CookCraft – save_recipe.php
 * Handles server-side saving of new recipes to a JSON flat-file database.
 * Called via POST from add-recipe.html (action="save_recipe.php").
 */

define('DB_FILE', __DIR__ . '/data/recipes.json');

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

function redirect(string $url): void {
    header("Location: $url");
    exit;
}

// ── Only handle POST ──────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('add-recipe.html');
}

// ── Collect & validate inputs ─────────────────────────────
$title       = sanitize($_POST['title']       ?? '');
$category    = sanitize($_POST['category']    ?? 'Dinner');
$prep        = (int) ($_POST['prep']          ?? 0);
$ingredients = sanitize($_POST['ingredients'] ?? '');
$steps       = sanitize($_POST['steps']       ?? '');
$imageUrl    = sanitize($_POST['imageUrl']    ?? '');

$errors = [];

if (empty($title))       $errors[] = 'Recipe name is required.';
if (empty($ingredients)) $errors[] = 'Ingredients are required.';
if (empty($steps))       $errors[] = 'Cooking steps are required.';

if (!empty($errors)) {
    // Pass errors back to the form via query string
    $errorMsg = urlencode(implode(' | ', $errors));
    redirect("add-recipe.html?error=$errorMsg");
}

// ── Build recipe object ───────────────────────────────────
$ingredientList = array_filter(array_map('trim', explode("\n", $ingredients)));
$stepList       = array_filter(array_map('trim', explode("\n", $steps)));

$newRecipe = [
    'id'          => time(),          // Unix timestamp as unique ID
    'title'       => $title,
    'category'    => $category,
    'prep'        => $prep,
    'imageUrl'    => $imageUrl,
    'ingredients' => array_values($ingredientList),
    'steps'       => array_values($stepList),
    'created_at'  => date('Y-m-d H:i:s'),
];

// ── Persist ───────────────────────────────────────────────
$recipes   = load_recipes();
$recipes[] = $newRecipe;
save_recipes($recipes);

// ── Redirect back to home with success flag ───────────────
redirect('index.html?saved=1');
?>
