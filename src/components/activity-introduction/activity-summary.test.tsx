import React from "react";
import { ActivitySummary } from "./activity-summary";
import { shallow } from "enzyme";

describe("Activity Summary component", () => {
  it("renders activity intro text", () => {
    const nameText = "activity name text";
    const summaryText = "activity summary text";
    const wrapper = shallow(<ActivitySummary activityName={nameText} introText={summaryText} time={10} imageUrl={null} />);
    expect(wrapper.containsMatchingElement(<h1>{nameText}</h1>)).toEqual(true);
  });
});
