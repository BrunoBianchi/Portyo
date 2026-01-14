
$path = "c:\Users\bruno\Desktop\portyo\frontend\app\routes\dashboard-editor.tsx"
$content = Get-Content $path -Raw
$content = "import { Eye, X } from 'lucide-react';`r`n" + $content
$content | Set-Content $path -Encoding UTF8
