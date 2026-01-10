---
description: Create a timestamped backup archive of the project
---

# Backup Project

Creates a timestamped ZIP archive of the project for safekeeping.

## Steps

### 1. Determine Backup Location
Default backup directory:
```powershell
$backupDir = "C:\Users\graci\.gemini\antigravity\backups"
New-Item -ItemType Directory -Path $backupDir -Force
```

### 2. Get Project Info
```powershell
$projectPath = "PROJECT_PATH"
$projectName = Split-Path $projectPath -Leaf
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "${projectName}_${timestamp}.zip"
```

### 3. Create Exclusion List
Exclude these from backup:
```
node_modules/
.git/
dist/
build/
.next/
.cache/
*.log
.env
.env.local
```

### 4. Create ZIP Archive

**PowerShell Method:**
```powershell
$exclude = @("node_modules", ".git", "dist", "build", ".next")
$source = $projectPath
$destination = Join-Path $backupDir $backupName

# Get files to include (excluding unwanted folders)
$files = Get-ChildItem -Path $source -Recurse | 
    Where-Object { 
        $path = $_.FullName
        -not ($exclude | Where-Object { $path -like "*\$_*" })
    }

Compress-Archive -Path $files.FullName -DestinationPath $destination -Force
```

**Simpler Method (includes more):**
```powershell
Compress-Archive -Path $projectPath -DestinationPath (Join-Path $backupDir $backupName)
```

### 5. Verify Backup
```powershell
$backup = Get-Item (Join-Path $backupDir $backupName)
Write-Host "Backup created: $($backup.Name)"
Write-Host "Size: $([math]::Round($backup.Length / 1MB, 2)) MB"
Write-Host "Location: $($backup.FullName)"
```

### 6. List Recent Backups
```powershell
Get-ChildItem $backupDir -Filter "${projectName}_*.zip" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 5 Name, @{N='Size(MB)';E={[math]::Round($_.Length/1MB,2)}}, LastWriteTime
```

## Restore from Backup
```powershell
$backupFile = "path\to\backup.zip"
$restorePath = "path\to\restore\location"

Expand-Archive -Path $backupFile -DestinationPath $restorePath -Force
```

## Cleanup Old Backups
Keep only last 5 backups:
```powershell
Get-ChildItem $backupDir -Filter "${projectName}_*.zip" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -Skip 5 | 
    Remove-Item -Force
```

## Quick Backup Command
For frequent use:
```powershell
# One-liner backup
$n = "project"; $d = "C:\backups"; Compress-Archive -Path . -DestinationPath "$d\${n}_$(Get-Date -f 'yyyyMMdd_HHmmss').zip"
```
