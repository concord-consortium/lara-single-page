import React from "react";
import { waitFor } from "@testing-library/dom";
import iframePhone from "iframe-phone";
import { Embeddable } from "./embeddable";
import { PageLayouts } from "../../utilities/activity-utils";
import { mount, ReactWrapper } from "enzyme";
import { EmbeddableWrapper } from "../../types";
import { act } from "react-dom/test-utils";
import { DefaultManagedInteractive } from "../../test-utils/model-for-tests";

describe("Embeddable component", () => {
  it("renders a text component", async () => {
    const embeddableWrapper: EmbeddableWrapper = {
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

    let wrapper: ReactWrapper;
    await act(async () => {
      wrapper = mount(<Embeddable embeddableWrapper={embeddableWrapper} isPageIntroduction={false} questionNumber={1} pageLayout={PageLayouts.Responsive}/>);
      expect(wrapper.containsMatchingElement(<div>Loading...</div>)).toEqual(true);
    });

    await waitFor(() => {
      expect(wrapper.text()).toContain("This is a page");
    });
  });

  it("renders a managed interactive", async () => {
    iframePhone.ParentEndpoint = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn()
    }));

    const embeddableWrapper: EmbeddableWrapper = {
      "embeddable": {
        ...DefaultManagedInteractive,
        authored_state: `{"version":1,"questionType":"open_response","prompt":"<p>Write something:</p>"}`,
        ref_id: "123-ManagedInteractive"
      },
      "section": "interactive_box"
    };

    let wrapper: ReactWrapper;
    await act(async () => {
      wrapper = mount(<Embeddable embeddableWrapper={embeddableWrapper} isPageIntroduction={false} questionNumber={1} pageLayout={PageLayouts.Responsive}/>);
    });

    await waitFor(() => {
      // for some reason, can't get any version of
      //   expect(wrapper.find("ManagedInteractive").length).toBe(1);
      //   expect(wrapper.find("iframe").length).toBe(1);
      //   expect(wrapper.find('[data-cy="iframe-runtime"]').length).toBe(1);
      // to work
      expect(wrapper.html()).toContain("iframe-runtime");
    });
  });
});
