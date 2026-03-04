// @ts-check
import { createNestjsConfig } from '@viztechstack/eslint-config/nestjs';

export default createNestjsConfig({
  tsconfigRootDir: import.meta.dirname,
});
