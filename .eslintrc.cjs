// .eslintrc.cjs
// Yêu cầu: eslint@^8.57.0, @typescript-eslint/parser@^7.0.0
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', 'coverage'],
  rules: {
    // Luật toàn cục: Cấm khởi tạo Supabase Client ngoài src/shared/lib/supabase.ts
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@supabase/supabase-js',
            importNames: ['createClient'],
            message: 'Chỉ được khởi tạo Supabase Client duy nhất tại src/shared/lib/supabase.ts.',
          },
        ],
      },
    ],
  },
  overrides: [
    // 1. Quy tắc cho src/app/**: Được import feature nhưng CHỈ qua public API index.ts
    {
      files: ['src/app/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@supabase/supabase-js',
                importNames: ['createClient'],
                message: 'Chỉ được khởi tạo Supabase Client duy nhất tại src/shared/lib/supabase.ts.',
              },
            ],
            patterns: [
              {
                group: ['@/features/*/*'],
                message: 'src/app/** chỉ được import feature qua public API (@/features/<tên>), cấm deep import.',
              },
            ],
          },
        ],
      },
    },

    // 2. Quy tắc cho từng feature: CẤM import chéo sang feature khác, CẤM deep import mọi feature
    {
      files: ['src/features/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@supabase/supabase-js',
                importNames: ['createClient'],
                message: 'Chỉ được khởi tạo Supabase Client duy nhất tại src/shared/lib/supabase.ts.',
              },
            ],
            patterns: [
              {
                group: ['@/features/*'],
                message: 'Các feature không được import chéo lẫn nhau. Hãy sử dụng core/ hoặc contracts.ts.',
              },
              {
                group: ['@/features/*/*'],
                message: 'Cấm deep import vào nội bộ bất kỳ feature nào.',
              },
              {
                group: ['@/app/*'],
                message: 'Feature không được import ngược lên tầng Application (@/app/*).',
              },
            ],
          },
        ],
      },
    },

    // 3. Quy tắc cho src/core/** và src/shared/**: CẤM import từ @/features/* và @/app/*
    {
      files: ['src/core/**', 'src/shared/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@supabase/supabase-js',
                importNames: ['createClient'],
                message: 'Chỉ được khởi tạo Supabase Client duy nhất tại src/shared/lib/supabase.ts.',
              },
            ],
            patterns: [
              {
                group: ['@/features', '@/features/*'],
                message: 'Tầng core và shared cấm import từ @/features/* để triệt tiêu phụ thuộc vòng.',
              },
              {
                group: ['@/app', '@/app/*'],
                message: 'Tầng core và shared cấm import từ @/app/*.',
              },
            ],
          },
        ],
      },
    },

    // 4. Ngoại lệ duy nhất cho phép gọi createClient (đặt ở cuối mảng để ghi đè khối src/shared/** phía trước)
    {
      files: ['src/shared/lib/supabase.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};
