// Vérifie que chaque fichier de contenu/ se lit sans erreur (frontmatter YAML et fichiers .yml).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
const fichiers = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? fichiers(join(d, f)) : [join(d, f)]);
let erreurs = 0;
for (const f of fichiers('contenu')) {
  const t = readFileSync(f, 'utf8');
  const y = f.endsWith('.yml') ? t : (t.match(/^---\n([\s\S]*?)\n---/) || [, ''])[1];
  const doc = YAML.parseDocument(y);
  if (doc.errors.length) { erreurs++; console.log('✗', f, doc.errors[0].message.split('\n')[0]); }
}
console.log(erreurs ? `${erreurs} fichier(s) à corriger` : '✓ Tous les contenus se lisent');
process.exit(erreurs ? 1 : 0);
