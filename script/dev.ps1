$ErrorActionPreference = "Stop"

if (!(Test-Path ".env")) {
  throw ".env not found. Copy .env.example to .env and set DATABASE_URL."
}

function Import-DotEnv {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    if ($line -match "^\s*([^=]+?)\s*=\s*(.*)\s*$") {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim()

      if (
        ($value.StartsWith("'") -and $value.EndsWith("'")) -or
        ($value.StartsWith('"') -and $value.EndsWith('"'))
      ) {
        $value = $value.Substring(1, $value.Length - 2)
      }

      Set-Item -Path "env:$name" -Value $value
    }
  }
}

Import-DotEnv ".env"

if (-not $env:DATABASE_URL) {
  throw "DATABASE_URL must be set in .env."
}

if (!(Test-Path "node_modules")) {
  npm install
}

docker compose up -d

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  docker compose exec -T db pg_isready -U stackdoku 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $ready) {
  throw "Database did not become ready in time."
}

npm run db:push
npm run dev
