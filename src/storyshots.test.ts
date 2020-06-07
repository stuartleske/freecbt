import initStoryshots from "@storybook/addon-storyshots";
import mockAsyncStorage from "@react-native-community/async-storage/jest/async-storage-mock";

// Various mocks for quieter logging during tests:
//
// * Quiet, StatusBar
jest.useFakeTimers();

// * Quiet, posed. Thanks, https://stackoverflow.com/a/59593847
jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");

// * Quiet, AsyncStorage. https://react-native-community.github.io/async-storage/docs/advanced/jest
jest.mock("@react-native-community/async-storage", () => mockAsyncStorage);

initStoryshots();
