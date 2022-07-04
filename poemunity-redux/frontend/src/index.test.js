import ReactDOM from "react-dom";
import './index'

jest.mock("react-dom", () => ({ render: jest.fn() }));

describe("Application root", () => {
  test("should render", () => {
    const root = document.getElementById('root');
    if(root) {
      expect(ReactDOM.render).toHaveBeenCalled();
    }
  });
});