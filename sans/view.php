<?php
$storageFile = 'messages.txt';

$data = [
    'recipient' => 'Anonymous',
    'title'     => 'Empty Bottle',
    'message'   => 'The bottle was empty...',
    'image'     => ''
];

if (isset($_GET['id'])) {
    $id = (int)$_GET['id']; // This is the 'original_id' (line number)
    if (file_exists($storageFile)) {
        $lines = file($storageFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        // REMOVED array_reverse here. 
        // We go straight to the line number provided.
        if (isset($lines[$id])) {
            $decoded = json_decode($lines[$id], true);
            if ($decoded) { $data = $decoded; }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A Secret Message</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* --- FONT REGISTRATION --- */
        @font-face { font-family: 'SourceSerif'; src: url('fonts/source-serif-pro.bold.otf'); font-weight: bold; }
        @font-face { font-family: 'Italianno'; src: url('fonts/Italianno-Regular.ttf'); font-weight: normal; }
        @font-face { font-family: 'Nunito'; src: url('fonts/Nunito-Light.ttf'); font-weight: 300; }

        body {
            background-color: #2b3e50; /* Matches your sea/map background */
            margin: 0;
            padding: 20px;
        }

        .letter-container {
            /* Using your new letter.png as the background */
            background: url('assets/letter.png') no-repeat center top;
            background-size: 100% 100%;
            width: 100%;
            max-width: 900px; /* Slightly wider for the side-by-side layout */
            height: 600px;    /* Adjusted for the letter.png aspect ratio */
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 60px 80px; /* Adjusted to keep text inside the paper edges */
            box-sizing: border-box;
            margin: 40px auto;
        }

        .letter-content {
            width: 90%;
            height: 75%;
            display: flex;
            flex-direction: column;
            color: #4a443c;
            margin-top: 10%;
        }

        .letter-recipient {
            font-family: 'Nunito', sans-serif;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            opacity: 0.6;
            margin-bottom: 20px;
        }

        /* --- THE NEW GRID LAYOUT --- */
        .message-scroll-box {
            display: grid;
            grid-template-columns: 1fr auto; /* Title on left, Image on right */
            grid-template-areas: 
                "title image"
                "body  body";
            gap: 20px;
            overflow-y: auto;
            padding-right: 15px;
        }

        .letter-title {
            grid-area: title;
            font-family: 'Italianno', serif;
            font-size: 3rem;
            margin: 0;
            align-self: start;
        }

        .letter-image-wrapper {
            grid-area: image;
        }

        .letter-image {
            max-width: 250px; /* Fixed size for top-right placement */
            height: auto;
            border-radius: 4px;
            border: 5px solid white;
            box-shadow: 2px 4px 10px rgba(0,0,0,0.1);
            transform: rotate(2deg); /* Slightly skewed for a "dropped on paper" look */
        }

        .letter-body {
            grid-area: body;
            font-family: 'Italianno', cursive;
            font-size: 2.2rem;
            line-height: 1.3;
            margin-top: 10px;
        }

        .back-link {
            display: block;
            text-align: center;
            margin-top: -20px;
            text-decoration: none;
            font-family: 'Nunito', sans-serif;
            color: #f4e4bc;
            font-weight: bold;
            transition: color 0.3s;
        }

        .back-link:hover { color: #ffffff; }

        /* Custom scrollbar */
        .message-scroll-box::-webkit-scrollbar { width: 6px; }
        .message-scroll-box::-webkit-scrollbar-thumb { background-color: #a4917d; border-radius: 10px; }
    </style>

    <body>

        <div class="letter-container">
            <div class="letter-content">
                <div class="letter-recipient">From: <?php echo htmlspecialchars_decode($data['recipient']); ?></div>

                <div class="message-scroll-box">

                    <h2 class="letter-title"><?php echo htmlspecialchars_decode($data['title']); ?></h2>
                    
                    <?php if (!empty($data['image'])): ?>
                        <div class="letter-image-wrapper">
                            <img src="<?php echo $data['image']; ?>" class="letter-image" alt="Attached Image">
                        </div>
                    <?php endif; ?>
                    
                    <div class="letter-body">
                        <?php echo nl2br(htmlspecialchars_decode($data['message'])); ?>
                    </div>
                </div>
            </div>
        </div>

        <a href="index.html?mode=ocean" class="back-link">← Return to Ocean</a>

    </body>
</html>