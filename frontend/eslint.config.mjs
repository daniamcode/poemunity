import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'
import { fixupConfigRules } from '@eslint/compat'

export default [
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']
    },
    {
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } }
    },
    {
        languageOptions: { globals: globals.browser }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...fixupConfigRules(pluginReactConfig),
    {
        rules: {
            // Common rules
            'accessor-pairs': 2, // enforce getter and setter pairs in objects
            'arrow-parens': 'off', // remove parentheses around arrow function arguments
            'arrow-spacing': [
                2,
                {
                // enforce consistent spacing before and after the arrow in arrow functions
                    'after': true,
                    'before': true
                }
            ],
            'block-spacing': [2, 'always'], // enforce consistent spacing inside single-line blocks
            'brace-style': [2, 'stroustrup'], // enforce consistent brace style for blocks
            'comma-dangle': [2, 'never'], // require or disallow trailing commas
            'comma-spacing': [
                2,
                {
                    'after': true,
                    'before': false
                }
            ], // enforce consistent spacing before and after commas
            'comma-style': [2, 'last'], // enforce consistent comma style
            'constructor-super': 2, // require super() calls in constructors
            'curly': [2, 'all'], // enforce consistent brace style for all control statements
            'dot-location': [2, 'property'], // enforce consistent newlines before and after dots
            'eol-last': 2, // enforce at least one newline at the end of files
            'eqeqeq': [2, 'allow-null'], // require the use of === and !==
            'func-call-spacing': 2, // disallow spacing between function identifiers and their applications
            'generator-star-spacing': [
                2,
                {
                // enforce consistent spacing around * operators in generator functions
                    'after': true,
                    'before': true
                }
            ],
            'indent': [2, 4], // enforce consistent indentation
            'key-spacing': [
                2,
                {
                // enforce consistent spacing between keys and values in object literal properties
                    'afterColon': true,
                    'beforeColon': false
                }
            ],
            'keyword-spacing': [
                2,
                {
                // enforce consistent spacing before and after keywords
                    'after': true,
                    'before': true
                }
            ],

            'linebreak-style': [2, 'unix'], // enforce consistent linebreak style
            'max-len': [
                2,
                {
                // Max. line length 120 characters
                    'code': 120,
                    'ignorePattern': '^import.*',
                    'ignoreUrls': true,
                    'tabWidth': 4
                }
            ],
            'max-lines': [
                2,
                {
                // enforce max file length
                    'max': 300,
                    'skipBlankLines': true,
                    'skipComments': true
                }
            ],
            'max-nested-callbacks': [1, 5], // set Maximum Depth of Nested Callbacks
            'max-params': [1, 5], // set Maximum number for parameters in a function
            'max-statements-per-line': [1, { 'max': 1 }], // enforce 1 statement per line
            'multiline-ternary': [2, 'always-multiline'], // enforce or disallow newlines between operands of ternary expressions
            'new-cap': [
                2,
                {
                // require constructor function names to begin with a capital letter
                    'capIsNew': false,
                    'newIsCap': true
                }
            ],
            'new-parens': 2, // require parentheses when invoking a constructor with no arguments
            'no-array-constructor': 2, // disallow Array constructors
            'no-caller': 2, // disallow the use of arguments.caller or arguments.callee
            'no-class-assign': 2, // disallow reassigning class members
            'no-cond-assign': 2, // disallow assignment operators in conditional expressions
            'no-console': [
                2,
                {
                // disallow the use of console
                    'allow': ['error', 'warn', 'info']
                }
            ],
            'no-const-assign': 2, // disallow reassigning const variables
            'no-control-regex': 2, // disallow control characters in regular expressions
            'no-debugger': 2, // disallow the use of debugger
            'no-delete-var': 2, // disallow deleting variables
            'no-dupe-args': 2, // disallow duplicate arguments in function definitions
            'no-dupe-class-members': 2, // disallow duplicate class members
            'no-dupe-keys': 2, // disallow duplicate keys in object literals
            'no-duplicate-case': 2, // disallow duplicate case labels
            'no-empty-character-class': 2, // disallow empty character classes in regular expressions
            'no-empty-pattern': 2, // disallow empty destructuring patterns
            'no-eval': 2, // disallow the use of eval()
            'no-ex-assign': 2, // disallow reassigning exceptions in catch clauses
            'no-extend-native': 2, // disallow extending native types
            'no-extra-bind': 2, // disallow unnecessary calls to .bind()
            'no-extra-parens': [2, 'functions'], // disallow unnecessary parentheses
            'no-fallthrough': 2, // disallow fallthrough of case statements
            'no-floating-decimal': 2, // disallow leading or trailing decimal points in numeric literals
            'no-func-assign': 2, // disallow reassigning function declarations
            'no-implied-eval': 2, // disallow the use of eval()-like methods
            'no-inner-declarations': [2, 'functions'], // disallow function or var declarations in nested blocks
            'no-invalid-regexp': 2, // disallow invalid regular expression strings in RegExp constructors
            'no-irregular-whitespace': 2, // disallow irregular whitespace outside of strings and comments
            'no-iterator': 2, // disallow the use of the __iterator__ property
            'no-label-var': 2, // disallow labels that share a name with a variable
            'no-lone-blocks': 2, // disallow unnecessary nested blocks
            'no-mixed-spaces-and-tabs': 2, // disallow mixed spaces and tabs for indentation
            'no-multi-spaces': 2, // disallow multiple spaces
            'no-multi-str': 2, // disallow multiline strings
            'no-multiple-empty-lines': [2, { 'max': 1 }], // disallow multiple empty lines
            'no-nested-ternary': 2, // Disallow nested ternaries
            'no-new': 2, // disallow new operators outside of assignments or comparisons
            'no-new-func': 2, // disallow new operators with the Function object
            'no-new-object': 2, // disallow Object constructors
            'no-new-symbol': 2, // disallow new operators with the Symbol object
            'no-new-wrappers': 2, // disallow new operators with the String, Number, and Boolean objects
            'no-obj-calls': 2, // disallow calling global object properties as functions
            'no-octal': 2, // disallow octal literals
            'no-octal-escape': 2, // disallow octal escape sequences in string literals
            'no-proto': 2, // disallow the use of the __proto__ property
            'no-redeclare': 2, // disallow var redeclaration
            'no-regex-spaces': 2, // disallow multiple spaces in regular expression literals
            'no-return-assign': [2, 'except-parens'], // disallow assignment operators in return statements
            'no-self-assign': 2, // disallow assignments where both sides are exactly the same
            'no-self-compare': 2, // disallow comparisons where both sides are exactly the same
            'no-sequences': 2, // disallow comma operators
            'no-shadow-restricted-names': 2, // disallow identifiers from shadowing restricted names
            'no-sparse-arrays': 2, // disallow sparse arrays
            'no-this-before-super': 2, // disallow this/super before calling super() in constructors
            'no-throw-literal': 2, // disallow throwing literals as exceptions
            'no-trailing-spaces': 2, // disallow trailing whitespace at the end of lines
            'no-undef': 2, // disallow the use of undeclared variables unless mentioned in /*global */ comments
            'no-undef-init': 2, // disallow initializing variables to undefined
            'no-unexpected-multiline': 2, // disallow confusing multiline expressions
            'no-unneeded-ternary': [2, { 'defaultAssignment': false }], // disallow ternary operators when simpler alternatives exist
            'no-unreachable': 2, // disallow unreachable code after return, throw, continue, and break statements
            'no-unused-vars': [
                2,
                {
                // disallow unused variables
                    'args': 'none',
                    'vars': 'all'
                }
            ],
            'no-use-before-define': ['error', 'nofunc'], // enforce variables to be defined before using them
            'no-useless-call': 2, // disallow unnecessary calls to .call() and .apply()
            'no-useless-constructor': 2, // disallow unnecessary constructors
            'no-var': 2, // disallow use of var
            'no-with': 2, // disallow with statements
            'object-curly-spacing': [2, 'always'], // enforce spaces at the start and end of each object
            'one-var': [2, { 'initialized': 'never' }], // enforce variables to be declared either together or separately in functions
            'operator-linebreak': [
                2,
                'after',
                {
                // enforce consistent linebreak style for operators
                    'overrides': {
                        ':': 'before',
                        '?': 'before'
                    }
                }
            ],
            'padded-blocks': [2, 'never'], // require or disallow padding within blocks
            'prefer-const': [2], // enforce use of const
            'quotes': [2, 'single', { 'allowTemplateLiterals': true, 'avoidEscape': false }], // enforce the consistent use of either backticks, double, or single quotes - aligned with Prettier ESLint plugin config
            'semi': [2, 'never'], // require or disallow semicolons instead of ASI
            'semi-spacing': [
                2,
                {
                // enforce consistent spacing before and after semicolons
                    'after': true,
                    'before': false
                }
            ],
            'space-before-blocks': [2, 'always'], // enforce consistent spacing before blocks
            'space-before-function-paren': [2, 'never'], // disallow a space before function parenthesis to be in sync with Prettier
            'space-in-parens': [2, 'never'], // enforce consistent spacing inside parentheses
            'space-infix-ops': 2, // require spacing around operators
            'space-unary-ops': [
                2,
                {
                // enforce consistent spacing before or after unary operators
                    'nonwords': false,
                    'words': true
                }
            ],
            'spaced-comment': [
                2,
                'always',
                {
                // enforce consistent spacing after the // or /* in a comment
                    'markers': ['eslint', 'eslint-disable', 'global', 'globals', '*package', '!', ',']
                }
            ],
            'template-curly-spacing': [2, 'never'], // require or disallow spacing around embedded expressions of template strings
            'use-isnan': 2, // require calls to isNaN() when checking for NaN
            'valid-typeof': 2, // enforce comparing typeof expressions against valid strings
            'wrap-iife': [2, 'any'], // require parentheses around immediate function invocations
            'yield-star-spacing': [2, 'both'], // require or disallow spacing around the * in yield* expressions
            'yoda': [2, 'never'], // require or disallow “Yoda” conditions

            // React
            'react/react-in-jsx-scope': 0, // After React 17 importing react is not needed

            // Typescript
            '@typescript-eslint/no-explicit-any': 'off' // Maybe in the future I can remove this
        }
    }
]
