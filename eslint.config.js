'use strict';

/**
 * ESLint v9 Flat Config
 * ─────────────────────────────────────────────────────────────────────────────
 * Docs:    https://eslint.org/docs/latest/use/configure/configuration-files
 * Rules:   https://eslint.org/docs/latest/rules
 *
 * Cấu trúc flat config là 1 array — mỗi phần tử là 1 config object
 * Thứ tự quan trọng: config sau override config trước
 *
 * Severity:
 *   'off'   | 0  → tắt rule
 *   'warn'  | 1  → warning (không fail build, chỉ báo)
 *   'error' | 2  → error   (fail build, CI/CD dừng lại)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const js = require('@eslint/js');

module.exports = [

  // ─── [1] Base: ESLint recommended rules ────────────────────────────────────
  // Bật toàn bộ rules được ESLint khuyên dùng làm nền tảng
  // Xem danh sách: https://eslint.org/docs/latest/rules (✓ = recommended)
  // js.configs.recommended,

  // ─── [2] Project config ─────────────────────────────────────────────────────
  {
    // Áp dụng cho tất cả file .js trong project
    // Glob pattern — có thể thu hẹp: ['src/**/*.js'] nếu chỉ muốn lint src/
    files: ['**/*.js'],

    // ── Language options ────────────────────────────────────────────────────
    languageOptions: {
      // ecmaVersion: phiên bản JS syntax được hỗ trợ
      // 2021 = ES12: hỗ trợ ??, ?., async/await, Promise.any, WeakRef...
      ecmaVersion: 2022,

      // sourceType: cách module được xử lý
      // 'commonjs' → dùng require/module.exports  (NodeJS mặc định)
      // 'module'   → dùng import/export           (ES Module)
      sourceType: 'commonjs',

      // globals: khai báo các biến global để ESLint không báo 'no-undef'
      // 'readonly'  → chỉ đọc, không được gán lại
      // 'writable'  → có thể gán lại
      globals: {

        // ── Node.js built-in globals ─────────────────────────────────────
        process:     'readonly',   // process.env, process.exit()...
        __dirname:   'readonly',   // đường dẫn thư mục hiện tại
        __filename:  'readonly',   // đường dẫn file hiện tại
        require:     'readonly',   // CommonJS require()
        module:      'writable',   // module.exports
        exports:     'writable',   // exports.xxx
        console:     'readonly',   // console.log, console.error...
        Buffer:      'readonly',   // Buffer.from(), Buffer.alloc()...
        setTimeout:  'readonly',
        setInterval: 'readonly',
        clearTimeout:'readonly',
        clearInterval:'readonly',
        URL:         'readonly',   // new URL()
        URLSearchParams: 'readonly',

        // ── Jest test globals ─────────────────────────────────────────────
        // Chỉ active khi chạy test, nhưng khai báo ở đây để không bị no-undef
        describe:    'readonly',   // test suite
        it:          'readonly',   // alias của test()
        test:        'readonly',   // test case
        expect:      'readonly',   // assertions
        beforeEach:  'readonly',   // chạy trước mỗi test
        afterEach:   'readonly',   // chạy sau mỗi test
        beforeAll:   'readonly',   // chạy 1 lần trước tất cả test
        afterAll:    'readonly',   // chạy 1 lần sau tất cả test
        jest:        'readonly',   // jest.fn(), jest.mock()...
      },
    },

    // ── Rules ───────────────────────────────────────────────────────────────
    rules: {

      // ════════════════════════════════════════════════════════════════════
      //  CODE QUALITY
      //  Phát hiện bug tiềm ẩn và code không cần thiết
      // ════════════════════════════════════════════════════════════════════

      // Cảnh báo biến/import khai báo nhưng không dùng
      // args: 'after-used' → bỏ qua arg nếu có arg phía sau được dùng
      // ignoreRestSiblings: true → bỏ qua khi dùng rest pattern { a, ...rest }
      // 'no-unused-vars': ['warn', {
      //   "vars": "all",
      //       "args": "after-used",
      //       "caughtErrors": "all",
      //       "ignoreRestSiblings": false,
      //       "ignoreUsingDeclarations": false,
      //       "reportUsedIgnorePattern": false
      // }],

      'no-console':    'off',     // BE cần console.log để log/debug — không tắt
      'no-debugger':   'error',   // không commit debugger vào code
      'no-unreachable':'error',   // code sau return/throw/break không bao giờ chạy
      'no-undef':      'error',   // dùng biến chưa khai báo → thường là typo


      // ════════════════════════════════════════════════════════════════════
      //  BEST PRACTICES
      //  Các pattern được khuyến nghị để code an toàn và dễ maintain
      // ════════════════════════════════════════════════════════════════════

      // Bắt buộc dùng === thay vì ==
      // == có type coercion: '0' == false → true (bất ngờ!)
      // === không coerce:   '0' === false → false (đúng)
      'eqeqeq': ['error', 'always'],

      // Cấm dùng var — dùng const/let thay thế
      // var có function scope và hoisting gây bug khó tìm
      'no-var': 'error',

      // Ưu tiên const khi biến không bị reassign
      // Giúp code dễ đọc hơn: thấy const = biết không thay đổi
      'prefer-const': ['error', {
        destructuring:          'any',    // const nếu bất kỳ variable nào không đổi
        ignoreReadBeforeAssign: true,     // bỏ qua pattern: let x; x = something;
      }],

      // Cảnh báo return await trong async function
      // async function tự wrap return value trong Promise
      // return await value = tạo Promise không cần thiết (trừ trong try/catch)
      'no-return-await': 'warn',

      // Cảnh báo async function không có await
      // Nếu không có await, không cần async — gây hiểu nhầm
      'require-await': 'warn',

      // Bắt buộc throw Error object, không throw string/number
      // throw 'error message'     ← sai, không có stack trace
      // throw new Error('message') ← đúng
      'no-throw-literal': 'error',

      // Cảnh báo khi biến inner scope trùng tên với outer scope
      // Gây nhầm lẫn khi đọc code — không biết đang dùng biến nào
      'no-shadow': 'warn',

      // Cảnh báo khi reassign parameter của function
      // props: false → cho phép sửa property: req.user = ..., obj.key = ...
      // Thường cần trong Express middleware
      'no-param-reassign': ['warn', { props: false }],


      // ════════════════════════════════════════════════════════════════════
      //  ASYNC / PROMISE
      //  Tránh các lỗi phổ biến với async/await và Promise
      // ════════════════════════════════════════════════════════════════════

      // Cấm dùng async trong new Promise() executor
      // new Promise(async (resolve, reject) => { ... }) ← sai
      // Lý do: lỗi trong async executor không bị catch bởi Promise
      'no-async-promise-executor': 'error',

      // Cấm return value trong Promise executor
      // new Promise((resolve) => { return something }) ← không có tác dụng
      'no-promise-executor-return': 'error',


      // ════════════════════════════════════════════════════════════════════
      //  STYLE
      //  Format cơ bản — phần còn lại để Prettier handle
      //  Chỉ enable rule mà Prettier không cover
      // ════════════════════════════════════════════════════════════════════

      // Bắt buộc dấu chấm phẩy cuối statement
      'semi': ['off', 'off'],

      // Bắt buộc single quote, ngoại trừ khi string chứa single quote
      // avoidEscape: true → "it's fine" thay vì 'it\'s fine'
      'quotes': ['error', 'single', { avoidEscape: true }],

      // Trailing comma ở dòng cuối multiline
      // Giúp git diff gọn hơn khi thêm item mới
      'comma-dangle': ['warn', 'always-multiline'],

      // Để Prettier handle indent — tắt rule này tránh conflict
      'indent': 'off',

      // Giới hạn độ dài dòng 120 ký tự
      // ignoreComments/Strings/Urls → không áp dụng cho comment và string dài
      'max-len': ['warn', {
        code:           120,
        ignoreUrls:     true,
        ignoreStrings:  true,
        ignoreComments: true,
        ignoreTemplateLiterals: true,
      }],
    },
  },

  // ─── [3] Ignore patterns ────────────────────────────────────────────────────
  // Files/folders không cần lint — thường là generated code hoặc vendor
  {
    ignores: [
      'node_modules/**',   // dependencies
      'dist/**',           // build output
      'build/**',          // build output
      'coverage/**',       // Jest coverage report
      '*.min.js',          // minified files
    ],
  },
];