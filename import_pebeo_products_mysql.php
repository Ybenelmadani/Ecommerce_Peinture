<?php
declare(strict_types=1);

/**
 * Import Pebeo products JSON into MySQL tables:
 * - brands
 * - categories (supports parent/child category paths)
 * - products
 * - product_variants (upsert by SKU)
 * - product_images (replace per product)
 *
 * Usage:
 *   php import_pebeo_products_mysql.php
 *   php import_pebeo_products_mysql.php --json=pebeo_products_from_site.json --env=..\ECOMERCE_BACK-END\.env
 */

function parseArgs(array $argv): array
{
    $args = [
        'json' => __DIR__ . DIRECTORY_SEPARATOR . 'pebeo_products_from_site.json',
        'env' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'ECOMERCE_BACK-END' . DIRECTORY_SEPARATOR . '.env',
    ];

    foreach ($argv as $arg) {
        if (!str_starts_with($arg, '--')) {
            continue;
        }
        $pair = explode('=', substr($arg, 2), 2);
        if (count($pair) !== 2) {
            continue;
        }
        [$key, $value] = $pair;
        if (array_key_exists($key, $args)) {
            $args[$key] = $value;
        }
    }

    return $args;
}

function loadEnvFile(string $path): array
{
    if (!is_file($path)) {
        throw new RuntimeException("Env file not found: {$path}");
    }

    $env = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        throw new RuntimeException("Unable to read env file: {$path}");
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }
        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $value = trim($value, "\"'");
        $env[$key] = $value;
    }

    return $env;
}

function normalizeText(?string $value): string
{
    if ($value === null) {
        return '';
    }
    $value = trim($value);
    if ($value === '') {
        return '';
    }
    return preg_replace('/\s+/u', ' ', $value) ?? $value;
}

function normalizeImagePath(string $url): string
{
    $url = trim($url);
    if ($url === '') {
        return '';
    }
    // product_images.image_path is varchar(255)
    if (strlen($url) > 255) {
        return substr($url, 0, 255);
    }
    return $url;
}

function priceFromItem(array $item): float
{
    $candidates = [
        (string)($item['sale_price'] ?? ''),
        (string)($item['regular_price'] ?? ''),
        (string)($item['price'] ?? ''),
    ];

    foreach ($candidates as $raw) {
        $raw = trim($raw);
        if ($raw === '') {
            continue;
        }
        $raw = str_replace(',', '.', $raw);
        if (!is_numeric($raw)) {
            continue;
        }
        if (str_contains($raw, '.')) {
            return round((float)$raw, 2);
        }
        // Source data appears to be integer minor units (ex: 1272 => 12.72)
        return round(((float)$raw) / 100.0, 2);
    }

    return 0.0;
}

function stockFromItem(array $item): int
{
    $inStock = (bool)($item['is_in_stock'] ?? false);
    return $inStock ? 100 : 0;
}

function descriptionFromItem(array $item): ?string
{
    $description = normalizeText((string)($item['description'] ?? ''));
    $short = normalizeText((string)($item['short_description'] ?? ''));
    $link = normalizeText((string)($item['permalink'] ?? ''));

    $parts = [];
    if ($short !== '') {
        $parts[] = $short;
    }
    if ($description !== '' && $description !== $short) {
        $parts[] = $description;
    }
    if ($link !== '') {
        $parts[] = "Source: {$link}";
    }

    if (empty($parts)) {
        return null;
    }
    return implode("\n\n", $parts);
}

function detectColor(string $source): ?string
{
    $text = mb_strtolower($source, 'UTF-8');
    $map = [
        'Magenta' => ['magenta', 'fuchsia'],
        'Cyan' => ['cyan', 'turquoise'],
        'Purple' => ['violet', 'purple', 'mauve'],
        'Blue' => ['bleu', 'blue', 'azur', 'ultramarine'],
        'Green' => ['vert', 'green', 'olive', 'sap'],
        'Yellow' => ['jaune', 'yellow', 'ocre', 'ochre'],
        'Orange' => ['orange', 'mandarine'],
        'Pink' => ['rose', 'pink'],
        'Red' => ['rouge', 'red', 'crimson', 'carmin'],
        'Brown' => ['brun', 'brown', 'marron', 'umber', 'sienna', 'terre'],
        'Grey' => ['gris', 'grey', 'gray', 'payne'],
        'Black' => ['noir', 'black', 'ivory black'],
        'White' => ['blanc', 'white', 'titanium white', 'zinc white'],
        'Gold' => ['or ', 'gold', 'dor', 'dore'],
        'Silver' => ['argent', 'silver', 'etain', 'tin'],
        'Copper' => ['cuivre', 'copper'],
    ];

    foreach ($map as $color => $keywords) {
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return $color;
            }
        }
    }

    return null;
}

function getOrCreateBrandId(PDO $pdo, string $brandName): int
{
    $select = $pdo->prepare("SELECT id FROM brands WHERE LOWER(name) = LOWER(?) LIMIT 1");
    $select->execute([$brandName]);
    $found = $select->fetchColumn();
    if ($found !== false) {
        return (int)$found;
    }

    $insert = $pdo->prepare("INSERT INTO brands (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
    $insert->execute([$brandName, 'Imported from pebeo_products_from_site.json']);
    return (int)$pdo->lastInsertId();
}

function getFallbackCategoryId(PDO $pdo): int
{
    $id = $pdo->query("SELECT id FROM categories ORDER BY id ASC LIMIT 1")->fetchColumn();
    if ($id !== false) {
        return (int)$id;
    }

    $insert = $pdo->prepare("INSERT INTO categories (name, description, parent_id, created_at, updated_at) VALUES (?, ?, NULL, NOW(), NOW())");
    $insert->execute(['Imported', 'Fallback imported category']);
    return (int)$pdo->lastInsertId();
}

function getOrCreateCategoryId(PDO $pdo, string $name, ?int $parentId): array
{
    static $cache = [];
    $cacheKey = strtolower($name) . '|' . ($parentId === null ? 'null' : (string)$parentId);
    if (isset($cache[$cacheKey])) {
        return ['id' => $cache[$cacheKey], 'created' => false];
    }

    if ($parentId === null) {
        $select = $pdo->prepare("SELECT id FROM categories WHERE name = ? AND parent_id IS NULL LIMIT 1");
        $select->execute([$name]);
    } else {
        $select = $pdo->prepare("SELECT id FROM categories WHERE name = ? AND parent_id = ? LIMIT 1");
        $select->execute([$name, $parentId]);
    }
    $existing = $select->fetchColumn();
    if ($existing !== false) {
        $cache[$cacheKey] = (int)$existing;
        return ['id' => (int)$existing, 'created' => false];
    }

    if ($parentId === null) {
        $insert = $pdo->prepare("INSERT INTO categories (name, description, parent_id, created_at, updated_at) VALUES (?, ?, NULL, NOW(), NOW())");
        $insert->execute([$name, 'Imported category from Pebeo feed']);
    } else {
        $insert = $pdo->prepare("INSERT INTO categories (name, description, parent_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
        $insert->execute([$name, 'Imported category from Pebeo feed', $parentId]);
    }
    $newId = (int)$pdo->lastInsertId();
    $cache[$cacheKey] = $newId;
    return ['id' => $newId, 'created' => true];
}

function runImport(string $jsonPath, string $envPath): void
{
    if (!is_file($jsonPath)) {
        throw new RuntimeException("JSON file not found: {$jsonPath}");
    }

    $raw = file_get_contents($jsonPath);
    if ($raw === false) {
        throw new RuntimeException("Unable to read JSON file: {$jsonPath}");
    }

    $products = json_decode($raw, true);
    if (!is_array($products)) {
        throw new RuntimeException("Invalid JSON format in: {$jsonPath}");
    }

    $env = loadEnvFile($envPath);
    $host = $env['DB_HOST'] ?? '127.0.0.1';
    $port = $env['DB_PORT'] ?? '3306';
    $db = $env['DB_DATABASE'] ?? '';
    $user = $env['DB_USERNAME'] ?? '';
    $pass = $env['DB_PASSWORD'] ?? '';
    if ($db === '' || $user === '') {
        throw new RuntimeException('Missing DB settings in .env (DB_DATABASE/DB_USERNAME).');
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $brandId = getOrCreateBrandId($pdo, 'Pebeo');
    $fallbackCategoryId = getFallbackCategoryId($pdo);

    $findVariant = $pdo->prepare("SELECT id, product_id FROM product_variants WHERE sku = ? LIMIT 1");
    $insertProduct = $pdo->prepare(
        "INSERT INTO products (name, description, status, category_id, brand_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())"
    );
    $updateProduct = $pdo->prepare(
        "UPDATE products
         SET name = ?, description = ?, status = ?, category_id = ?, brand_id = ?, updated_at = NOW()
         WHERE id = ?"
    );
    $insertVariant = $pdo->prepare(
        "INSERT INTO product_variants (product_id, color, finish, capacity, barcode, price, stock, sku, created_at, updated_at)
         VALUES (?, ?, NULL, NULL, NULL, ?, ?, ?, NOW(), NOW())"
    );
    $updateVariant = $pdo->prepare(
        "UPDATE product_variants
         SET color = ?, price = ?, stock = ?, updated_at = NOW()
         WHERE id = ?"
    );
    $deleteImages = $pdo->prepare("DELETE FROM product_images WHERE product_id = ?");
    $insertImage = $pdo->prepare(
        "INSERT INTO product_images (product_id, image_path, is_main, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())"
    );

    $stats = [
        'total_json_rows' => count($products),
        'products_inserted' => 0,
        'products_updated' => 0,
        'variants_inserted' => 0,
        'variants_updated' => 0,
        'categories_created' => 0,
        'images_inserted' => 0,
        'rows_skipped' => 0,
    ];

    $pdo->beginTransaction();
    try {
        foreach ($products as $item) {
            if (!is_array($item)) {
                $stats['rows_skipped']++;
                continue;
            }

            $sku = normalizeText((string)($item['sku'] ?? ''));
            if ($sku === '') {
                $idFallback = normalizeText((string)($item['id'] ?? ''));
                $sku = $idFallback !== '' ? "PEBEO-{$idFallback}" : '';
            }
            if ($sku === '') {
                $stats['rows_skipped']++;
                continue;
            }

            $name = normalizeText((string)($item['name'] ?? ''));
            if ($name === '') {
                $name = $sku;
            }

            $categoryId = $fallbackCategoryId;
            $categoryPath = $item['categories'] ?? [];
            if (is_array($categoryPath) && !empty($categoryPath)) {
                $parentId = null;
                foreach ($categoryPath as $cat) {
                    if (!is_array($cat)) {
                        continue;
                    }
                    $catName = normalizeText((string)($cat['name'] ?? ''));
                    if ($catName === '') {
                        continue;
                    }
                    $catResult = getOrCreateCategoryId($pdo, $catName, $parentId);
                    $categoryId = $catResult['id'];
                    if ($catResult['created']) {
                        $stats['categories_created']++;
                    }
                    $parentId = $categoryId;
                }
            }

            $description = descriptionFromItem($item);
            $variantColor = detectColor($name . ' ' . $sku . ' ' . (string)($item['description'] ?? ''));
            $status = (bool)($item['is_in_stock'] ?? true) ? 1 : 0;
            $price = priceFromItem($item);
            $stock = stockFromItem($item);

            $findVariant->execute([$sku]);
            $variant = $findVariant->fetch();
            if ($variant !== false) {
                $productId = (int)$variant['product_id'];
                $variantId = (int)$variant['id'];

                $updateProduct->execute([$name, $description, $status, $categoryId, $brandId, $productId]);
                $updateVariant->execute([$variantColor, $price, $stock, $variantId]);

                $stats['products_updated']++;
                $stats['variants_updated']++;
            } else {
                $insertProduct->execute([$name, $description, $status, $categoryId, $brandId]);
                $productId = (int)$pdo->lastInsertId();

                $insertVariant->execute([$productId, $variantColor, $price, $stock, $sku]);

                $stats['products_inserted']++;
                $stats['variants_inserted']++;
            }

            $imageUrls = [];
            $mainImage = normalizeText((string)($item['image'] ?? ''));
            if ($mainImage !== '') {
                $imageUrls[] = $mainImage;
            }
            $images = $item['images'] ?? [];
            if (is_array($images)) {
                foreach ($images as $img) {
                    $img = normalizeText((string)$img);
                    if ($img !== '') {
                        $imageUrls[] = $img;
                    }
                }
            }
            $imageUrls = array_values(array_unique($imageUrls));

            if (!empty($imageUrls)) {
                $deleteImages->execute([$productId]);
                foreach ($imageUrls as $idx => $img) {
                    $path = normalizeImagePath($img);
                    if ($path === '') {
                        continue;
                    }
                    $insertImage->execute([$productId, $path, $idx === 0 ? 1 : 0]);
                    $stats['images_inserted']++;
                }
            }
        }

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    echo "Import completed.\n";
    foreach ($stats as $k => $v) {
        echo "{$k}: {$v}\n";
    }
}

try {
    $args = parseArgs($argv ?? []);
    runImport($args['json'], $args['env']);
} catch (Throwable $e) {
    fwrite(STDERR, "ERROR: " . $e->getMessage() . PHP_EOL);
    exit(1);
}
