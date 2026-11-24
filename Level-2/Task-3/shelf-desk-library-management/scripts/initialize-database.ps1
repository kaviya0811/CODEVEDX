[CmdletBinding()]
param(
    [string]$SchemaFile = (Join-Path $PSScriptRoot '..\database\schema.sql'),
    [string]$MysqlExe = ''
)

$ErrorActionPreference = 'Stop'

function Find-MysqlExe {
    if ($MysqlExe -and (Test-Path $MysqlExe)) { return (Resolve-Path $MysqlExe).Path }
    $fromPath = Get-Command mysql.exe -ErrorAction SilentlyContinue
    if ($fromPath) { return $fromPath.Source }
    $common = @(
        "$env:ProgramFiles\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "${env:ProgramFiles(x86)}\MySQL\MySQL Server 8.0\bin\mysql.exe"
    ) | Where-Object { $_ -and (Test-Path $_) }
    if ($common.Count -gt 0) { return $common[0] }
    throw 'mysql.exe was not found. Add the MySQL Server 8.0 bin folder to PATH or pass -MysqlExe.'
}

$mysql = Find-MysqlExe
$schema = (Resolve-Path $SchemaFile).Path
$securePassword = Read-Host 'Enter your existing MySQL root password (input is hidden)' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = $null
$tempOptionFile = Join-Path $env:TEMP ("shelf-desk-mysql-{0}.cnf" -f ([guid]::NewGuid().ToString('N')))
try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    @"
[client]
user=root
password=$password
host=localhost
port=3306
"@ | Set-Content -LiteralPath $tempOptionFile -Encoding ascii -NoNewline
    & $mysql "--defaults-extra-file=$tempOptionFile" --force < $schema
    if ($LASTEXITCODE -ne 0) { throw "MySQL schema initialization failed with exit code $LASTEXITCODE." }
    Write-Host 'Database initialization completed.' -ForegroundColor Green
}
finally {
    if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    Remove-Item -LiteralPath $tempOptionFile -Force -ErrorAction SilentlyContinue
    $password = $null
}
