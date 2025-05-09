// utils/generateEnvExample.js

import fs from 'fs';
import path from 'path';

/**
 * Reads one or more .env files, strips out values for any variables
 * that don't start with "PUBLIC_", comments them out, preserves comments
 * and blank lines, and writes the result to .env.example.
 *
 * @param {string[]} envFilePaths - Relative paths to .env files to process (e.g. ['.env', '.env.local'])
 * @param {string} [outputPath='.env.example'] - Path for the generated example file
 */
export function generateEnvExample(
  envFilePaths = ['../.env'],
  outputPath = '.env.example'
) {
  const outputLines = [];

  envFilePaths.forEach((relEnvPath, fileIdx) => {
    const absEnvPath = path.resolve(process.cwd(), relEnvPath);

    if (!fs.existsSync(absEnvPath)) {
      console.warn(`Skipping missing file: ${relEnvPath}`);
      return;
    }

    const content = fs.readFileSync(absEnvPath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line) => {
      const trimmed = line.trim();

      // 1) Preserve existing comments and blank lines as-is
      if (trimmed === '' || trimmed.startsWith('#')) {
        outputLines.push(line);
        return;
      }

      // 2) Parse KEY=VALUE (allowing dots, dashes, and underscores in the key)
      const match = line.match(/^([\w.-]+)\s*=(.*)$/);
      if (!match) {
        // Not a KEY=VALUE line? Preserve it.
        outputLines.push(line);
        return;
      }

      const [, key] = match;

      // 3) PUBLIC_ variables: keep them intact
      if (key.startsWith('PUBLIC_')) {
        outputLines.push(line);
      } else {
        // 4) Non-PUBLIC_ variables: comment out and drop the value
        outputLines.push(`# ${key}=`);
      }
    });

    // Add a blank line between different .env files (optional)
    if (fileIdx < envFilePaths.length - 1) {
      outputLines.push('');
    }
  });

  // Write to .env.example (overwrites if it already exists)
  fs.writeFileSync(path.resolve(process.cwd(), outputPath), outputLines.join('\n'));
  console.log(`✅ Generated ${outputPath}`);
}

// Example usage:
generateEnvExample(['.env']);
