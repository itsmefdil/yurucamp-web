import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.resolve(__dirname, '../../backups');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

console.log(`Starting backup to ${backupFile}...`);

// Execute pg_dump
// Note: This requires pg_dump to be installed on the system
exec(`pg_dump "${dbUrl}" -F c -f "${backupFile}"`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        console.warn(`pg_dump stderr: ${stderr}`);
    }
    console.log(`Backup completed successfully: ${backupFile}`);
});
