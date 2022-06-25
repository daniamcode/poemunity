import configureStore from './index';

describe('ConfigureStore', () => {
    const env = process.env

    beforeEach(() => {
        // clear cache of required modules to avoid conflicting local states
        jest.resetModules()
        // create a copy of the process.env object
        process.env = { ...env }
    })

    afterEach(() => {
        // now every test will have a clean state
        process.env = env
    })

    test('Should create a store in production', () => {
        process.env.NODE_ENV = 'production'
        const store = configureStore();

        expect(process.env.NODE_ENV).toBe('production');
        expect(store).toBeDefined();
    });

    test('Should create a store in development', () => {
        process.env.NODE_ENV = 'development'
        const store = configureStore();

        expect(process.env.NODE_ENV).toBe('development');
        expect(store).toBeDefined();
    });

    test('Should create a store in test', () => {
        // the environment variable is set to test with the afterEach hook (default value)
        const store = configureStore();

        expect(process.env.NODE_ENV).toBe('test');
        expect(store).toBeDefined();
    });
});