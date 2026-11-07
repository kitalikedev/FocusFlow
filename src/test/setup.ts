import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// CI runners and a busy laptop can be slow; waitFor / findBy should not fail on timing alone.
configure({ asyncUtilTimeout: 4000 });
