import React from "react";
import { IntroductionEmbeddable } from "./introduction-embeddable";
import { shallow } from "enzyme";

describe("Introduction Embeddable component", () => {
  it("renders component", () => {
    const embeddable = {
      "embeddable": {
        "content": "<p><strong>This is a page with full width layout</strong>.&nbsp;&nbsp;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
        "is_full_width": true,
        "is_hidden": false,
        "name": "",
        "type": "Embeddable::Xhtml",
        "ref_id": "271776-Embeddable::Xhtml"
      },
      "section": "header_block"
    };
    const wrapper = shallow(<IntroductionEmbeddable embeddable={embeddable} questionNumber={1} isPageIntroduction={false} />);
    expect(wrapper.find('[data-cy="introduction-embeddable"]').length).toBe(1);
  });
});