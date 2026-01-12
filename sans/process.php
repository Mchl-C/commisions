<?php
$storageFile = 'messages.txt';
$uploadDir = 'Images/';

// Ensure upload directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// --- 1. HANDLING POST REQUESTS (Saving a Message) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $imagePath = '';

    // Handle Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $fileName = time() . '_' . basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $imagePath = $targetPath;
        }
    }

    // Prepare Data Object with 'zone' field
    $data = [
        'recipient' => htmlspecialchars($_POST['recipient'] ?? 'Anonymous'),
        'title'     => htmlspecialchars($_POST['title'] ?? 'No Title'),
        'message'   => htmlspecialchars($_POST['message'] ?? ''),
        'image'     => $imagePath,
        'zone'      => $_POST['zone'] ?? '1', // Identifies which map area this belongs to
        'date'      => date('Y-m-d H:i')
    ];

    // Save as a single line in the text file
    file_put_contents($storageFile, json_encode($data) . PHP_EOL, FILE_APPEND);
    exit;
}

// --- 2. HANDLING GET REQUESTS (Loading Bottles for a Specific Zone) ---
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $requestedZone = $_GET['zone'] ?? '1'; 
        $results = [];

        if (file_exists($storageFile)) {
            $lines = file($storageFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            // We must loop through ALL lines to find the ones for this zone
            foreach ($lines as $actualLineNumber => $lineContent) {
                $decoded = json_decode($lineContent, true);
                
                // Check if this specific line belongs to the zone the user is visiting
                if ($decoded && isset($decoded['zone']) && $decoded['zone'] == $requestedZone) {
                    // Attach the ACTUAL line number so view.php doesn't get confused
                    $decoded['original_id'] = $actualLineNumber; 
                    $results[] = $decoded;
                }
            }
        }

        header('Content-Type: application/json');
        // We reverse so newest bottles appear "on top" of the stack logic
        echo json_encode(array_reverse($results));
        exit;
    }
?>