// @ts-check
import { createNestjsConfig } from '@viztechstack/eslint-config/nestjs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default createNestjsConfig({
  tsconfigRootDir: import.meta.dirname ?? __dirname,
});
